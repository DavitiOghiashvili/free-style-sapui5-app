sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "../utils/Formatter",
  "../utils/Constants",
  "sap/ui/core/BusyIndicator",
  "sap/m/MessageToast",
  "sap/ui/core/library",
], (
  Controller,
  JSONModel,
  Filter,
  FilterOperator,
  MessageBox,
  Formatter,
  Constants,
  BusyIndicator,
  MessageToast,
  coreLibrary,
) => {
  "use strict";
  const ValueState = coreLibrary.ValueState;
  return Controller.extend("freestylesapui5app.controller.ListReport", {
    formatter: Formatter,

    onInit() {
      this._oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      this.getView().setModel(
        new JSONModel({
          currencies: [
            { key: Constants.PRICE_CURRENCIES.USD, text: this._oResourceBundle.getText("USD") },
            { key: Constants.PRICE_CURRENCIES.EUR, text: this._oResourceBundle.getText("EUR") }
          ],
          statuses: [
            { key: Constants.PRODUCT_STATUS.OK, text: this._oResourceBundle.getText("OK") },
            { key: Constants.PRODUCT_STATUS.STORAGE, text: this._oResourceBundle.getText("STORAGE") },
            { key: Constants.PRODUCT_STATUS.OUT_OF_STOCK, text: this._oResourceBundle.getText("OUT_OF_STOCK") }
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
      this.oTable = this.getView().byId("idProductsTable");

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

      oModel.read("/Products/$count", {
        filters: aFilters,
        success: (count) => {
          oUiModel.setProperty("/productsCount", count);
        },
        error: (oError) => {
          MessageBox.error(this._oResourceBundle.getText("productCountError"), { details: oError });
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
      const oBinding = this.oTable.getBinding("items");
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
   * Handle products table selection change and enable delete button.
   * @param oEvent item press event.
   * @public
   */
    onProductsTableSelectionChange(oEvent) {
      const oTable = oEvent.getSource();
      const aSelectedContexts = oTable.getSelectedContexts();

      const oDeleteButton = this.byId("idProductDeleteButton");
      oDeleteButton.setEnabled(aSelectedContexts.length > 0);
    },

    /**
     * Product delete button handler.
     * @public
     */
    onDeleteButtonPress() {
      const oModel = this.getOwnerComponent().getModel();
      const aSelectedContexts = this.oTable.getSelectedContexts();
      const oBinding = this.oTable.getBinding("items");

      const handleDeleteSuccess = () => {
        BusyIndicator.hide();
        MessageToast.show(this._oResourceBundle.getText("productDeleteSuccess"));
        this._updateFilteredCount([])
        if (!oBinding.length) {
          oBinding.filter()
        }
        const oDeleteButton = this.byId("idProductDeleteButton");
        oDeleteButton.setEnabled(!aSelectedContexts.length > 0);
      };

      const handleDeleteError = (oError) => {
        BusyIndicator.hide();
        MessageBox.error(this._oResourceBundle.getText("productDeleteError"), {
          details: oError,
        });
      };

      const deleteSelectedContexts = () => {
        BusyIndicator.show();
        aSelectedContexts.forEach((oContext) => {
          const sPath = oContext.getPath();
          oModel.remove(sPath, {
            success: handleDeleteSuccess,
            error: handleDeleteError,
          });
        });
      };

      const handleConfirmClose = (sAction) => {
        if (sAction === MessageBox.Action.OK) {
          deleteSelectedContexts();
        }
      };

      MessageBox.confirm(this._oResourceBundle.getText("confirmDeleteProduct"), {
        onClose: handleConfirmClose,
      });
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
    },

    /**
       * "Create" button event handler in the Store Details footer.
       *  @public
       */
    onCreateProductDialogPress() {
      const oView = this.getView();
      const oMainModel = oView.getModel();

      const generateGuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const oEntryCtx = oMainModel.createEntry("/Products", {
        properties: {
          ID: generateGuid(),
          Name: "",
          Price_amount: "",
          Specs: "",
          Rating: "0",
          SupplierInfo: "",
          MadeIn: "",
          ProductionCompanyName: "",
          Status: Constants.PRODUCT_STATUS.OK,
          Store_ID: "d554e720-870a-4088-9bcb-dce8aecaa047",
        },
      });

      if (!this.oDialog) {
        this.loadFragment({
          name: "freestylesapui5app.view.fragments.CreateProduct",
        }).then((oDialog) => {
          this.oDialog = oDialog;
          this.oDialog.setModel(oMainModel);
          this.oDialog.setBindingContext(oEntryCtx);
          this.oDialog.open();
        });
      } else {
        this.oDialog.setModel(oMainModel);
        this.oDialog.setBindingContext(oEntryCtx);
        this.oDialog.open();
      }
    },

    /**
     * "Cancel" button press event handler (in the dialog).
     *  @public
     */
    onCancelProductDialogPress() {
      const oContext = this.oDialog.getBindingContext();
      const mData = oContext.getObject();
      const oMainModel = this.getView().getModel();

      const resetAndRefresh = () => {
        oMainModel.deleteCreatedEntry(oContext);
        oMainModel.resetChanges();
        this.oDialog.close();
      };

      if (
        mData.Name ||
        mData.Price_amount ||
        mData.Specs ||
        mData.SupplierInfo ||
        mData.MadeIn ||
        mData.ProductionCompanyName
      ) {
        MessageBox.confirm(this._oResourceBundle.getText('inputDataLoss'), {
          onClose: (oAction) => {
            if (oAction === MessageBox.Action.OK) {
              resetAndRefresh();
            }
          }
        });
      } else {
        resetAndRefresh();
      }
    },

    /**
       * Handles product creation
       * @public
       */
    onCreateProductPress() {
      const oView = this.getView();
      const oMainModel = oView.getModel();
      const oContext = this.oDialog.getBindingContext();
      const mData = oContext.getObject();

      const oProductNameInput = oView.byId("createProductNameInput");
      const oPriceAmountInput = oView.byId("createProductPriceInput");
      const oSpecsInput = oView.byId("createProductSpecsInput");
      const oRatingInput = oView.byId("createProductRatingInput");
      const oSupplierInfoInput = oView.byId("createProductSupplierInfoInput");
      const oMadeInInput = oView.byId("createProductMadeInInput");
      const oProdCompanyInput = oView.byId(
        "createProductProductionCompanyNameInput"
      );

      if (
        !mData.Name ||
        !mData.Price_amount ||
        !mData.Specs ||
        !mData.SupplierInfo ||
        !mData.MadeIn ||
        !mData.ProductionCompanyName
      ) {
        MessageBox.error(this._oResourceBundle.getText("mandatoryFieldsMessage"));
        return;
      }

      if (!/^[A-Za-z0-9\s]+$/.test(mData.Name)) {
        oProductNameInput.setValueState(ValueState.Error);
        oProductNameInput.setValueStateText(
          this._oResourceBundle.getText("invalidProductName")
        );
        return;
      }
      if (mData.Name.length > Constants.MAX_NAME_LENGTH) {
        oProductNameInput.setValueState(ValueState.Error);
        oProductNameInput.setValueStateText(
          this._oResourceBundle.getText("nameTooLongMessage")
        );
        return;
      }
      oProductNameInput.setValueState(ValueState.None);

      if (mData.Price_amount < 0) {
        oPriceAmountInput.setValueState(ValueState.Error);
        oPriceAmountInput.setValueStateText(
          this._oResourceBundle.getText("invalidProductPrice")
        );
        return;
      }
      oPriceAmountInput.setValueState(ValueState.None);

      if (mData.Specs.length > Constants.MAX_TEXT_LENGTH) {
        oSpecsInput.setValueState(ValueState.Error);
        oSpecsInput.setValueStateText(
          this._oResourceBundle.getText("specsTooLongMessage")
        );
        return;
      }
      oSpecsInput.setValueState(ValueState.None);

      if (mData.Rating < 0 || mData.Rating > 5) {
        oRatingInput.setValueState(ValueState.Error);
        oRatingInput.setValueStateText(
          this._oResourceBundle.getText("invalidRatingMessage")
        );
        return;
      }
      oRatingInput.setValueState(ValueState.None);

      if (mData.SupplierInfo.length > Constants.MAX_TEXT_LENGTH) {
        oSupplierInfoInput.setValueState(ValueState.Error);
        oSupplierInfoInput.setValueStateText(
          this._oResourceBundle.getText("supplierInfoTooLongMessage")
        );
        return;
      }
      oSupplierInfoInput.setValueState(ValueState.None);

      if (mData.MadeIn.length > Constants.MAX_MADE_IN_LENGTH) {
        oMadeInInput.setValueState(ValueState.Error);
        oMadeInInput.setValueStateText(
          this._oResourceBundle.getText("madeInTooLongMessage")
        );
        return;
      }
      oMadeInInput.setValueState(ValueState.None);

      if (mData.ProductionCompanyName.length > Constants.MAX_COMPANY_LENGTH) {
        oProdCompanyInput.setValueState(ValueState.Error);
        oProdCompanyInput.setValueStateText(
          this._oResourceBundle.getText("prodCompanyTooLongMessage")
        );
        return;
      }
      oProdCompanyInput.setValueState(ValueState.None);

      BusyIndicator.show();

      oMainModel.submitChanges({
        success: () => {
          BusyIndicator.hide();
          MessageToast.show(this._oResourceBundle.getText("productCreateSuccess"));
          this.oDialog.close();
          this._updateFilteredCount([]);
        },
        error: (oError) => {
          BusyIndicator.hide();
          MessageBox.error(this._oResourceBundle.getText("productCreateError"), {
            details: oError,
          });
        },
      });
    },
  });
});