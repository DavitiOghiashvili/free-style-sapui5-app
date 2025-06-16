sap.ui.define(
  [
    'freestylesapui5app/controller/BaseController',
    'freestylesapui5app/utils/Formatter',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/BusyIndicator',
    'sap/ui/core/Fragment',
    'sap/ui/model/json/JSONModel',
    'freestylesapui5app/utils/Constants',
    'sap/ui/core/Messaging',
    'sap/ui/core/message/Message',
    'sap/ui/core/message/MessageType',
    'sap/ui/core/library',
  ],
  function (
    BaseController,
    Formatter,
    MessageBox,
    MessageToast,
    BusyIndicator,
    Fragment,
    JSONModel,
    Constants,
    Messaging,
    Message,
    MessageType,
    coreLibrary,
  ) {
    'use strict';

    const { ValueState } = coreLibrary;

    return BaseController.extend('freestylesapui5app.controller.ObjectPage', {
      // Formatter referenced in fragments for date text formatting
      formatter: Formatter,
      _oMessagePopover: null,

      // Constants for repeated UI elements
      _UI_IDS: {
        NEW_COMMENT_ROW: 'idHBox',
        SAVE_COMMENT_BUTTON: 'idSaveNewCommentButton',
        ADD_COMMENT_BUTTON: 'idAddNewCommentButton',
        CANCEL_COMMENT_BUTTON: 'idCancelNewCommentButton',
        EDIT_BUTTON: 'idEditButton',
        SAVE_BUTTON: 'idSaveButton',
        CANCEL_BUTTON: 'idCancelButton',
        DELETE_BUTTON: 'idDeleteButton',
      },

      /**
       * Initializes the controller, sets up routing, and prepares the UI model
       * @public
       */
      onInit() {
        this.getRoute('ObjectPage').attachPatternMatched(
          this._onRouteMatched,
          this,
        );

        this._objectPage = this.getView().byId('idObjectPage');
        this._formFragments = {};
        this._showFormFragment(Constants.FRAGMENTS.DISPLAY_PRODUCT);

        this.setNamedModel(
          new JSONModel({
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
            toggleFooterVisibility: false,
            toggleEditButton: true,
          }),
          'uiModel',
        );

        this.setNamedModel(Messaging.getMessageModel(), 'message');
        Messaging.registerObject(this.getView(), true);
      },

      /**
       * Handles route pattern matching and binds the view to the product context, resets controls and messages
       * @private
       * @param {sap.ui.base.Event} oEvent - The route matched event
       */
      _onRouteMatched(oEvent) {
        const sProductId = oEvent.getParameter('arguments').Product_ID;

        const sKey = this.getModel().createKey('/Products', {
          ID: sProductId,
        });

        this.getView().bindElement({
          path: sKey,
        });

        this.getModel().resetChanges();
        this._toggleButtonsAndView(false);
        this._resetCommentControls();
        Messaging.removeAllMessages();
      },

      /**
       * Displays the specified form fragment
       * @private
       * @param {string} sFragmentName - The name of the fragment to display
       */
      _showFormFragment(sFragmentName) {
        const currentFragment = this._objectPage.getContent()[0];

        if (currentFragment?.getMetadata().getName().includes(sFragmentName)) {
          return;
        }

        this._getFormFragment(sFragmentName).then((oFragment) => {
          this._objectPage.removeAllContent();
          this._objectPage.insertContent(oFragment, 0);
        });
      },

      /**
       * Loads the specified form fragment
       * @private
       * @param {string} sFragmentName - The name of the fragment to display
       */
      _getFormFragment(sFragmentName) {
        const sFragmentPath =
          'freestylesapui5app.view.fragments.' + sFragmentName;

        if (!this._formFragments[sFragmentName]) {
          this._formFragments[sFragmentName] = Fragment.load({
            id: this.getView().getId(),
            name: sFragmentPath,
            controller: this,
          });
        }

        return this._formFragments[sFragmentName];
      },

      /**
       * Enters edit mode for the product and comments
       * @public
       */
      onEditButtonPress() {
        this._toggleButtonsAndView(true);
      },

      /**
       * Retrieves current user name with Function Import form metadata.
       * @public
       */
      onInvokeFunctionFromMetadataButtonPress() {
        this.getModel().callFunction("/mutate", {
          method: "POST",
          urlParameters: {
            param: "'param'"
          },
          success(oData) {
            MessageToast.show(JSON.stringify(oData.mutate));
          },
          error(oError) {
            console.error("Error calling function import:", oError);
          }
        });
      },

      /**
       * Cancels editing with confirmation for unsaved changes
       * @public
       */
      onCancelButtonPress() {
        if (this.getModel().hasPendingChanges()) {
          MessageBox.confirm(this.getResourceBundleText('inputDataLoss'), {
            onClose: (oAction) => {
              if (oAction === MessageBox.Action.OK) {
                this.getModel().resetChanges();
                this._toggleButtonsAndView(false);
                Messaging.removeAllMessages();
              }
            },
          });
        } else {
          this._toggleButtonsAndView(false);
        }
      },

      /**
       * Opens the message popover.
       * @private
       * @param {sap.ui.base.Event} oEvent - Click event on the button.
       */
      async onMessagePopoverButtonPress(oEvent) {
        const oMessagePopover = await this._getMessagePopover();
        oMessagePopover.toggle(oEvent.getSource());
      },

      /**
       * Loads the message popover fragment if not already loaded.
       * @private
       * @returns {Promise<sap.m.MessagePopover>} The message popover instance.
       * @type {sap.m.MessagePopover}
       */
      async _getMessagePopover() {
        this._oMessagePopover ??= await this.loadFragment({
          name: 'freestylesapui5app.view.fragments.MessagePopover',
        });
        return this._oMessagePopover;
      },

      /**
       * Retrieves fragment control by ID
       * @private
       * @param {string} sId - The ID of the fragment control
       * @returns {sap.ui.core.Control} The fragment control
       */
      _getFragmentControl(sId) {
        if (!this._fragmentControls) {
          this._fragmentControls = {};
        }

        if (!this._fragmentControls[sId]) {
          this._fragmentControls[sId] = Fragment.byId(
            this.getView().getId(),
            sId,
          );
        }

        return this._fragmentControls[sId];
      },

      /**
       * Initiates the process to add a new comment
       * @public
       */
      onAddCommentPress() {
        const sProductId = this.getView().getBindingContext().getProperty('ID');

        const oEntryCtx = this.getModel().createEntry('/ProductComments', {
          properties: {
            Author: '',
            Message: '',
            Rating: '0',
            Posted: new Date(),
            Product_ID: sProductId,
          },
        });

        this._getFragmentControl(
          this._UI_IDS.NEW_COMMENT_ROW,
        ).setBindingContext(oEntryCtx);
        this._toggleCommentControls(true);
      },

      /**
       * Toggles visibility of comment section controls
       * @private
       * @param {boolean} bShow - Whether to show or hide the comment controls
       */
      _toggleCommentControls(bShow) {
        this.getNamedModel('uiModel').setProperty(
          '/toggleFooterVisibility',
          bShow,
        );
        this.getNamedModel('uiModel').setProperty('/toggleEditButton', false);

        this._getFragmentControl(this._UI_IDS.NEW_COMMENT_ROW).setVisible(
          bShow,
        );
        this._getFragmentControl(this._UI_IDS.SAVE_COMMENT_BUTTON).setVisible(
          bShow,
        );
        this._getFragmentControl(this._UI_IDS.ADD_COMMENT_BUTTON).setVisible(
          !bShow,
        );
        this._getFragmentControl(this._UI_IDS.CANCEL_COMMENT_BUTTON).setVisible(
          bShow,
        );
      },

      /**
       * Cancels the creation of a new comment
       * @public
       */
      onCancelNewCommentButtonPress() {
        if (this.getModel().hasPendingChanges()) {
          MessageBox.confirm(this.getResourceBundleText('inputDataLoss'), {
            onClose: (oAction) => {
              if (oAction === MessageBox.Action.OK) {
                this.getModel().resetChanges();
                Messaging.removeAllMessages();
                this._resetCommentControls();
                this.getNamedModel('uiModel').setProperty(
                  '/toggleEditButton',
                  true,
                );
              }
            },
          });
          Messaging.removeAllMessages();
        } else {
          this.getModel().resetChanges();
          this._resetCommentControls();
        }
      },

      /**
       * Saves a new comment after validation
       * @public
       */
      onSaveNewCommentButtonPress: function () {
        const oCommentCtx = this._getFragmentControl(
          this._UI_IDS.NEW_COMMENT_ROW,
        ).getBindingContext();
        const mData = oCommentCtx.getObject();

        Messaging.removeAllMessages();

        if (!mData.Author || !mData.Message) {
          this.getModel().setRefreshAfterChange(false);
          this.getModel().submitChanges({});
        } else {
          this.getModel().setRefreshAfterChange(true);
          this.getModel().submitChanges({
            success: () => {
              MessageToast.show(
                this.getResourceBundleText('commentPostSuccess'),
              );
              Messaging.removeAllMessages();
              this._toggleCommentControls(false);
              this.getNamedModel('uiModel').setProperty(
                '/toggleEditButton',
                true,
              );
            },
            error: (oError) => {
              MessageBox.error(this.getResourceBundleText('commentPostError'), {
                details: oError,
              });
            },
          });
        }
      },

      /**
       * Resets comment input controls to their initial state
       * @private
       */
      _resetCommentControls() {
        this._getFragmentControl(this._UI_IDS.NEW_COMMENT_ROW).setVisible(
          false,
        );
        this._getFragmentControl(this._UI_IDS.SAVE_COMMENT_BUTTON).setVisible(
          false,
        );
        this._getFragmentControl(this._UI_IDS.ADD_COMMENT_BUTTON).setVisible(
          true,
        );
        this._getFragmentControl(this._UI_IDS.CANCEL_COMMENT_BUTTON).setVisible(
          false,
        );
      },

      /**
       * Navigates to the chart page on list item press
       * @public
       */
      onColumnListItemPress() {
        this.navTo('ObjectChartPage');
      },

      /**
       * Initiates product deletion with confirmation
       * @public
       */
      onDeleteButtonPress() {
        const oCtx = this.getView().getBindingContext();
        const sKey = this.getModel().createKey('/Products', oCtx.getObject());

        MessageBox.confirm(
          this.getResourceBundleText('confirmDeleteProductSingular'),
          {
            onClose: (sAction) => {
              if (sAction === MessageBox.Action.OK) {
                BusyIndicator.show();
                this.getModel().remove(sKey, {
                  success: () => {
                    BusyIndicator.hide();
                    MessageToast.show(
                      this.getResourceBundleText(
                        'productDeleteSuccessSingular',
                      ),
                      {
                        closeOnBrowserNavigation: false,
                      },
                    );
                    this.navTo('ListReport');
                  },
                  error: (oError) => {
                    BusyIndicator.hide();
                    MessageBox.error(
                      this.getResourceBundleText('productDeleteError'),
                      {
                        details: oError,
                      },
                    );
                  },
                });
              }
            },
          },
        );
      },

      /**
       * Initiates comment deletion with confirmation
       * @public
       * @param {sap.ui.base.Event} oEvent - The event triggered by the delete action
       */
      onDeleteCommentPress(oEvent) {
        const oListItem = oEvent.getParameter('listItem');
        const oContext = oListItem.getBindingContext();
        const oContextModel = oContext.getModel();
        const oComment = oContext.getObject();
        const sKey = oContextModel.createKey('/ProductComments', {
          ID: oComment.ID,
        });

        MessageBox.confirm(this.getResourceBundleText('confirmDeleteComment'), {
          onClose: (sAction) => {
            if (sAction === MessageBox.Action.OK) {
              BusyIndicator.show();
              oContextModel.remove(sKey, {
                success: () => {
                  BusyIndicator.hide();
                  MessageToast.show(
                    this.getResourceBundleText('commentDeleteSuccess'),
                  );
                },
                error: (oError) => {
                  BusyIndicator.hide();
                  MessageBox.error(
                    this.getResourceBundleText('commentDeleteError'),
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

      /**
       * Saves product changes to the model
       * @public
       */
      onSaveButtonPress() {
        const oBindingContext = this.getView().getBindingContext();
        const mData = oBindingContext.getObject();
        this._oEditCommentTable = this.getView().byId('idEditCommentTable');
        const aItems = this._oEditCommentTable.getItems();

        Messaging.removeAllMessages();
        let bValidationFailed = false;

        aItems.forEach((oItem, iIndex) => {
          const aCells = oItem.getCells();
          const oAuthorInput = aCells[0];
          const oMessageInput = aCells[1];
          const oRatingInput = aCells[3];

          if (!oAuthorInput.getValue() || oAuthorInput.getValue().length > 45) {
            oAuthorInput.setValueState(ValueState.Error);
            Messaging.addMessages(
              new Message({
                message: this.getResourceBundleText('commentNameRequired'),
                type: MessageType.Error,
                target: `/Comment/${iIndex}/Author`,
                processor: this.getModel(),
              }),
            );
            bValidationFailed = true;
          }

          if (!oMessageInput.getValue()) {
            oMessageInput.setValueState(ValueState.Error);
            Messaging.addMessages(
              new Message({
                message: this.getResourceBundleText('mandatoryFieldsMessage'),
                type: MessageType.Error,
                target: `/Comment/${iIndex}/Message`,
                processor: this.getModel(),
              }),
            );
            bValidationFailed = true;
          }

          const iRatingValue = parseFloat(oRatingInput.getValue());
          if (isNaN(iRatingValue) || iRatingValue < 0 || iRatingValue > 10) {
            oRatingInput.setValueState(ValueState.Error);
            Messaging.addMessages(
              new Message({
                message: this.getResourceBundleText('commentRatingRequired'),
                type: MessageType.Error,
                target: `/Comment/${iIndex}/Rating`,
                processor: this.getModel(),
              }),
            );
            bValidationFailed = true;
          }
        });

        if (
          this.getModel().hasPendingChanges() &&
          (!mData.Name ||
            !mData.Specs ||
            !mData.Price_amount ||
            bValidationFailed)
        ) {
          this.getModel().setRefreshAfterChange(false);
          this.getModel().submitChanges({});
        } else if (bValidationFailed) {
          return;
        } else if (
          this.getModel().hasPendingChanges() &&
          (mData.Name || mData.Specs || mData.Price_amount)
        ) {
          this.getModel().setRefreshAfterChange(true);
          this.getModel().submitChanges({
            success: () => {
              BusyIndicator.hide();
              MessageToast.show(
                this.getResourceBundleText('productUpdateSuccess'),
              );
              Messaging.removeAllMessages();
              this._toggleButtonsAndView(false);
            },
          });
        } else {
          Messaging.removeAllMessages();
          MessageToast.show(this.getResourceBundleText('noChangesToSave'));
          this._toggleButtonsAndView(false);
        }
      },

      /**
       * Toggles edit mode and updates UI controls
       * @private
       * @param {boolean} bEdit - Whether to enable edit mode
       */
      _toggleButtonsAndView(bEdit) {
        this.getNamedModel('uiModel').setProperty(
          '/toggleFooterVisibility',
          bEdit,
        );

        this._showFormFragment(
          bEdit
            ? Constants.FRAGMENTS.EDIT_PRODUCT
            : Constants.FRAGMENTS.DISPLAY_PRODUCT,
        );

        this.getView().byId(this._UI_IDS.EDIT_BUTTON).setVisible(!bEdit);
        this.getView().byId(this._UI_IDS.DELETE_BUTTON).setVisible(bEdit);
        this.getView().byId(this._UI_IDS.SAVE_BUTTON).setVisible(bEdit);
        this.getView().byId(this._UI_IDS.CANCEL_BUTTON).setVisible(bEdit);
      },
    });
  },
);
