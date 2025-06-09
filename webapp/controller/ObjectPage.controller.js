sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "freestylesapui5app/utils/Formatter",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/core/BusyIndicator",
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel",
  "freestylesapui5app/utils/Constants",
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
  HashChanger,
  coreLibrary
) {
  "use strict";

  const { ValueState } = coreLibrary

  return Controller.extend("freestylesapui5app.controller.ObjectPage", {
    _bEditing: false,
    formatter: Formatter,

    onInit() {
      this._oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      this._objectPage = this.getView().byId("idObjectPage");
      this._editButton = this.getView().byId("idEditButton");
      this._saveButton = this.getView().byId("idSaveButton");
      this._cancelButton = this.getView().byId("idCancelButton");

      const oRouter = this.getOwnerComponent().getRouter();
      oRouter
        .getRoute("ObjectPage")
        .attachPatternMatched(this._onRouteMatched, this);

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

    _onRouteMatched(oEvent) {
      const sProductId = oEvent.getParameter("arguments").Product_ID;
      const oModel = this.getView().getModel();

      const sKey = oModel.createKey("/Products", {
        ID: sProductId,
      });

      this.getView().bindElement({
        path: sKey,
      });

      this._toggleButtonsAndView(false);
      this._oHashChanger = HashChanger.getInstance();
      this._sCurrentHash = this._oHashChanger.getHash();

      this._getFragmentControl("idNewCommentRow").setVisible(false);
      this._getFragmentControl("idSaveCommentButton").setVisible(false);
      this._getFragmentControl("idAddCommentButton").setVisible(true);
      this._getFragmentControl("idCancelCommentButton").setVisible(false);

      this._addHashListener()
    },

    _addHashListener() {
      window.addEventListener("hashchange", () => {
        const oView = this.getView();
        const oModel = oView.getModel();
        const oRouter = this.getOwnerComponent().getRouter();

        if (oModel.hasPendingChanges()) {
          this._onHashChanged()
        } else {
          oRouter.initialize()
        }
      }, { once: true })
    },

    _onHashChanged: function () {
      const oView = this.getView();
      const oModel = oView.getModel();
      const oRouter = this.getOwnerComponent().getRouter();

      MessageBox.confirm(this._oResourceBundle.getText('inputDataLoss'), {
        onClose: (oAction) => {
          if (oAction === MessageBox.Action.OK) {
            oModel.resetChanges();
            this._toggleButtonsAndView(false);
            oRouter.initialize();
          } else {
            this._oHashChanger.setHash(this._sCurrentHash);
            setTimeout(() => {
              this._addHashListener()
            }, 100);
          }
        }
      })
    },

    _getFragmentControl(sId) {
      if (!this._fragmentControls) {
        this._fragmentControls = {};
      }

      if (!this._fragmentControls[sId]) {
        this._fragmentControls[sId] = Fragment.byId(this.getView().getId(), sId);
      }

      return this._fragmentControls[sId];
    },

    onAddCommentPress: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.stop()
      const oView = this.getView();
      const oMainModel = oView.getModel();
      const oContext = oView.getBindingContext();
      const sProductId = oContext.getProperty("ID");

      const oEntryCtx = oMainModel.createEntry("/ProductComments", {
        properties: {
          Author: '',
          Message: '',
          Rating: '',
          Posted: new Date(),
          Product_ID: sProductId,
        },
      });

      const oNewCommentRow = this._getFragmentControl("idNewCommentRow");
      oNewCommentRow.setBindingContext(oEntryCtx);

      this._getFragmentControl("idNewCommentRow").setVisible(true);
      this._getFragmentControl("idSaveCommentButton").setVisible(true);
      this._getFragmentControl("idAddCommentButton").setVisible(false);
      this._getFragmentControl("idCancelCommentButton").setVisible(true);
    },

    onCancelNewCommentPress: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      const oView = this.getView();
      const oMainModel = oView.getModel();

      const oNewCommentRow = this._getFragmentControl("idNewCommentRow");
      const oCommentCtx = oNewCommentRow.getBindingContext()

      if (oMainModel.hasPendingChanges()) {
        MessageBox.confirm(this._oResourceBundle.getText('inputDataLoss'), {
          onClose: (oAction) => {
            if (oAction === MessageBox.Action.OK) {
              this._getFragmentControl("idNewCommentRow").setVisible(false);
              this._getFragmentControl("idSaveCommentButton").setVisible(false);
              this._getFragmentControl("idAddCommentButton").setVisible(true);
              this._getFragmentControl("idCancelCommentButton").setVisible(false);
              oRouter.initialize();
              oMainModel.deleteCreatedEntry(oCommentCtx);
            } else {
              this._oHashChanger.setHash(this._sCurrentHash);
              setTimeout(() => {
                this._addHashListener()
              }, 100);
            }
          }
        })
      } else {
        this._getFragmentControl("idNewCommentRow").setVisible(false);
        this._getFragmentControl("idSaveCommentButton").setVisible(false);
        this._getFragmentControl("idAddCommentButton").setVisible(true);
        this._getFragmentControl("idCancelCommentButton").setVisible(false);
      }
    },

    onSaveNewCommentPress: function () {
      const oView = this.getView();
      const oModel = oView.getModel();
      const rb = this._oResourceBundle;
      const oNewCommentRow = this._getFragmentControl("idNewCommentRow");
      const oCommentCtx = oNewCommentRow.getBindingContext()
      const mData = oCommentCtx.getObject()

      const fields = [
        {
          id: "idAuthorInput",
          value: mData.Author,
          required: true,
          validate: (val) => val && val.length <= Constants.MAX_NAME_LENGTH,
          getErrorText: () => rb.getText("commentNameRequired"),
        },
        {
          id: "idMessageInput",
          value: mData.Message,
          required: true,
          validate: (val) => !!val,
          getErrorText: () => rb.getText("commentMessageRequired"),
        },
        {
          id: "idRatingInput",
          value: mData.Rating,
          required: true,
          validate: (val) => val >= 0 && val <= 10,
          getErrorText: () => rb.getText("commentRatingRequired"),
        },
      ];

      let firstInvalidInput = null;

      fields.forEach((field) => {
        const oInput = oView.byId(field.id);
        const value = field.value;
        const isEmpty = value === undefined || value === null || value === "";

        if (field.required && isEmpty) {
          oInput.setValueState(ValueState.Error);
          oInput.setValueStateText(field.getErrorText());
          if (!firstInvalidInput) firstInvalidInput = oInput;

          return;
        }

        if (!field.validate(value)) {
          oInput.setValueState(ValueState.Error);
          oInput.setValueStateText(field.getErrorText());
          if (!firstInvalidInput) firstInvalidInput = oInput;

          return;
        }
        oInput.setValueState(ValueState.None);
      });

      if (firstInvalidInput) {
        firstInvalidInput.focus();
        return;
      }

      oModel.submitChanges({
        success: () => {
          BusyIndicator.hide();
          MessageToast.show(rb.getText("commentPostSuccess"));
          this._getFragmentControl("idNewCommentRow").setVisible(false);
          this._getFragmentControl("idSaveCommentButton").setVisible(false);
          this._getFragmentControl("idAddCommentButton").setVisible(true);
          this._getFragmentControl("idCancelCommentButton").setVisible(false);
        },
        error: (oError) => {
          BusyIndicator.hide();
          MessageBox.error(rb.getText("commentPostError"), {
            details: oError,
          });
        },
      });
    },

    onColumnListItemPress() {
      this.getOwnerComponent()
        .getRouter()
        .navTo("ObjectChartPage");
    },

    onDeleteButtonPress() {
      const oMainModel = this.getView().getModel();
      const oCtx = this.getView().getBindingContext();
      const sKey = oMainModel.createKey("/Products", oCtx.getObject());

      MessageBox.confirm(this._oResourceBundle.getText("confirmDeleteProductSingular"), {
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.OK) {
            BusyIndicator.show();
            oMainModel.remove(sKey, {
              success: () => {
                BusyIndicator.hide();
                MessageToast.show(
                  this._oResourceBundle.getText("productDeleteSuccessSingular"),
                  {
                    closeOnBrowserNavigation: false,
                  }
                );
                this.getOwnerComponent().getRouter().navTo("ListReport");
              },
              error: (oError) => {
                BusyIndicator.hide();
                MessageBox.error(this._oResourceBundle.getText("productDeleteError"), {
                  details: oError,
                });
              },
            });
          }
        },
      });
    },

    _showFormFragment(sFragmentName) {
      const currentFragment = this._objectPage.getContent()[0];

      if (currentFragment && currentFragment.getMetadata().getName().includes(sFragmentName)) {
        return;
      }

      this._getFormFragment(sFragmentName).then((oFragment) => {
        this._objectPage.removeAllContent();
        this._objectPage.insertContent(oFragment, 0);
      });
    },

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

    onEditButtonPress() {
      this._toggleButtonsAndView(true);
    },

    onCancelButtonPress() {
      const oModel = this.getView().getModel();
      const oRouter = this.getOwnerComponent().getRouter();

      if (oModel.hasPendingChanges()) {
        MessageBox.confirm(this._oResourceBundle.getText('inputDataLoss'), {
          onClose: (oAction) => {
            if (oAction === MessageBox.Action.OK) {
              this.getView().getModel().resetChanges();
              this._toggleButtonsAndView(false);
            }
          }
        });
      } else {
        this._toggleButtonsAndView(false);
        oRouter.initialize()
      }
    },

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

    _toggleButtonsAndView(bEdit) {
      const oRouter = this.getOwnerComponent().getRouter();

      this._bEditing = bEdit;

      this._editButton.setVisible(!bEdit);
      this._saveButton.setVisible(bEdit);
      this._cancelButton.setVisible(bEdit);

      this._showFormFragment(bEdit ? Constants.FRAGMENTS.EDIT_PRODUCT : Constants.FRAGMENTS.DISPLAY_PRODUCT);

      if (this._bEditing) {
        oRouter.stop()
      }
    },

    onDeleteCommentPress(oEvent) {
      const oListItem = oEvent.getParameter("listItem");
      const oCtx = oListItem.getBindingContext();
      const oModel = oCtx.getModel();
      const oComment = oCtx.getObject();
      const sKey = oModel.createKey("/ProductComments", {
        ID: oComment.ID
      });

      MessageBox.confirm(this._oResourceBundle.getText("confirmDeleteComment"), {
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.OK) {
            BusyIndicator.show();
            oModel.remove(sKey, {
              success: () => {
                BusyIndicator.hide();
                MessageToast.show(
                  this._oResourceBundle.getText("commentDeleteSuccess"),
                );
              },
              error: (oError) => {
                BusyIndicator.hide();
                MessageBox.error(this._oResourceBundle.getText("commentDeleteError"), {
                  details: oError,
                });
              },
            });
          }
        },
      });
    },

    /**
     * Navigate to item on press.
     * @public
     */
    onColumnListItemPress() {
      this.getOwnerComponent()
        .getRouter()
        .navTo("ObjectChartPage")
    }
  });
});