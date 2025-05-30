sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("freestylesapui5app.controller.ObjectPage", {
    onInit() {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("ObjectPage")
        .attachPatternMatched(this._onRouteMatched, this);
    },

    /**
     * Bind view to store data on route match.
     * @param oEvent - The route matched event.
     * @private
     */
    _onRouteMatched(oEvent) {
      this._sProductId = oEvent.getParameter("arguments").Product_ID;
      const oModel = this.getView().getModel();

      const sKey = oModel.createKey("/Products", {
        ID: this._sProductId,
      });

      this.getView().bindElement({
        path: sKey,
      });
    },
  });
});