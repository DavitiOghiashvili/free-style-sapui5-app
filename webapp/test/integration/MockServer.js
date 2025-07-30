sap.ui.define([
  "sap/ui/core/util/MockServer"
], function (MockServer) {
  "use strict";

  return {
    init: function () {
      const oMockServer = new MockServer({
        rootUri: "http://localhost:4004/v2/root/"
      });

      const sPath = sap.ui.require.toUrl("freestylesapui5app/test/testdata/mockservice");

      oMockServer.simulate(sPath + "/metadata.xml", {
        sMockdataBaseUrl: sPath,
        bGenerateMissingMockData: true
      });

      oMockServer.start();
    }
  };
});
