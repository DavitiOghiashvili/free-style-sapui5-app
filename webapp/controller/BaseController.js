sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict';

  return Controller.extend('freestylesapui5app.controller.BaseController', {
    getRoute(sName) {
      return this.getOwnerComponent().getRouter().getRoute(sName);
    },

    /**
     * Returns a model by name from the view.
     * @param {string} [sName] - Optional model name.
     * @returns {sap.ui.model.Model} The requested model.
     * @public
     */
    getModel(sName) {
      return this.getView().getModel(sName);
    },

    /**
     * Sets a model on the view.
     * @param {sap.ui.model.Model} oModel - The model instance.
     * @param {string} sName - Model name.
     * @returns {sap.ui.core.mvc.View} The view instance.
     * @public
     */
    setModel(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    /**
     * Retrieves a localized text from the i18n model.
     * @param {string} sText - i18n key.
     * @param {string[]|string|number} [aArgs] - Optional arguments for placeholders.
     * @returns {string} Localized and formatted text.
     * @public
     */
    i18n(sText, aArgs) {
      return this.getOwnerComponent()
        .getModel('i18n')
        .getResourceBundle()
        .getText(sText, aArgs);
    },

    /**
     * Navigates to a specific route.
     * @param {string} sName - Route name.
     * @param {object} [oID] - Optional parameters (e.g., object ID).
     * @public
     */
    navTo(sName, oID) {
      this.getOwnerComponent().getRouter().navTo(sName, oID);
    },
  });
});
