sap.ui.define(['sap/ui/test/Opa5', 'sap/ui/test/actions/Press', 'sap/ui/test/actions/EnterText', 'sap/ui/test/matchers/PropertyStrictEquals'], function (Opa5, Press, EnterText, PropertyStrictEquals) {
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
        },

        iClickOnTheInvokeFunctionImportButton: function () {
          return this.waitFor({
            id: "idInvokeFunctionFromMetadataButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the button"
          });
        },

        iClickOnTheEditButton: function () {
          return this.waitFor({
            id: "idEditButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the button"
          });
        },

        iClickOnTheDeleteButton: function () {
          return this.waitFor({
            id: "idDeleteButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the button"
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

        iClickOnTheCancelEditButton: function () {
          return this.waitFor({
            id: "idCancelButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the button"
          });
        },

        iEditProductPrice: function () {
          return this.waitFor({
            id: "idEditPriceAmountInput",
            viewName: sViewName,
            actions: new EnterText({ text: "123" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "123");
            },
            errorMessage: "Could not find Product Name input field"
          });
        },

        iClickOnTheSaveEditButton: function () {
          return this.waitFor({
            id: "idSaveButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the button"
          });
        },

        iClickOnTheAddNewCommentButton: function () {
          return this.waitFor({
            id: "idAddNewCommentButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the button"
          });
        },

        iAddCommentAuthor: function () {
          return this.waitFor({
            id: "idAuthorInput",
            viewName: sViewName,
            actions: new EnterText({ text: "Axali authori" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "Axali authori");
            },
            errorMessage: "Could not find input field"
          });
        },

        iAddCommentMessage: function () {
          return this.waitFor({
            id: "idMessageInput",
            viewName: sViewName,
            actions: new EnterText({ text: "Axali mesiji" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "Axali mesiji");
            },
            errorMessage: "Could not find input field"
          });
        },

        iAddCommentRating: function () {
          return this.waitFor({
            id: "idRatingInput",
            viewName: sViewName,
            actions: new EnterText({ text: "1" }),
            success: function () {
              Opa5.assert.ok(true, "Entered product name: " + "1");
            },
            errorMessage: "Could not find input field"
          });
        },

        iClickOnTheSaveNewCommentButton: function () {
          return this.waitFor({
            id: "idSaveNewCommentButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the button"
          });
        },

        iClickOnTheCancelSavingNewCommentButton: function () {
          return this.waitFor({
            id: "idCancelNewCommentButton",
            viewName: sViewName,
            actions: new Press(),
            errorMessage: "Could not find the button"
          });
        },

        iDeleteTheSecondComment: function () {
          return this.waitFor({
            id: "idCommentTable",
            viewName: sViewName,
            success: function (oTable) {
              oTable.fireDelete({
                listItem: oTable.getItems()[1]
              });

              Opa5.assert.ok(true, "Triggered delete on the Second table item");
            },
            errorMessage: "Could not find the Comment table"
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

        iShouldSeeThePageObjectPageHeaderBar: function () {
          return this.waitFor({
            id: 'idObjectPageCustomHeaderBar',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'The ' + sViewName + ' view is displayed');
            },
            errorMessage: 'Did not find the ' + sViewName + ' view',
          });
        },

        iShouldSeeThePageObjectPageHeaderTitle: function () {
          return this.waitFor({
            id: 'idObjectPageDynamicHeaderTitle',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'The ' + sViewName + ' view is displayed');
            },
            errorMessage: 'Did not find the ' + sViewName + ' view',
          });
        },

        iShouldSeeThePageObjectPageHeaderInfo: function () {
          return this.waitFor({
            id: 'idHeaderInfoFlexBox',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'The ' + sViewName + ' view is displayed');
            },
            errorMessage: 'Did not find the ' + sViewName + ' view',
          });
        },

        iShouldSeeThePageObjectPageSectionGeneralInfo: function () {
          return this.waitFor({
            id: 'idObjectPageSectionGeneralInfo',
            viewName: sViewName,
            success: function () {
              Opa5.assert.ok(true, 'The ' + sViewName + ' view is displayed');
            },
            errorMessage: 'Did not find the ' + sViewName + ' view',
          });
        },

        iShouldSeeThePageObjectPageSectionComments: function () {
          return this.waitFor({
            id: 'idObjectPageSectionComments',
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
