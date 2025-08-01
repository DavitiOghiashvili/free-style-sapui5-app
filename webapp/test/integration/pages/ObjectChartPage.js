sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
  'use strict';
  const sViewName = 'ObjectChartPage';

  Opa5.createPageObjects({
    onTheObjectChartPage: {
      actions: {},

      assertions: {
        iShouldSeeThePageObjectChartPage: function () {
          return this.waitFor({
            id: 'idObjectChartPage',
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
