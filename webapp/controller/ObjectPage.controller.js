sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "freestylesapui5app/utils/Formatter",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/core/BusyIndicator",
], function (Controller,
  Formatter,
  MessageBox,
  MessageToast,
  BusyIndicator,) {
  "use strict";
  return Controller.extend("freestylesapui5app.controller.ObjectPage", {
    formatter: Formatter,

    onInit() {
      this._oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      this.getOwnerComponent()
        .getRouter()
        .getRoute("ObjectPage")
        .attachPatternMatched(this._onRouteMatched, this);

      const oViewModel = new sap.ui.model.json.JSONModel({
        editMode: false
      });
      this.getView().setModel(oViewModel, "viewModel");
    },

    /**
     * Bind view to store data on route match.
     * @param oEvent - The route matched event.
     * @private
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
    },

    /**
     * Navigate to item on press.
     * @public
     */
    onColumnListItemPress() {
      this.getOwnerComponent()
        .getRouter()
        .navTo("ObjectChartPage")
    },

    /**
       * Product delete button handler.
       * @public
       */
    onDeleteButtonPress() {
      const oMainModel = this.getView().getModel();
      const oCtx = this.getView().getBindingContext();
      const sKey = oMainModel.createKey("/Products", oCtx.getObject());

      MessageBox.confirm(this._oResourceBundle.getText("confirmDeleteProduct"), {
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.OK) {
            BusyIndicator.show();
            oMainModel.remove(sKey, {
              success: () => {
                BusyIndicator.hide();
                MessageToast.show(
                  this._oResourceBundle.getText("productDeleteSuccess"),
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
  });
});