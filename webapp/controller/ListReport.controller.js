sap.ui.define(
  [
    'freestylesapui5app/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/MessageBox',
    '../utils/Formatter',
    '../utils/Constants',
    'sap/ui/core/BusyIndicator',
    'sap/m/MessageToast',
    'sap/ui/core/Messaging',
  ],
  (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    Formatter,
    Constants,
    BusyIndicator,
    MessageToast,
    Messaging,
  ) => {
    'use strict';
    return BaseController.extend('freestylesapui5app.controller.ListReport', {
      _oDialog: null,
      _oSelectStoreDialog: null,
      formatter: Formatter,
      _selectedStoreId: null,

      onInit() {
        this.setNamedModel(Messaging.getMessageModel(), 'message');
        Messaging.registerObject(this.getView(), true);

        this.setNamedModel(
          new JSONModel({
            currencies: [
              {
                key: Constants.PRICE_CURRENCIES.USD,
                text: this.getResourceBundleText('USD'),
              },
              {
                key: Constants.PRICE_CURRENCIES.EUR,
                text: this.getResourceBundleText('EUR'),
              },
            ],
            statuses: [
              {
                key: Constants.PRODUCT_STATUS.OK,
                text: this.getResourceBundleText('OK'),
              },
              {
                key: Constants.PRODUCT_STATUS.STORAGE,
                text: this.getResourceBundleText('STORAGE'),
              },
              {
                key: Constants.PRODUCT_STATUS.OUT_OF_STOCK,
                text: this.getResourceBundleText('OUT_OF_STOCK'),
              },
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
          'uiModel',
        );

        // Fetch initial product count
        this._updateFilteredCount([]);

        // Initialize view references
        this._oExpandedLabel = this.getView().byId(
          'idNoFiltersActiveExpandedLabel',
        );
        this._oSnappedLabel = this.getView().byId(
          'idNoFiltersActiveSnappedLabel',
        );
        this._oFilterBar = this.getView().byId('idFilterBar');
        this._oTable = this.getView().byId('idProductsTable');
        this._oProductDeleteButton = this.getView().byId(
          'idProductDeleteButton',
        );

        this._oFilterBar.registerGetFiltersWithValues(
          this._getFiltersWithValues.bind(this),
        );
      },

      /**
       * Fetches filtered count of products from OData service
       * @param {sap.ui.model.Filter[]} aFilters - Array of filters to apply
       * @private
       */
      _updateFilteredCount(aFilters) {
        this.getMainModel().read('/Products/$count', {
          filters: aFilters,
          success: (count) => {
            this.getNamedModel('uiModel').setProperty('/productsCount', count);
          },
          error: (oError) => {
            MessageBox.error(this.getResourceBundleText('productCountError'), {
              details: oError,
            });
          },
        });
      },

      /**
       * Retrieve filter group items that have selected values.
       * @returns {Array<FilterGroupItem>} Array of FilterGroupItem objects whose controls have one or more selected keys
       * @private
       */
      _getFiltersWithValues() {
        const aFiltersWithValue = this._oFilterBar
          .getFilterGroupItems()
          .reduce((aResult, oFilterGroupItem) => {
            const oControl = oFilterGroupItem.getControl();
            if (oControl.getSelectedKeys().length) {
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
        const oBinding = this._oTable.getBinding('items');
        const aFilters = [];

        const sQuery =
          this.getNamedModel('uiModel').getProperty('/searchQuery');
        const textFields = Constants.SEARCH_FILTERS.byText;

        if (sQuery) {
          const aTextFieldFilters = textFields.map((field) => {
            return new Filter({
              path: field,
              operator: FilterOperator.Contains,
              caseSensitive: false,
              value1: sQuery,
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
                path: 'Price_amount',
                operator: FilterOperator.BT,
                value1: value1,
                value2: value2,
              }),
            );
          }

          if (!isNaN(sQuery)) {
            aFilters.push(
              new Filter({
                path: 'Rating',
                operator: FilterOperator.EQ,
                value1: Number(sQuery),
              }),
            );
          }

          aFilters.push(
            new Filter({
              filters: aTextFieldFilters,
              and: false,
            }),
          );
        }

        this._oFilterBar.getFilterGroupItems().forEach((oFilterGroupItem) => {
          const sFieldName = oFilterGroupItem.getName();
          if (sFieldName === 'Search Field') return;

          const oControl = oFilterGroupItem.getControl();
          const aSelectedKeys = oControl.getSelectedKeys();

          if (aSelectedKeys.length) {
            const aFieldFilters = aSelectedKeys.map((sSelectedKey) => {
              return new Filter({
                path: sFieldName,
                operator:
                  sFieldName === 'Rating'
                    ? FilterOperator.EQ
                    : FilterOperator.Contains,
                value1: sSelectedKey,
              });
            });

            aFilters.push(
              new Filter({
                filters: aFieldFilters,
                and: false,
              }),
            );
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
        this._oExpandedLabel.setText(
          Formatter.getFormattedSummaryTextExpanded(this._oFilterBar),
        );
        this._oSnappedLabel.setText(
          Formatter.getFormattedSummaryText(this._oFilterBar),
        );
      },

      /**
       * Navigate to item on press.
       * @param {sap.ui.base.Event} oEvent The press event from the list item.
       * @public
       */
      onColumnListItemPress(oEvent) {
        const oContext = oEvent.getSource().getBindingContext();
        const sProductId = oContext.getProperty('ID');

        this.navToWithParameters('ObjectPage', {
          Product_ID: sProductId,
        });
      },

      /**
       * Handle products table selection change and enable delete button.
       * @param {sap.ui.base.Event} oEvent The press event from the products table.
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
        const aSelectedContexts = this._oTable.getSelectedContexts();
        const iSelectedCount = aSelectedContexts.length;
        const oBinding = this._oTable.getBinding('items');

        const handleDeleteSuccess = () => {
          BusyIndicator.hide();
          const sSuccessMsg =
            iSelectedCount === 1
              ? this.getResourceBundleText('productDeleteSuccessSingular')
              : this.getResourceBundleTextWithParam(
                'productDeleteSuccessPlural',
                [iSelectedCount],
              );
          MessageToast.show(sSuccessMsg);
          this._oProductDeleteButton.setEnabled(false);
        };

        const handleDeleteError = (oError) => {
          BusyIndicator.hide();
          MessageBox.error(this.getResourceBundleText('productDeleteError'), {
            details: oError,
          });
        };

        const deleteSelectedContexts = () => {
          BusyIndicator.show();
          aSelectedContexts.forEach((oContext) => {
            const sPath = oContext.getPath();
            this.getModel().remove(sPath, {
              success: handleDeleteSuccess,
              error: handleDeleteError,
            });

            if (!oBinding.length) {
              oBinding.filter();
            }
            this._updateFilteredCount([]);
          });
        };

        const handleConfirmClose = (sAction) => {
          if (sAction === MessageBox.Action.OK) {
            deleteSelectedContexts();
          }
        };

        const sConfirmMsg =
          iSelectedCount === 1
            ? this.getResourceBundleText('confirmDeleteProductSingular')
            : this.getResourceBundleTextWithParam(
              'confirmDeleteProductPlural',
              [iSelectedCount],
            );

        MessageBox.confirm(sConfirmMsg, {
          onClose: handleConfirmClose,
        });
      },

      /**
       * Handles pressing the "Create Product" button.
       * Initializes product context and opens the dialog.
       * @public
       */
      async onCreateProductDialogPress() {
        const oEntryCtx = this.getModel().createEntry('/Products', {
          properties: {
            ID: '',
            Name: '',
            Price_amount: '',
            Specs: '',
            Rating: '0',
            SupplierInfo: '',
            MadeIn: '',
            ProductionCompanyName: '',
            Status: Constants.PRODUCT_STATUS.OK,
            Store_ID: '',
          },
        });

        const oDialog = await this._loadCreateProductDialog();
        oDialog.setModel(this.getModel());
        oDialog.setBindingContext(oEntryCtx);
        oDialog.open();
      },

      /**
       * Loads the create product dialog fragment if not already loaded.
       * @private
       * @returns {Promise<sap.m.Dialog>} The loaded dialog instance
       * @type {sap.m.Dialog}
       */
      async _loadCreateProductDialog() {
        this._oDialog ??= await this.loadFragment({
          name: 'freestylesapui5app.view.fragments.CreateProduct',
        });
        return this._oDialog;
      },

      /**
       * Handles press on the "Select Store" button.
       * Opens the SelectStore dialog fragment.
       * @public
       */
      async onSelectStoreButtonPress() {
        const oDialog = await this._loadSelectStoreDialog();
        oDialog.open();
      },

      /**
       * Loads the SelectStore dialog fragment if not already loaded.
       * @private
       * @returns {Promise<sap.m.Dialog>} The loaded dialog instance
       * @type {sap.m.Dialog}
       */
      async _loadSelectStoreDialog() {
        this._oSelectStoreDialog ??= await this.loadFragment({
          name: 'freestylesapui5app.view.fragments.SelectStore',
        });
        return this._oSelectStoreDialog;
      },

      /**
       * Handles the search logic for the stores SelectDialog in the create product dialog.
       * @param {sap.ui.base.Event} oEvent The search event from the SelectDialog.
       * @public
       */
      onStoresSelectDialogSearch(oEvent) {
        const sValue = oEvent.getParameter('value');
        const oFilter = new Filter({
          path: 'Name',
          operator: FilterOperator.Contains,
          caseSensitive: false,
          value1: sValue,
        });

        const oBinding = oEvent.getParameter('itemsBinding');
        oBinding.filter([oFilter]);
      },

      /**
       * Handles the close event of the "Select Store" dialog in the product creation dialog.
       * @param {sap.ui.base.Event} oEvent The close event containing the selected store contexts.
       * @public
       */
      onStoresDialogClose(oEvent) {
        const aContexts = oEvent.getParameter('selectedContexts');
        if (aContexts.length) {
          this._selectedStoreId = aContexts[0].getObject().ID;
          MessageToast.show(
            this.getResourceBundleText('chosenStore') +
            aContexts[0].getObject().Name,
          );
        }

        oEvent.getSource().getBinding('items').filter([]);

        const oContext = this._oDialog.getBindingContext();
        const sPath = oContext.getPath();
        this.getModel().setProperty(sPath + '/Store_ID', this._selectedStoreId);
      },

      /**
       * "Cancel" button press event handler (in the product creation dialog).
       *  @public
       */
      onCancelButtonPress() {
        const oContext = this._oDialog.getBindingContext();
        const mData = oContext.getObject();

        const resetAndRefresh = () => {
          this.getModel().resetChanges();
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
          MessageBox.confirm(this.getResourceBundleText('inputDataLoss'), {
            onClose: (oAction) => {
              if (oAction === MessageBox.Action.OK) {
                resetAndRefresh();
              }
            },
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
        const oContext = this._oDialog.getBindingContext();
        const mData = oContext.getObject();
        const oBinding = this._oTable.getBinding('items');

        Messaging.removeAllMessages();

        if (!mData.Name || !mData.Price_amount || !mData.Specs) {
          this.getModel().setRefreshAfterChange(false);
          this.getModel().submitChanges({});
        } else if (!this._selectedStoreId) {
          this.getModel().setRefreshAfterChange(false);
          this.getModel().submitChanges({});
          MessageToast.show(this.getResourceBundleText('storeSelectError'));
        } else {
          this.getModel().setRefreshAfterChange(true);
          mData.Store_ID = this._selectedStoreId;
          this.getModel().submitChanges({
            success: () => {
              MessageToast.show(
                this.getResourceBundleText('productCreateSuccess'),
              );
              this._oDialog.close();
              this._updateFilteredCount([]);
              if (oBinding) {
                oBinding.refresh(true);
              }
              Messaging.removeAllMessages();
              this._selectedStoreId = null;
            },
            error: (oError) => {
              MessageBox.error(
                this.getResourceBundleText('productCreateError'),
                {
                  details: oError,
                },
              );
            },
          });
        }
      },
    });
  },
);
