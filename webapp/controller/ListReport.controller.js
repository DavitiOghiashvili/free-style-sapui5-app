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
            { key: Constants.PRODUCT_STATUS.STORAGE, text: oResourceBundle.getText("STORAGE") },
            { key: Constants.PRODUCT_STATUS.OUT_OF_STOCK, text: oResourceBundle.getText("OUT_OF_STOCK") }
          ],
          ratings: [
            { key: Constants.RATING_LENGTH[1], text: '1' },
            { key: Constants.RATING_LENGTH[2], text: '2' },
            { key: Constants.RATING_LENGTH[3], text: '3' },
            { key: Constants.RATING_LENGTH[4], text: '4' },
            { key: Constants.RATING_LENGTH[5], text: '5' },
          ],
          productsCount: 0,
          searchQuery: '',
        }),
        "uiModel"
      );

      // Fetch initial product count
      this._updateFilteredCount([]);

      // Initialize view references
      this.oExpandedLabel = this.getView().byId("idNoFiltersActiveExpandedLabel");
      this.oSnappedLabel = this.getView().byId("idNoFiltersActiveSnappedLabel");
      this.oFilterBar = this.getView().byId("idFilterBar");

      this.oFilterBar.registerGetFiltersWithValues(this._getFiltersWithValues.bind(this));
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
     * Retrieve filter group items with values.
     * @returns {Array} Array of filter group items with selected values
     * @private
     */
    _getFiltersWithValues() {
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
      const oBinding = oTable.getBinding("items");
      const aFilters = [];

      const sQuery = this.getView().getModel("uiModel").getProperty("/searchQuery")
      const textFields = Constants.SEARCH_FILTERS.byText

      if (sQuery) {
        const aTextFieldFilters = textFields.map((field) => {
          return new Filter({
            path: field,
            operator: FilterOperator.Contains,
            caseSensitive: false,
            value1: sQuery
          });
        });

        if (!isNaN(sQuery)) {
          const nQuery = Number(sQuery);
          const maxLength = Constants.MAX_PRICE_QUERY_LENGTH;
          const numDigitsInQuery = sQuery.length;
          const multiplier = Math.pow(10, maxLength - numDigitsInQuery);

          const value1 = nQuery * multiplier;
          const value2 = (nQuery + 1) * multiplier - 1;

          aFilters.push(
            new Filter({
              path: "Price_amount",
              operator: FilterOperator.BT,
              value1: value1,
              value2: value2
            })
          );
        }

        if (!isNaN(sQuery)) {
          aFilters.push(
            new Filter({
              path: "Rating",
              operator: FilterOperator.EQ,
              value1: Number(sQuery)
            })
          );
        }

        aFilters.push(new Filter({
          filters: aTextFieldFilters,
          and: false
        }));
      }

      this.oFilterBar.getFilterGroupItems().forEach((oFilterGroupItem) => {
        const sFieldName = oFilterGroupItem.getName();
        if (sFieldName === 'Search Field') return;

        const oControl = oFilterGroupItem.getControl();
        const aSelectedKeys = oControl.getSelectedKeys();

        if (aSelectedKeys.length > 0) {
          const aFieldFilters = aSelectedKeys.map((sSelectedKey) => {
            return new Filter({
              path: sFieldName,
              operator: sFieldName === "Rating" ? FilterOperator.EQ : FilterOperator.Contains,
              value1: sSelectedKey
            });
          });

          aFilters.push(new Filter({
            filters: aFieldFilters,
            and: false
          }));
        }

      });

      oBinding.filter(aFilters);
      this._updateFilteredCount(aFilters);
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