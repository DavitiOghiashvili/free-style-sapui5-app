sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "../utils/Formatter",
  "../utils/Constants"
], (
  Controller,
  JSONModel,
  Filter,
  FilterOperator,
  MessageBox,
  Formatter,
  Constants
) => {
  "use strict";

  return Controller.extend("freestylesapui5app.controller.ListReport", {
    formatter: Formatter,

    onInit() {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      this.getView().setModel(
        new JSONModel({
          currencies: [
            { key: Constants.PRICE_CURRENCIES.USD, text: oResourceBundle.getText("USD") },
            { key: Constants.PRICE_CURRENCIES.EUR, text: oResourceBundle.getText("EUR") }
          ],
          statuses: [
            { key: Constants.PRODUCT_STATUS.OK, text: oResourceBundle.getText("OK") },
            { key: Constants.PRODUCT_STATUS.STORAGE, text: oResourceBundle.getText("Storage") },
            { key: Constants.PRODUCT_STATUS.OUT_OF_STOCK, text: oResourceBundle.getText("outOfStock") }
          ],
          ratings: [
            { key: Constants.RATING_LENGTH[1], text: '1' },
            { key: Constants.RATING_LENGTH[2], text: '2' },
            { key: Constants.RATING_LENGTH[3], text: '3' },
            { key: Constants.RATING_LENGTH[4], text: '4' },
            { key: Constants.RATING_LENGTH[5], text: '5' },
          ],
          productsCount: 0,
        }),
        "uiModel"
      );

      // Fetch initial product count
      this._updateFilteredCount([]);

      // Initialize view references
      this.oExpandedLabel = this.getView().byId("idNoFiltersActiveExpandedLabel");
      this.oSnappedLabel = this.getView().byId("idNoFiltersActiveSnappedLabel");
      this.oFilterBar = this.getView().byId("idFilterBar");

      this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues.bind(this));
    },

    /**
     * Helper method to fetch filtered count from OData service
     * @param {Array} aFilters - Array of filters to apply
     * @private
     */
    _updateFilteredCount(aFilters) {
      const oModel = this.getOwnerComponent().getModel();
      const oUiModel = this.getView().getModel("uiModel");
      const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

      oModel.read("/Products/$count", {
        filters: aFilters,
        success: (count) => {
          oUiModel.setProperty("/productsCount", count);
        },
        error: (oError) => {
          MessageBox.error(oResourceBundle.getText("productCountError"), { details: oError });
        }
      });
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
          new Filter({ path, operator: FilterOperator.Contains, caseSensitive: false, value1: sQuery })
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
      this._updateFilteredCount(aFilters);
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
     * @public
     */
    onMultiComboBoxSelectionChange() {
      this._updateLabelsAndTable();
    },

    /**
     * Apply filters from FilterBar and update product counts.
     * @public
     */
    onFilterBarSearch() {
      const oTable = this.getView().byId("idProductsTable");
      const aTableFilters = [];

      this.oFilterBar.getFilterGroupItems().forEach((oFilterGroupItem) => {
        const oControl = oFilterGroupItem.getControl();
        const aSelectedKeys = oControl.getSelectedKeys();
        const sFieldName = oFilterGroupItem.getName();

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
      this._updateFilteredCount(aTableFilters);
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
    },

    /**
     * Navigate to item on press.
     * @param oEvent item press event.
     * @public
     */
    onColumnListItemPress(oEvent) {
      const oContext = oEvent.getSource().getBindingContext();
      const sProductId = oContext.getProperty("ID");

      this.getOwnerComponent().getRouter().navTo("ObjectPage", {
        Product_ID: sProductId,
      });
    }
  });
});