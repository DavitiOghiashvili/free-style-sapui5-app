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

  const { ValueState } = coreLibrary

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
      this._oExpandedLabel = this.getView().byId("idNoFiltersActiveExpandedLabel");
      this._oSnappedLabel = this.getView().byId("idNoFiltersActiveSnappedLabel");
      this._oFilterBar = this.getView().byId("idFilterBar");
      this._oTable = this.getView().byId("idProductsTable");
      this._oProductDeleteButton = this.getView().byId("idProductDeleteButton")

      this._oFilterBar.registerGetFiltersWithValues(this._getFiltersWithValues.bind(this));
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
      const aFiltersWithValue = this._oFilterBar.getFilterGroupItems().reduce((aResult, oFilterGroupItem) => {
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
      const oBinding = this._oTable.getBinding("items");
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

      this._oFilterBar.getFilterGroupItems().forEach((oFilterGroupItem) => {
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
      this._oExpandedLabel.setText(Formatter.getFormattedSummaryTextExpanded(this._oFilterBar));
      this._oSnappedLabel.setText(Formatter.getFormattedSummaryText(this._oFilterBar));
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
     * Handle products table selection change and enable delete button.
     * @param oEvent item press event.
     * @public
     */
    onProductsTableSelectionChange(oEvent) {
      const oTable = oEvent.getSource();
      const aSelectedContexts = oTable.getSelectedContexts();

      this._oProductDeleteButton.setEnabled(aSelectedContexts.length > 0);
    },

    /**
     * Product delete button handler.
     * @public
     */
    onDeleteButtonPress() {
      const oModel = this.getOwnerComponent().getModel();
      const aSelectedContexts = this._oTable.getSelectedContexts();
      const iSelectedCount = aSelectedContexts.length;
      const oBinding = this._oTable.getBinding('items')

      const handleDeleteSuccess = () => {
        BusyIndicator.hide();
        const sSuccessMsg = iSelectedCount === 1
          ? this._oResourceBundle.getText("productDeleteSuccessSingular")
          : this._oResourceBundle.getText("productDeleteSuccessPlural", [iSelectedCount]);
        MessageToast.show(sSuccessMsg);
        this._oProductDeleteButton.setEnabled(false)
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

          if (!oBinding.length) {
            oBinding.filter()
          }
          this._updateFilteredCount([])
        });
      };

      const handleConfirmClose = (sAction) => {
        if (sAction === MessageBox.Action.OK) {
          deleteSelectedContexts();
        }
      };

      const sConfirmMsg = iSelectedCount === 1
        ? this._oResourceBundle.getText("confirmDeleteProductSingular")
        : this._oResourceBundle.getText("confirmDeleteProductPlural", [iSelectedCount]);

      MessageBox.confirm(sConfirmMsg, {
        onClose: handleConfirmClose,
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

      if (!this._oDialog) {
        this.loadFragment({
          name: "freestylesapui5app.view.fragments.CreateProduct",
        }).then((oDialog) => {
          this._oDialog = oDialog;
          this._oDialog.setModel(oMainModel);
          this._oDialog.setBindingContext(oEntryCtx);
          this._oDialog.open();
        });
      } else {
        this._oDialog.setModel(oMainModel);
        this._oDialog.setBindingContext(oEntryCtx);
        this._oDialog.open();
      }
    },

    /**
     * "Cancel" button press event handler (in the dialog).
     *  @public
     */
    onCancelButtonPress() {
      const oContext = this._oDialog.getBindingContext();
      const mData = oContext.getObject();
      const oMainModel = this.getView().getModel();

      const resetAndRefresh = () => {
        oMainModel.deleteCreatedEntry(oContext);
        oMainModel.resetChanges();
        this._oDialog.close();
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
       * Handles product creation and it's validation
       * @public
       */
    onCreateButtonPress() {
      const oView = this.getView();
      const oMainModel = oView.getModel();
      const oUiModel = oView.getModel('uiModel');
      const oContext = this._oDialog.getBindingContext();
      const mData = oContext.getObject();
      const rb = this._oResourceBundle;

      let validationFailed = false;

      const fields = [
        {
          id: "idNameInput",
          value: mData.Name,
          required: true,
          validate: (val) => /^[A-Za-z0-9\s]+$/.test(val) && val.length <= Constants.MAX_NAME_LENGTH,
          getErrorText: (val) => {
            if (!/^[A-Za-z0-9\s]+$/.test(val)) {
              return rb.getText("invalidProductName");
            }
            if (val.length > Constants.MAX_NAME_LENGTH) {
              return rb.getText("nameTooLongMessage");
            }
          },
        },
        {
          id: "idPriceAmountInput",
          value: mData.Price_amount,
          required: true,
          validate: (val) => val >= 0,
          getErrorText: () => rb.getText("invalidProductPrice"),
        },
        {
          id: "idSpecsInput",
          value: mData.Specs,
          required: true,
          validate: (val) => val.length <= Constants.MAX_TEXT_LENGTH,
          getErrorText: () => rb.getText("specsTooLongMessage"),
        },
        {
          id: "idRatingStepInput",
          value: mData.Rating,
          required: false,
          validate: (val) => val === undefined || (val >= 0 && val <= 5),
          getErrorText: () => rb.getText("invalidRatingMessage"),
        },
        {
          id: "idSupplierInfoInput",
          value: mData.SupplierInfo,
          required: false,
          validate: (val) => val.length <= Constants.MAX_TEXT_LENGTH,
          getErrorText: () => rb.getText("supplierInfoTooLongMessage"),
        },
        {
          id: "idMadeInInput",
          value: mData.MadeIn,
          required: false,
          validate: (val) => val.length <= Constants.MAX_MADE_IN_LENGTH,
          getErrorText: () => rb.getText("madeInTooLongMessage"),
        },
        {
          id: "idProductionCompanyNameInput",
          value: mData.ProductionCompanyName,
          required: false,
          validate: (val) => val.length <= Constants.MAX_COMPANY_LENGTH,
          getErrorText: () => rb.getText("prodCompanyTooLongMessage"),
        }
      ];

      fields.forEach((field) => {
        if (validationFailed) return;

        const oInput = oView.byId(field.id);
        const value = field.value;
        const isEmpty = value === undefined || value === null || value === "";

        if (field.required && isEmpty) {
          oInput.setValueState(ValueState.Error);
          oInput.setValueStateText(rb.getText("mandatoryFieldsMessage"));
          oInput.focus();
          validationFailed = true;
          return;
        }

        if (!field.required && isEmpty) {
          oInput.setValueState(ValueState.None);
          return;
        }

        if (!field.validate(value)) {
          oInput.setValueState(ValueState.Error);
          oInput.setValueStateText(field.getErrorText(value));
          oInput.focus();
          validationFailed = true;
          return; z
        }

        oInput.setValueState(ValueState.None);
      });

      if (validationFailed) return;

      BusyIndicator.show();

      oMainModel.submitChanges({
        success: () => {
          BusyIndicator.hide();
          MessageToast.show(rb.getText("productCreateSuccess"));
          this._oDialog.close();
        },
        error: (oError) => {
          BusyIndicator.hide();
          MessageBox.error(rb.getText("productCreateError"), {
            details: oError,
          });
        },
      });

      this._oDialog.attachAfterClose(() => {
        oMainModel.read("/Products/$count", {
          success: (count) => {
            oUiModel.setProperty("/productsCount", count);
          },
          error: (oError) => {
            MessageBox.error(rb.getText("productCountError"), {
              details: oError
            });
          }
        });
      });
    },
  });
});