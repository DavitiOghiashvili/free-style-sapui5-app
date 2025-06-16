sap.ui.define(
  ['sap/ui/core/UIComponent', 'freestylesapui5app/model/models', 'sap/f/library'],
  (UIComponent, models, fioriLibrary) => {
    'use strict';

    return UIComponent.extend('freestylesapui5app.Component', {
      metadata: {
        manifest: 'json',
        interfaces: ['sap.ui.core.IAsyncContentCreation'],
      },

      init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // set the device model
        this.setModel(models.createDeviceModel(), 'device');

        this.getRouter().attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
        // enable routing
        this.getRouter().initialize();
      },

      _onBeforeRouteMatched: function (oEvent) {
        const oModel = this.getModel();
        let sLayout = oEvent.getParameters().arguments.layout;

        if (!sLayout) {
          sLayout = fioriLibrary.LayoutType.OneColumn;
        }

        oModel.setProperty("/layout", sLayout);
      }
    });
  },
);
