sap.ui.define([
    'freestylesapui5app/controller/BaseController',
], function (BaseController) {
  "use strict";

  return BaseController.extend("freestylesapui5app.controller.App", {
    onInit: function () {
      this.oOwnerComponent = this.getOwnerComponent();
      this.oRouter = this.oOwnerComponent.getRouter();
      this.oRouter.attachRouteMatched(this.onRouteMatched, this);
    },

    onRouteMatched: function (oEvent) {
      let sRouteName = oEvent.getParameter("name"),
        oArguments = oEvent.getParameter("arguments");

      // Save the current route name
      this.currentRouteName = sRouteName;
      this.currentProduct = oArguments.Product_ID;
      console.log("this.currentRouteName", this.currentRouteName, "this.currentProduct", this.currentProduct);

    },

    onStateChanged (oEvent) {
      let bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
        sLayout = oEvent.getParameter("layout");

      // Replace the URL with the new layout if a navigation arrow was used
      if (bIsNavigationArrow) {
        this.oRouter.navTo(this.currentRouteName, { layout: sLayout, Product_ID: this.currentProduct }, true);
      }
    },

    onExit () {
      this.oRouter.detachRouteMatched(this.onRouteMatched, this);
    }
  });
});