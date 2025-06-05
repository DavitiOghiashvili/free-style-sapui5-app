sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "freestylesapui5app/utils/Formatter"
], function (Controller,
  Formatter) {
  "use strict";
  return Controller.extend("freestylesapui5app.controller.ObjectPage", {
    formatter: Formatter,

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
    }
  });
});