sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
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
    Controller,
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

    return Controller.extend('freestylesapui5app.controller.ObjectPage', {
      // Formatter referenced in fragments for date text formatting
      formatter: Formatter,

      // Constants for repeated UI elements
      _UI_IDS: {
        NEW_COMMENT_ROW: 'idHBox',
        SAVE_COMMENT_BUTTON: 'idSaveNewCommentButton',
        ADD_COMMENT_BUTTON: 'idAddNewCommentButton',
        CANCEL_COMMENT_BUTTON: 'idCancelNewCommentButton',
        EDIT_BUTTON: 'idEditButton',
        SAVE_BUTTON: 'idSaveButton',
        CANCEL_BUTTON: 'idCancelButton',
      },

      /**
       * Initializes the controller, sets up routing, and prepares the UI model
       * @public
       */
      onInit() {
        this._oResourceBundle = this.getOwnerComponent()
          .getModel('i18n')
          .getResourceBundle();

        this._oRouter = this.getOwnerComponent().getRouter();
        this._oRouter
          .getRoute('ObjectPage')
          .attachPatternMatched(this._onRouteMatched, this);

        this._objectPage = this.getView().byId('idObjectPage');
        this._formFragments = {};
        this._showFormFragment(Constants.FRAGMENTS.DISPLAY_PRODUCT);

        this.getView().setModel(
          new JSONModel({
            statuses: [
              {
                key: Constants.PRODUCT_STATUS.OK,
                text: this._oResourceBundle.getText('OK'),
              },
              {
                key: Constants.PRODUCT_STATUS.STORAGE,
                text: this._oResourceBundle.getText('STORAGE'),
              },
              {
                key: Constants.PRODUCT_STATUS.OUT_OF_STOCK,
                text: this._oResourceBundle.getText('OUT_OF_STOCK'),
              },
            ],
            toggleFooterVisibility: false,
            toggleEditButton: true,
          }),
          'uiModel',
        );
        this._oView = this.getView();
        this._oView.setModel(Messaging.getMessageModel(), 'message');
        Messaging.registerObject(this._oView, true);
      },

      /**
       * Handles route pattern matching and binds the view to the product context, resets controls and messages
       * @private
       * @param {sap.ui.base.Event} oEvent - The route matched event
       */
      _onRouteMatched(oEvent) {
        const sProductId = oEvent.getParameter('arguments').Product_ID;
        const oModel = this.getView().getModel();

        const sKey = oModel.createKey('/Products', {
          ID: sProductId,
        });

        this.getView().bindElement({
          path: sKey,
        });

        oModel.resetChanges();
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
        const oView = this.getView();
        const sFragmentPath =
          'freestylesapui5app.view.fragments.' + sFragmentName;

        if (!this._formFragments[sFragmentName]) {
          this._formFragments[sFragmentName] = Fragment.load({
            id: oView.getId(),
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
       * Cancels editing with confirmation for unsaved changes
       * @public
       */
      onCancelButtonPress() {
        const oModel = this.getView().getModel();

        if (oModel.hasPendingChanges()) {
          MessageBox.confirm(this._oResourceBundle.getText('inputDataLoss'), {
            onClose: (oAction) => {
              if (oAction === MessageBox.Action.OK) {
                oModel.resetChanges();
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
      _oMessagePopover: null,
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
        const oView = this.getView();
        const oModel = oView.getModel();
        const sProductId = oView.getBindingContext().getProperty('ID');

        const oEntryCtx = oModel.createEntry('/ProductComments', {
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
        this._oView
          .getModel('uiModel')
          .setProperty('/toggleFooterVisibility', bShow);
        this._oView.getModel('uiModel').setProperty('/toggleEditButton', false);

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
        const oMainModel = this.getView().getModel();

        if (oMainModel.hasPendingChanges()) {
          MessageBox.confirm(this._oResourceBundle.getText('inputDataLoss'), {
            onClose: (oAction) => {
              if (oAction === MessageBox.Action.OK) {
                this.getView().getModel().resetChanges();
                Messaging.removeAllMessages();
                this._resetCommentControls();
                this._oView
                  .getModel('uiModel')
                  .setProperty('/toggleEditButton', true);
              }
            },
          });
          Messaging.removeAllMessages();
        } else {
          this.getView().getModel().resetChanges();
          this._resetCommentControls();
        }
      },

      /**
       * Saves a new comment after validation
       * @public
       */
      onSaveNewCommentButtonPress: function () {
        const oView = this.getView();
        const oModel = oView.getModel();
        const oCommentCtx = this._getFragmentControl(
          this._UI_IDS.NEW_COMMENT_ROW,
        ).getBindingContext();
        const mData = oCommentCtx.getObject();

        Messaging.removeAllMessages();

        if (!mData.Author || !mData.Message) {
          oModel.setRefreshAfterChange(false);
          oModel.submitChanges({});
        } else {
          oModel.setRefreshAfterChange(true);
          oModel.submitChanges({
            success: () => {
              MessageToast.show(
                this._oResourceBundle.getText('commentPostSuccess'),
              );
              Messaging.removeAllMessages();
              this._toggleCommentControls(false);
              this._oView
                .getModel('uiModel')
                .setProperty('/toggleEditButton', true);
            },
            error: (oError) => {
              MessageBox.error(
                this._oResourceBundle.getText('commentPostError'),
                {
                  details: oError,
                },
              );
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
        this._oRouter.navTo('ObjectChartPage');
      },

      /**
       * Initiates product deletion with confirmation
       * @public
       */
      onDeleteButtonPress() {
        const oMainModel = this.getView().getModel();
        const oCtx = this.getView().getBindingContext();
        const sKey = oMainModel.createKey('/Products', oCtx.getObject());

        MessageBox.confirm(
          this._oResourceBundle.getText('confirmDeleteProductSingular'),
          {
            onClose: (sAction) => {
              if (sAction === MessageBox.Action.OK) {
                BusyIndicator.show();
                oMainModel.remove(sKey, {
                  success: () => {
                    BusyIndicator.hide();
                    MessageToast.show(
                      this._oResourceBundle.getText(
                        'productDeleteSuccessSingular',
                      ),
                      {
                        closeOnBrowserNavigation: false,
                      },
                    );
                    this.getOwnerComponent().getRouter().navTo('ListReport');
                  },
                  error: (oError) => {
                    BusyIndicator.hide();
                    MessageBox.error(
                      this._oResourceBundle.getText('productDeleteError'),
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
        const oCtx = oListItem.getBindingContext();
        const oModel = oCtx.getModel();
        const oComment = oCtx.getObject();
        const sKey = oModel.createKey('/ProductComments', {
          ID: oComment.ID,
        });

        MessageBox.confirm(
          this._oResourceBundle.getText('confirmDeleteComment'),
          {
            onClose: (sAction) => {
              if (sAction === MessageBox.Action.OK) {
                BusyIndicator.show();
                oModel.remove(sKey, {
                  success: () => {
                    BusyIndicator.hide();
                    MessageToast.show(
                      this._oResourceBundle.getText('commentDeleteSuccess'),
                    );
                  },
                  error: (oError) => {
                    BusyIndicator.hide();
                    MessageBox.error(
                      this._oResourceBundle.getText('commentDeleteError'),
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
       * Saves product changes to the model
       * @public
       */
      onSaveButtonPress() {
        const oModel = this.getView().getModel();
        const oBindingContext = this.getView().getBindingContext();
        const mData = oBindingContext.getObject();

        const oTable = this._oView.byId('idEditCommentTable');
        const aItems = oTable.getItems();

        Messaging.removeAllMessages();
        let bValidationFailed = false;

        aItems.forEach((oItem, iIndex) => {
          const aCells = oItem.getCells();
          const oAuthorInput = aCells[0];
          const oMessageInput = aCells[1];
          const oRatingInput = aCells[3];

          if (!oAuthorInput.getValue() || oAuthorInput.getValue().length > 45) {
            oAuthorInput.setValueState(ValueState.Error);
            bValidationFailed = true;
            Messaging.addMessages(
              new Message({
                message: this._oResourceBundle.getText('commentNameRequired'),
                type: MessageType.Error,
                target: `/Comment/${iIndex}/Author`,
                processor: oModel,
              }),
            );
          }

          if (!oMessageInput.getValue()) {
            oMessageInput.setValueState(ValueState.Error);
            bValidationFailed = true;
            Messaging.addMessages(
              new Message({
                message: this._oResourceBundle.getText(
                  'mandatoryFieldsMessage',
                ),
                type: MessageType.Error,
                target: `/Comment/${iIndex}/Message`,
                processor: oModel,
              }),
            );
          }

          const iRatingValue = parseFloat(oRatingInput.getValue());

          if (isNaN(iRatingValue) || iRatingValue < 0 || iRatingValue > 10) {
            oRatingInput.setValueState(ValueState.Error);
            bValidationFailed = true;
            Messaging.addMessages(
              new Message({
                message: this._oResourceBundle.getText('commentRatingRequired'),
                type: MessageType.Error,
                target: `/Comment/${iIndex}/Rating`,
                processor: oModel,
              }),
            );
          }
        });

        if (bValidationFailed) {
          MessageToast.show(
            this._oResourceBundle.getText('mandatoryFieldsMessage'),
          );
          return;
        }

        if (
          oModel.hasPendingChanges() &&
          (!mData.Name || !mData.Specs || !mData.Price_amount)
        ) {
          oModel.setRefreshAfterChange(false);
          oModel.submitChanges({});
        } else if (
          oModel.hasPendingChanges() &&
          (mData.Name || mData.Specs || mData.Price_amount)
        ) {
          oModel.setRefreshAfterChange(true);
          oModel.submitChanges({
            success: () => {
              BusyIndicator.hide();
              MessageToast.show(
                this._oResourceBundle.getText('productUpdateSuccess'),
              );
              Messaging.removeAllMessages();
              this._toggleButtonsAndView(false);
            },
          });
        } else {
          Messaging.removeAllMessages();
          MessageToast.show(this._oResourceBundle.getText('noChangesToSave'));
          this._toggleButtonsAndView(false);
        }
      },

      /**
       * Toggles edit mode and updates UI controls
       * @private
       * @param {boolean} bEdit - Whether to enable edit mode
       */
      _toggleButtonsAndView(bEdit) {
        const oView = this.getView();
        oView.getModel('uiModel').setProperty('/toggleFooterVisibility', bEdit);

        this._showFormFragment(
          bEdit
            ? Constants.FRAGMENTS.EDIT_PRODUCT
            : Constants.FRAGMENTS.DISPLAY_PRODUCT,
        );

        oView.byId(this._UI_IDS.EDIT_BUTTON).setVisible(!bEdit);
        oView.byId(this._UI_IDS.SAVE_BUTTON).setVisible(bEdit);
        oView.byId(this._UI_IDS.CANCEL_BUTTON).setVisible(bEdit);
      },
    });
  },
);
