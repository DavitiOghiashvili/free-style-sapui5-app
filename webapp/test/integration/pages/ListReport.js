sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
  'use strict';
  const sViewName = 'ListReport';

  Opa5.createPageObjects({
    onTheViewPage: {
      actions: {},

      assertions: {
        iShouldSeeThePageView: function () {
          return this.waitFor({
            id: 'idListReportPage',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'The ' + sViewName + ' view is displayed');
            },
            errorMessage: 'Did not find the ' + sViewName + ' view',
          });
        },
      },
    },
  });
});
