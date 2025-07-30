sap.ui.define([
  "sap/ui/test/Opa5",
  "freestylesapui5app/test/integration/MockServer"
], function (Opa5, MockServer) {
  "use strict";

  return Opa5.extend("freestylesapui5app.test.integration.arrangements.Startup", {
    iStartMyApp: function (oOptionsParameter) {
      MockServer.init();

      const oOptions = oOptionsParameter || {};
      oOptions.delay = oOptions.delay || 50;

      this.iStartMyUIComponent({
        componentConfig: {
          name: "freestylesapui5app",
          async: true,
        },
        hash: oOptions.hash,
        autoWait: oOptions.autoWait,
      });
    }
  });
});
