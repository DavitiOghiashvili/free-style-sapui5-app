sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict';

  return Controller.extend('freestylesapui5app.controller.BaseController', {
    getRoute(sName) {
      return this.getOwnerComponent().getRouter().getRoute(sName);
    },

    getMainModel() {
      return this.getOwnerComponent().getModel();
    },

    getModel() {
      return this.getView().getModel();
    },

    getNamedModel(sName) {
      return this.getView().getModel(sName);
    },

    setNamedModel(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    getResourceBundleText(sText) {
      return this.getOwnerComponent()
        .getModel('i18n')
        .getResourceBundle()
        .getText(sText);
    },

    getResourceBundleTextWithParam(sText, Param) {
      return this.getOwnerComponent()
        .getModel('i18n')
        .getResourceBundle()
        .getText(sText, Param);
    },

    navTo(sName) {
      this.getOwnerComponent().getRouter().navTo(sName);
    },

    navToWithParameters(sName, ID) {
      this.getOwnerComponent().getRouter().navTo(sName, ID);
    },
  });
});
