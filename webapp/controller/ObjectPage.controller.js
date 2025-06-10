sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "freestylesapui5app/utils/Formatter",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/core/BusyIndicator",
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel",
  "freestylesapui5app/utils/Constants",
  "sap/ui/core/routing/History",
  "sap/ui/core/routing/HashChanger",
  "sap/ui/core/library",
], function (
  Controller,
  Formatter,
  MessageBox,
  MessageToast,
  BusyIndicator,
  Fragment,
  JSONModel,
  Constants,
  History,
  HashChanger,
  coreLibrary
) {
  "use strict";

  const { ValueState } = coreLibrary

  return Controller.extend("freestylesapui5app.controller.ObjectPage", {
    // Formatter referenced in fragments for date text formatting
    formatter: Formatter,

    // Constants for repeated UI elements
    _UI_IDS: {
      NEW_COMMENT_ROW: "idHBox",
      SAVE_COMMENT_BUTTON: "idSaveCommentButton",
      ADD_COMMENT_BUTTON: "idAddCommentButton",
      CANCEL_COMMENT_BUTTON: "idCancelCommentButton",
      EDIT_BUTTON: "idEditButton",
      SAVE_BUTTON: "idSaveButton",
      CANCEL_BUTTON: "idCancelButton",
      AUTHOR_INPUT: "idAuthorInput",
      MESSAGE_INPUT: "idMessageInput",
      RATING_INPUT: "idRatingInput",
      OBJECT_PAGE: "idObjectPage"
    },

    // Validation rules for comment fields
    _COMMENT_VALIDATIONS: [
      {
        id: "idAuthorInput",
        required: true,
        validate: (val) => val && val.length <= Constants.MAX_NAME_LENGTH,
        errorKey: "commentNameRequired"
      },
      {
        id: "idMessageInput",
        required: true,
        validate: (val) => !!val,
        errorKey: "commentMessageRequired"
      },
      {
        id: "idRatingInput",
        required: true,
        validate: (val) => val >= 0 && val <= 10,
        errorKey: "commentRatingRequired"
      }
    ],

    /**
     * Initializes the controller, sets up routing, and prepares the UI model
     * @public
     */
    onInit() {
      this._oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      this._oRouter = this.getOwnerComponent().getRouter();
      this._oRouter
        .getRoute("ObjectPage")
        .attachPatternMatched(this._onRouteMatched, this);
      this._oRouter
        .attachBeforeRouteMatched(this._onBeforeRouteMatched, this);

      this._formFragments = {};
      this._showFormFragment(Constants.FRAGMENTS.DISPLAY_PRODUCT);

      this.getView().setModel(
        new JSONModel({
          statuses: [
            { key: Constants.PRODUCT_STATUS.OK, text: this._oResourceBundle.getText("OK") },
            { key: Constants.PRODUCT_STATUS.STORAGE, text: this._oResourceBundle.getText("STORAGE") },
            { key: Constants.PRODUCT_STATUS.OUT_OF_STOCK, text: this._oResourceBundle.getText("OUT_OF_STOCK") }
          ],
          oEditing: false
        }),
        "uiModel"
      );
    },

    /**
 * Intercepts navigation to check for unsaved changes before route change
 * @private
 * @param {sap.ui.base.Event} oEvent - The beforeRouteMatched event
 * @returns {void}
 */
    /**
    * Intercepts navigation to check for unsaved changes before route change
    * @private
    * @param {sap.ui.base.Event} oEvent - The beforeRouteMatched event
    * @returns {void}
    */
    _onBeforeRouteMatched(oEvent) {
      const oModel = this.getView().getModel();
      const bCommentInputHasChanges = this._hasCommentInputChanges();
      const bHasChanges = oModel.hasPendingChanges() || bCommentInputHasChanges;

      if (bHasChanges) {
        const sTargetRoute = oEvent.getParameter("name");
        const oArguments = oEvent.getParameter("arguments");

        MessageBox.confirm(this._oResourceBundle.getText("inputDataLoss"), {
          title: this._oResourceBundle.getText("confirmNavigationTitle"),
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: (sAction) => {
            if (sAction === MessageBox.Action.OK) {
              oModel.resetChanges();
              this._resetCommentControls();
              this._toggleButtonsAndView(false);
              this._oRouter.navTo(sTargetRoute, oArguments, {}, true);
            } else {
              const oCurrentArgs = oEvent.getParameter("arguments");
              this._oRouter.navTo("ObjectPage", oCurrentArgs, {}, true);
            }
          }
        });
      }
    },

    /**
     * Handles route pattern matching and binds the view to the product context
     * @private
     * @param {sap.ui.base.Event} oEvent - The route matched event
     */
    _onRouteMatched(oEvent) {
      const sProductId = oEvent.getParameter("arguments").Product_ID;
      const oModel = this.getView().getModel();

      const sKey = oModel.createKey("/Products", {
        ID: sProductId,
      });

      this.getView().bindElement({
        path: sKey,
      });

      this._oHashChanger = HashChanger.getInstance()
      this._sCurrentHash = this._oHashChanger.getHash()

      this._toggleButtonsAndView(false);
      this._resetCommentControls();
    },

    /**
     * Adds a listener for hash changes to manage pending model changes
     * @private
     */
    _addHashListener() {
      window.addEventListener("hashchange", () => {
        const oModel = this.getView().getModel();
        const bCommentInputHasChanges = this._hasCommentInputChanges();
        if (oModel.hasPendingChanges() || bCommentInputHasChanges) {
          this._handleHashChange();
        } else {
          this._oRouter.initialize();
        }
      }, { once: true });
    },

    /**
 * Checks if the new comment input fields have non-empty values
 * @private
 * @param None
 * @returns {boolean} Whether any comment input field has a value
 */
    _hasCommentInputChanges() {
      const oCommentCtx = this._getFragmentControl(this._UI_IDS.NEW_COMMENT_ROW)?.getBindingContext();
      if (!oCommentCtx) {
        return false;
      }
      const mData = oCommentCtx.getObject();
      return !!(mData.Author || mData.Message || mData.Rating);
    },

    /**
     * Manages hash changes with confirmation for unsaved changes
     * @private
     */
    _handleHashChange() {
      MessageBox.confirm(this._oResourceBundle.getText("inputDataLoss"), {
        onClose: (oAction) => {
          if (oAction === MessageBox.Action.OK) {
            this.getView().getModel().resetChanges();
            this._resetCommentControls();
            this._toggleButtonsAndView(false);
            this._oRouter.initialize();
          } else {
            this._oHashChanger.setHash(this._sCurrentHash);
            setTimeout(() => this._addHashListener(), 100);
          }
        }
      });
    },

    /**
     * Retrieves or caches a fragment control by ID
     * @private
     * @param {string} sId - The ID of the fragment control
     * @returns {sap.ui.core.Control} The fragment control
     */
    _getFragmentControl(sId) {
      if (!this._fragmentControls) {
        this._fragmentControls = {};
      }

      if (!this._fragmentControls[sId]) {
        this._fragmentControls[sId] = Fragment.byId(this.getView().getId(), sId);
      }

      return this._fragmentControls[sId];
    },

    /**
     * Initiates the process to add a new comment
     * @public
     */
    onAddCommentPress() {
      const oView = this.getView();
      const oMainModel = oView.getModel();
      const sProductId = oView.getBindingContext().getProperty("ID");

      const oEntryCtx = oMainModel.createEntry("/ProductComments", {
        properties: {
          Author: "",
          Message: "",
          Rating: "",
          Posted: new Date(),
          Product_ID: sProductId
        }
      });

      this._getFragmentControl(this._UI_IDS.NEW_COMMENT_ROW).setBindingContext(oEntryCtx);
      this._toggleCommentControls(true);
    },

    /**
     * Toggles visibility of comment input controls
     * @private
     * @param {boolean} bShow - Whether to show or hide the comment controls
     */
    _toggleCommentControls(bShow) {
      this._getFragmentControl(this._UI_IDS.NEW_COMMENT_ROW).setVisible(bShow);
      this._getFragmentControl(this._UI_IDS.SAVE_COMMENT_BUTTON).setVisible(bShow);
      this._getFragmentControl(this._UI_IDS.ADD_COMMENT_BUTTON).setVisible(!bShow);
      this._getFragmentControl(this._UI_IDS.CANCEL_COMMENT_BUTTON).setVisible(bShow);
    },

    /**
     * Cancels the creation of a new comment
     * @public
     */
    onCancelNewCommentPress() {
      const oMainModel = this.getView().getModel();
      const oCommentCtx = this._getFragmentControl(this._UI_IDS.NEW_COMMENT_ROW).getBindingContext();
      const bCommentInputHasChanges = this._hasCommentInputChanges();

      if (oMainModel.hasPendingChanges() || bCommentInputHasChanges) {
        this._handleCancelWithPendingChanges(oCommentCtx);
      } else {
        this.getView().getModel().resetChanges();
        this._resetCommentControls();
      }
    },

    /**
     * Handles cancellation when there are pending changes
     * @private
     */
    _handleCancelWithPendingChanges() {
      MessageBox.confirm(this._oResourceBundle.getText("inputDataLoss"), {
        onClose: (oAction) => {
          if (oAction === MessageBox.Action.OK) {
            this.getView().getModel().resetChanges();
            this._resetCommentControls();
            this._oRouter.initialize();
          } else {
            this._oHashChanger.setHash(this._sCurrentHash);
            setTimeout(() => this._addHashListener(), 100);
          }
        }
      });
    },

    /**
     * Saves a new comment after validation
     * @public
     */
    onSaveNewCommentPress() {
      const oView = this.getView();
      const oModel = oView.getModel();
      const oCommentCtx = this._getFragmentControl(this._UI_IDS.NEW_COMMENT_ROW).getBindingContext();
      const mData = oCommentCtx.getObject();

      if (this._validateCommentFields(oView, mData)) {
        this._submitCommentChanges(oModel);
      }
    },

    /**
     * Validates comment input fields
     * @private
     * @param {sap.ui.core.mvc.View} oView - The current view
     * @param {object} mData - The comment data object
     * @returns {boolean} Whether the validation was successful
     */
    _validateCommentFields(oView, mData) {
      let firstInvalidInput = null;

      this._COMMENT_VALIDATIONS.forEach((field) => {
        const oInput = oView.byId(field.id);
        const value = mData[field.id.replace("id", "").replace("Input", "")];
        const isEmpty = value === undefined || value === null || value === "";

        if (field.required && isEmpty) {
          oInput.setValueState(ValueState.Error);
          oInput.setValueStateText(this._oResourceBundle.getText(field.errorKey));
          firstInvalidInput = firstInvalidInput || oInput;
          return;
        }

        if (!field.validate(value)) {
          oInput.setValueState(ValueState.Error);
          oInput.setValueStateText(this._oResourceBundle.getText(field.errorKey));
          firstInvalidInput = firstInvalidInput || oInput;
          return;
        }
        oInput.setValueState(ValueState.None);
      });

      if (firstInvalidInput) {
        firstInvalidInput.focus();
        return false;
      }
      return true;
    },

    /**
     * Submits comment changes to the model
     * @private
     * @param {sap.ui.model.Model} oModel - The main data model
     */
    _submitCommentChanges(oModel) {
      BusyIndicator.show();
      oModel.submitChanges({
        success: () => {
          BusyIndicator.hide();
          MessageToast.show(this._oResourceBundle.getText("commentPostSuccess"));
          this._resetCommentControls();
        },
        error: (oError) => {
          BusyIndicator.hide();
          MessageBox.error(this._oResourceBundle.getText("commentPostError"), { details: oError });
        }
      });
    },

    /**
     * Resets comment input controls to their initial state
     * @private
     */
    _resetCommentControls() {
      this._getFragmentControl(this._UI_IDS.NEW_COMMENT_ROW).setVisible(false);
      this._getFragmentControl(this._UI_IDS.SAVE_COMMENT_BUTTON).setVisible(false);
      this._getFragmentControl(this._UI_IDS.ADD_COMMENT_BUTTON).setVisible(true);
      this._getFragmentControl(this._UI_IDS.CANCEL_COMMENT_BUTTON).setVisible(false);
    },

    /**
     * Navigates to the chart page on list item press
     * @public
     */
    onColumnListItemPress() {
      this._oRouter.navTo("ObjectChartPage");
    },

    /**
     * Initiates product deletion with confirmation
     * @public
     */
    onDeleteButtonPress() {
      const oMainModel = this.getView().getModel();
      const oCtx = this.getView().getBindingContext();
      const sKey = oMainModel.createKey("/Products", oCtx.getObject());

      this._confirmAndDelete(sKey, "confirmDeleteProductSingular", "productDeleteSuccessSingular", "productDeleteError");
    },

    /**
     * Initiates comment deletion with confirmation
     * @public
     * @param {sap.ui.base.Event} oEvent - The event triggered by the delete action
     */
    onDeleteCommentPress(oEvent) {
      const oListItem = oEvent.getParameter("listItem");
      const oCtx = oListItem.getBindingContext();
      const sKey = oCtx.getModel().createKey("/ProductComments", { ID: oCtx.getObject().ID });

      this._confirmAndDelete(sKey, "confirmDeleteComment", "commentDeleteSuccess", "commentDeleteError");
    },

    /**
     * Confirms and executes deletion of a product or comment
     * @private
     * @param {string} sKey - The key of the entity to delete
     * @param {string} sConfirmKey - The i18n key for the confirmation message
     * @param {string} sSuccessKey - The i18n key for the success message
     * @param {string} sErrorKey - The i18n key for the error message
     */
    _confirmAndDelete(sKey, sConfirmKey, sSuccessKey, sErrorKey) {
      MessageBox.confirm(this._oResourceBundle.getText(sConfirmKey), {
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.OK) {
            BusyIndicator.show();
            this.getView().getModel().remove(sKey, {
              success: () => {
                BusyIndicator.hide();
                MessageToast.show(this._oResourceBundle.getText(sSuccessKey));
              },
              error: (oError) => {
                BusyIndicator.hide();
                MessageBox.error(this._oResourceBundle.getText(sErrorKey), { details: oError });
              }
            });
          }
        }
      });
    },

    /**
     * Displays the specified form fragment
     * @private
     * @param {string} sFragmentName - The name of the fragment to display
     */
    _showFormFragment(sFragmentName) {
      const oPage = this.byId(this._UI_IDS.OBJECT_PAGE);
      const currentFragment = oPage.getContent()[0];

      if (currentFragment?.getMetadata().getName().includes(sFragmentName)) {
        return;
      }

      this._getFormFragment(sFragmentName).then((oFragment) => {
        oPage.removeAllContent();
        oPage.insertContent(oFragment, 0);
      });
    },

    /**
     * Loads and caches a form fragment
     * @private
     * @param {string} sFragmentName - The name of the fragment to load
     * @returns {Promise<sap.ui.core.Control>} The loaded fragment
     */
    _getFormFragment(sFragmentName) {
      const oView = this.getView();
      const sFragmentPath = "freestylesapui5app.view.fragments." + sFragmentName;

      if (!this._formFragments[sFragmentName]) {
        this._formFragments[sFragmentName] = Fragment.load({
          id: oView.getId(),
          name: sFragmentPath,
          controller: this
        });
      }

      return this._formFragments[sFragmentName];
    },

    /**
     * Enters edit mode for the product
     * @public
     */
    onEditButtonPress() {
      this._toggleButtonsAndView(true);
      console.log("edit clicked and toggle staarted");

    },

    /**
     * Cancels product editing with confirmation for unsaved changes
     * @public
     */
    onCancelButtonPress() {
      const oModel = this.getView().getModel();

      if (oModel.hasPendingChanges()) {
        MessageBox.confirm(this._oResourceBundle.getText("inputDataLoss"), {
          title: this._oResourceBundle.getText("confirmNavigationTitle"),
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: (oAction) => {
            if (oAction === MessageBox.Action.OK) {
              oModel.resetChanges();
              this._toggleButtonsAndView(false);
            }
          }
        });
      } else {
        this._toggleButtonsAndView(false);
      }
    },

    /**
     * Saves product changes to the model
     * @public
     */
    onSaveButtonPress() {
      const oModel = this.getView().getModel();

      if (oModel.hasPendingChanges()) {
        BusyIndicator.show();
        oModel.submitChanges({
          success: () => {
            BusyIndicator.hide();
            MessageToast.show(this._oResourceBundle.getText("productUpdateSuccess"));
            this._toggleButtonsAndView(false);
            oModel.refresh();
          },
          error: (oError) => {
            BusyIndicator.hide();
            MessageBox.error(this._oResourceBundle.getText("productUpdateError"), {
              details: oError
            });
          }
        });
      } else {
        MessageToast.show(this._oResourceBundle.getText("noChangesToSave"));
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

      oView.byId(this._UI_IDS.EDIT_BUTTON).setVisible(!bEdit);
      oView.byId(this._UI_IDS.SAVE_BUTTON).setVisible(bEdit);
      oView.byId(this._UI_IDS.CANCEL_BUTTON).setVisible(bEdit);

      this._showFormFragment(bEdit ? Constants.FRAGMENTS.EDIT_PRODUCT : Constants.FRAGMENTS.DISPLAY_PRODUCT);

      // if (bEdit) {
      //   this._oRouter.stop();
      // }
      console.log(
        "hello from toggle", bEdit, "bedit and router stop"
      );
      window.addEventListener("beforeunload", (event) => {console.log("added window");
       })

    },
    onbeforeunload(){ console.log("fired");
    }
    
  });
});