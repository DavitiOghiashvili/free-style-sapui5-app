sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
  'use strict';
  const sViewName = 'ListReport';

  Opa5.createPageObjects({
    onTheListReportPage: {
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
        iShouldSeeThePageListReport: function () {
          return this.waitFor({
            id: 'idListReportPage',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'The ' + sViewName + ' view is displayed');
            },
            errorMessage: 'Did not find the ' + sViewName + ' view',
          });
        },

        iShouldSeeTheTitle: function () {
          return this.waitFor({
            id: 'idTitle',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'Title is visible');
            },
            errorMessage: 'Title not found',
          });
        },

        iShouldSeeTheFilterBar: function () {
          return this.waitFor({
            id: 'idFilterBar',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'Filter bar is visible');
            },
            errorMessage: 'Filter bar not found',
          });
        },
        
        iShouldSeeTheFilterBar: function () {
          return this.waitFor({
            id: 'idFilterBar',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'Filter bar is visible');
            },
            errorMessage: 'Filter bar not found',
          });
        },

        iShouldSeeTheProductsTable: function () {
          return this.waitFor({
            id: 'idProductsTable',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'Products Table is visible');
            },
            errorMessage: 'Products Table not found',
          });
        },
      },
    },
  });
});
