sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/comp/smartvariants/PersonalizableInfo",
  "sap/m/MessageBox",
  "../utils/Formatter",
  "../utils/Constants"
], (
  Controller,
  JSONModel,
  Filter,
  FilterOperator,
  PersonalizableInfo,
  MessageBox,
  Formatter,
  Constants
) => {
  "use strict";

  return Controller.extend("freestylesapui5app.controller.ListReport", {
    onInit() {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      this.getView().setModel(
        new JSONModel({
          countAll: 0,
          ok: 0,
          storage: 0,
          outOfStock: 0
        }),
        "productCount"
      );

      this.getView().setModel(
        new JSONModel({
          currencies: [
            { key: Constants.CURRENCIES.USD, text: oResourceBundle.getText("USD") },
            { key: Constants.CURRENCIES.EUR, text: oResourceBundle.getText("EUR") }
          ]
        }),
        "currencyModel"
      );

      this.getView().setModel(
        new JSONModel({
          statuses: [
            { key: Constants.PRODUCT_STATUS.OK, text: oResourceBundle.getText("OK") },
            { key: Constants.PRODUCT_STATUS.STORAGE, text: oResourceBundle.getText("Storage") },
            { key: Constants.PRODUCT_STATUS.OUT_OF_STOCK, text: oResourceBundle.getText("outOfStock") }
          ]
        }),
        "statusModel"
      );

      // Fetch initial product count
      const oModel = this.getOwnerComponent().getModel();
      const oCountModel = this.getView().getModel("productCount");
      oModel.read("/Products/$count", {
        success: (count) => oCountModel.setProperty("/countAll", count),
        error: (oError) => MessageBox.error(oResourceBundle.getText("productCountError"), { details: oError })
      });

      // Initialize view references
      this.oSmartVariantManagement = this.getView().byId("idSmartVariantManagement");
      this.oExpandedLabel = this.getView().byId("idNoFiltersActiveExpandedLabel");
      this.oSnappedLabel = this.getView().byId("idNoFiltersActiveSnappedLabel");
      this.oFilterBar = this.getView().byId("idFilterBar");

      // Bind variant management methods
      this.oFilterBar.registerFetchData(this.fetchData.bind(this));
      this.oFilterBar.registerApplyData(this.applyData.bind(this));
      this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues.bind(this));

      // Configure variant management
      const oPersInfo = new PersonalizableInfo({
        type: "filterBar",
        keyName: "ProductsFilterBar",
        control: this.oFilterBar
      });
      this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
      this.oSmartVariantManagement.initialise(() => { }, this.oFilterBar);
    },

    /**
     * Handle search input to filter table items.
     * @param oEvent - Search field event
     * @public
     */
    onSearchFieldSearch(oEvent) {
      const sQuery = oEvent.getParameter("query").trim();
      const oTable = this.byId("idProductsTable");
      const oBinding = oTable.getBinding("items");
      const aFilters = [];

      if (sQuery) {
        const textFields = ["Name", "Specs", "SupplierInfo", "MadeIn", "ProductionCompanyName"];
        const textFilters = textFields.map(path =>
          new Filter({ path, operator: FilterOperator.Contains, value1: sQuery })
        );

        if (!isNaN(sQuery)) {
          const nQuery = Number(sQuery);
          const maxLength = Constants.MAX_PRICE_QUERY_LENGTH;
          const numDigitsInQuery = sQuery.length;
          const multiplier = Math.pow(10, maxLength - numDigitsInQuery);

          const value1 = nQuery * multiplier;
          const value2 = (nQuery + 1) * multiplier - 1;

          textFilters.push(
            new Filter({
              path: "Price_amount",
              operator: FilterOperator.BT,
              value1: value1,
              value2: value2
            })
          );
        }

        if (!isNaN(sQuery)) {
          textFilters.push(
            new Filter({
              path: "Rating",
              operator: FilterOperator.EQ,
              value1: Number(sQuery)
            })
          );
        }

        aFilters.push(new Filter({ filters: textFilters, and: false }));
      }

      oBinding.filter(aFilters);
    },

    /**
     * Fetch filter data for variant management.
     * @returns {Array} Array of filter data objects
     * @public
     */
    fetchData() {
      const aData = this.oFilterBar.getAllFilterItems().reduce((aResult, oFilterItem) => {
        aResult.push({
          groupName: oFilterItem.getGroupName(),
          fieldName: oFilterItem.getName(),
          fieldData: oFilterItem.getControl().getSelectedKeys()
        });
        return aResult;
      }, []);

      return aData;
    },

    /**
     * Apply filter data from variant management.
     * @param {Array} aData - Array of filter data objects
     * @public
     */
    applyData(aData) {
      aData.forEach((oDataObject) => {
        const oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
        oControl.setSelectedKeys(oDataObject.fieldData);
      }, this);
    },

    /**
     * Retrieve filter group items with values.
     * @returns {Array} Array of filter group items with selected values
     * @public
     */
    getFiltersWithValues() {
      const aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce((aResult, oFilterGroupItem) => {
        const oControl = oFilterGroupItem.getControl();
        if (oControl.getSelectedKeys().length > 0) {
          aResult.push(oFilterGroupItem);
        }
        return aResult;
      }, []);

      return aFiltersWithValue;
    },

    /**
     * Handle MultiComboBox selection changes and trigger variant modification.
     * @param oEvent - Selection change event
     * @public
     */
    onMultiComboBoxSelectionChange(oEvent) {
      this.oSmartVariantManagement.currentVariantSetModified(true);
      this.oFilterBar.fireFilterChange(oEvent);
    },

    /**
     * Apply filters from FilterBar and update product counts.
     * @public
     */
    onFilterBarSearch() {
      const oTable = this.getView().byId("idProductsTable");
      const oModel = this.getOwnerComponent().getModel();
      const oCountModel = this.getView().getModel("productCount");
      let aTableFilters = [];
      let selectedStatusKeys = [];

      this.oFilterBar.getFilterGroupItems().forEach((oFilterGroupItem) => {
        const oControl = oFilterGroupItem.getControl();
        const aSelectedKeys = oControl.getSelectedKeys();
        const sFieldName = oFilterGroupItem.getName();

        if (sFieldName === "Status") {
          selectedStatusKeys = aSelectedKeys;
        }

        if (aSelectedKeys.length > 0) {
          const aFilters = aSelectedKeys.map((sSelectedKey) => {
            return new Filter({
              path: sFieldName,
              operator: sFieldName === "Rating" ? FilterOperator.EQ : FilterOperator.Contains,
              value1: sSelectedKey
            });
          });

          aTableFilters.push(new Filter({
            filters: aFilters,
            and: false
          }));
        }
      });

      oTable.getBinding("items").filter(aTableFilters);
      oTable.setShowOverlay(false);

      oCountModel.setData({
        countAll: oCountModel.getProperty("/countAll"),
        ok: 0,
        storage: 0,
        outOfStock: 0
      });

      selectedStatusKeys.forEach((statusKey) => {
        oModel.read("/Products/$count", {
          urlParameters: {
            "$filter": `Status eq '${statusKey}'`
          },
          success: (count) => {
            if (statusKey === Constants.PRODUCT_STATUS.OK) {
              oCountModel.setProperty("/ok", count);
            } else if (statusKey === Constants.PRODUCT_STATUS.STORAGE) {
              oCountModel.setProperty("/storage", count);
            } else if (statusKey === Constants.PRODUCT_STATUS.OUT_OF_STOCK) {
              oCountModel.setProperty("/outOfStock", count);
            }
          },
          error: (oError) => MessageBox.error(oResourceBundle.getText("productCountError"), { details: oError })
        });
      });
    },

    /**
     * Format product counts for display.
     * @param {number} countAll - Total product count
     * @param {number} ok - Count of products with OK status
     * @param {number} storage - Count of products in storage
     * @param {number} outOfStock - Count of out-of-stock products
     * @returns {string} Formatted product count string
     * @public
     */
    formatProductCounts(countAll, ok, storage, outOfStock) {
      return Formatter.formatProductCounts(countAll, ok, storage, outOfStock);
    },

    /**
     * Handle filter changes and update labels and table.
     * @public
     */
    onFilterBarFilterChange() {
      this._updateLabelsAndTable();
    },

    /**
     * Handle variant load and update labels and table.
     * @public
     */
    onFilterBarAfterVariantLoad() {
      this._updateLabelsAndTable();
    },

    /**
     * Update filter labels and table based on current filter state.
     * @private
     */
    _updateLabelsAndTable() {
      this.oExpandedLabel.setText(Formatter.getFormattedSummaryTextExpanded(this.oFilterBar));
      this.oSnappedLabel.setText(Formatter.getFormattedSummaryText(this.oFilterBar));
    }
  });
});