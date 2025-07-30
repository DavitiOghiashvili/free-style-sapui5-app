sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
  'use strict';
  const sViewName = 'ObjectPage';

  Opa5.createPageObjects({
    onTheObjectPage: {
      actions: {
        iClickOnTheFirstItem: function () {
          return this.waitFor({
            controlType: "sap.m.ColumnListItem",
            success: function (aItems) {
              aItems[0].$().trigger("tap");
            },
            errorMessage: "Could not find any list items"
          });
        }
      },

      assertions: {
        iShouldSeeThePageObjectPage: function () {
          return this.waitFor({
            id: 'idObjectPage',
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
