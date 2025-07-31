sap.ui.define([
  'sap/ui/test/Opa5',
  'sap/ui/test/actions/Press',
  'sap/ui/test/actions/EnterText',
  'sap/ui/test/matchers/PropertyStrictEquals'
], function (
  Opa5,
  Press,
  EnterText,
  PropertyStrictEquals
) {
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
        },

        iClickOnTheCreateButton: function () {
          return this.waitFor({
            id: "idCreateProductButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the Create button"
          });
        },

        iClickOnTheSelectStoreButton: function () {
          return this.waitFor({
            id: "idSelectStoreButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the Select store button"
          });
        },

        iClickOnTheSelectStoreFirstItem: function () {
          return this.waitFor({
            controlType: "sap.m.StandardListItem",
            success: function (aItems) {
              aItems[0].$().trigger("tap");
            },
            errorMessage: "Could not find any list items"
          });
        },

        iEnterProductName: function () {
          return this.waitFor({
            id: "idNameInput",
            viewName: sViewName,
            actions: new EnterText({ text: "Axali" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "Axali");
            },
            errorMessage: "Could not find Product Name input field"
          });
        },

        iEnterProductPrice: function () {
          return this.waitFor({
            id: "idPriceAmountInput",
            viewName: sViewName,
            actions: new EnterText({ text: "123" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "123");
            },
            errorMessage: "Could not find Product Name input field"
          });
        },

        iEnterProductSpecs: function () {
          return this.waitFor({
            id: "idSpecsInput",
            viewName: sViewName,
            actions: new EnterText({ text: "Specsi" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "Specsi");
            },
            errorMessage: "Could not find Product Name input field"
          });
        },

        iEnterProductRating: function () {
          return this.waitFor({
            id: "idRatingStepInput",
            viewName: sViewName,
            actions: new EnterText({ text: "3" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "3");
            },
            errorMessage: "Could not find Product Name input field"
          });
        },

        iEnterProductSupplierInfo: function () {
          return this.waitFor({
            id: "idSupplierInfoInput",
            viewName: sViewName,
            actions: new EnterText({ text: "Axlis info" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "Axlis info");
            },
            errorMessage: "Could not find Product Name input field"
          });
        },

        iEnterProductMadeIn: function () {
          return this.waitFor({
            id: "idMadeInInput",
            viewName: sViewName,
            actions: new EnterText({ text: "Made inis info" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "Made inis info");
            },
            errorMessage: "Could not find Product Name input field"
          });
        },

        iEnterProductProdCompany: function () {
          return this.waitFor({
            id: "idProductionCompanyNameInput",
            viewName: sViewName,
            actions: new EnterText({ text: "Qartuli compania" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "Qartuli compania");
            },
            errorMessage: "Could not find Product Name input field"
          });
        },

        iClickOnTheOpenProductStatusSelect: function () {
          return this.waitFor({
            id: "idSelectStatus",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not press the Product Status select"
          });
        },

        iClickOnTheStatusSelectItem: function () {
          return this.waitFor({
            controlType: "sap.ui.core.Item",
            success: function (aItems) {
              aItems[2].$().trigger("tap");
            },
            errorMessage: "Could not find any status list items in the dropdown"
          });
        },

        iClickOnTheConfirmProductCreateButton: function () {
          return this.waitFor({
            id: "idConfirmProductCreateButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the Create button"
          });
        },

        iClickOnTheCancelProductCreateDialogButton: function () {
          return this.waitFor({
            id: "idCancelProductCreateDialogButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the Cancel button"
          });
        },

        iConfirmTheMessageBox: function () {
          return this.waitFor({
            controlType: "sap.m.Button",
            matchers: [
              new PropertyStrictEquals({
                name: "text",
                value: "OK"
              }),
            ],
            actions: new Press(),
            success: function () {
              Opa5.assert.ok(true, "Pressed OK on the MessageBox");
            },
            errorMessage: "Could not find or press the OK button on the MessageBox"
          });
        },

        iCancelTheMessageBox: function () {
          return this.waitFor({
            controlType: "sap.m.Button",
            matchers: [
              new PropertyStrictEquals({
                name: "text",
                value: "Cancel"
              }),
            ],
            actions: new Press(),
            success: function () {
              Opa5.assert.ok(true, "Pressed Cancel on the MessageBox");
            },
            errorMessage: "Could not find or press the Cancel button on the MessageBox"
          });
        },

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

        iShouldSeeTheProductCreateDialog: function () {
          return this.waitFor({
            id: 'idCreateProductDialog',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, "Product Create Dialog is visible");
            },
            errorMessage: "Product Create Dialog not found"
          });
        }
        
      },
    },
  });
});
