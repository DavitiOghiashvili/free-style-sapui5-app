sap.ui.define(['sap/ui/test/Opa5', "sap/ui/core/util/MockServer"], function (Opa5, MockServer) {
  'use strict';

  return Opa5.extend('integration.arrangements.Startup', {
    iStartMyApp: function (oOptionsParameter) {
      const oMockServer = new MockServer({
        rootUri: "http://localhost:4004/v2/root/"

      });

      oMockServer.simulate("../../testdata/mockservice/metadata.xml", {
        sMockdataBaseUrl: "../../testdata/mockservice",
        bGenerateMissingMockData: true
      });

      oMockServer.start();

      const oOptions = oOptionsParameter || {};

      // start the app with a minimal delay to make tests fast but still async to discover basic timing issues
      oOptions.delay = oOptions.delay || 50;

      // start the app UI component
      this.iStartMyUIComponent({
        componentConfig: {
          name: 'freestylesapui5app',
          async: true,
        },
        hash: oOptions.hash,
        autoWait: oOptions.autoWait,
      });
    },
  });
});
