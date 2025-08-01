sap.ui.define([
    'sap/ui/test/opaQunit', 'sap/ui/test/Opa5', './pages/ObjectPage',
], function (
    opaTest,
    Opa5
) {
    "use strict";

    QUnit.module('ObjectPage Journey');

    opaTest("Should see the ObjectPage header and it's components", function (Given, When, Then) {
        Given.iStartMyApp();
        When.onTheListReportPage.iClickOnTheFirstItem();
        Then.onTheObjectPage.iShouldSeeThePageObjectPageHeaderBar();
        Then.onTheObjectPage.iShouldSeeThePageObjectPageHeaderTitle();
        Then.onTheObjectPage.iShouldSeeThePageObjectPageHeaderInfo();
    });

    opaTest("Should see the ObjectPage sections", function (Given, When, Then) {
        Then.onTheObjectPage.iShouldSeeThePageObjectPageSectionGeneralInfo();
        Then.onTheObjectPage.iShouldSeeThePageObjectPageSectionComments();
    });

    opaTest("Should click on function import button", function (Given, When, Then) {
        When.onTheObjectPage.iClickOnTheInvokeFunctionImportButton();

        Then.waitFor({
            success: function () {
                Opa5.assert.ok(true, "Button was clicked");
            }
        });
    });

    opaTest("Should click on edit button", function (Given, When, Then) {
        When.onTheObjectPage.iClickOnTheEditButton();

        Then.waitFor({
            success: function () {
                Opa5.assert.ok(true, "Button was clicked");
            }
        });
    });

    opaTest("Should click on delete product", function (Given, When, Then) {
        When.onTheObjectPage.iClickOnTheDeleteButton();

        Then.waitFor({
            success: function () {
                Opa5.assert.ok(true, "Button was clicked");
            }
        });

        When.onTheObjectPage.iConfirmTheMessageBox();
    });

    opaTest("Should cancel product deletion", function (Given, When, Then) {
        When.onTheListReportPage.iClickOnTheFirstItem();

        Then.onTheObjectPage.iShouldSeeThePageObjectPage();

        When.onTheObjectPage.iClickOnTheEditButton();
        When.onTheObjectPage.iClickOnTheDeleteButton();
        When.onTheObjectPage.iCancelTheMessageBox();
    });

    opaTest("Should close edit dialog", function (Given, When, Then) {
        When.onTheObjectPage.iClickOnTheCancelEditButton();
        When.onTheObjectPage.iConfirmTheMessageBox();
        Then.iTeardownMyApp();
    });

    opaTest("Should edit product price and save", function (Given, When, Then) {
        Given.iStartMyApp();
        When.onTheListReportPage.iClickOnTheFirstItem();
        When.onTheObjectPage.iClickOnTheEditButton();
        When.onTheObjectPage.iEditProductPrice();
        When.onTheObjectPage.iClickOnTheSaveEditButton();
    });

    opaTest("Should edit product price and cancel", function (Given, When, Then) {
        When.onTheObjectPage.iClickOnTheEditButton();
        When.onTheObjectPage.iEditProductPrice();
        When.onTheObjectPage.iClickOnTheCancelEditButton();
    });

    opaTest("Should add new comment", function (Given, When, Then) {
        When.onTheObjectPage.iClickOnTheAddNewCommentButton();
        When.onTheObjectPage.iAddCommentAuthor();
        When.onTheObjectPage.iAddCommentMessage();
        When.onTheObjectPage.iAddCommentRating();
        When.onTheObjectPage.iClickOnTheSaveNewCommentButton();
    });

    opaTest("Should cancel adding new comment", function (Given, When, Then) {
        When.onTheObjectPage.iClickOnTheAddNewCommentButton();
        When.onTheObjectPage.iAddCommentAuthor();
        When.onTheObjectPage.iAddCommentMessage();
        When.onTheObjectPage.iAddCommentRating();
        When.onTheObjectPage.iClickOnTheCancelSavingNewCommentButton();
        When.onTheObjectPage.iConfirmTheMessageBox();
    });
    opaTest("Should delete existing comment", function (Given, When, Then) {
        When.onTheObjectPage.iDeleteTheSecondComment();
        When.onTheObjectPage.iConfirmTheMessageBox();
    });

    opaTest("Should click on first comment", function (Given, When, Then) {
        When.onTheObjectPage.iClickOnTheFirstItem();

         Then.waitFor({
            success: function () {
                Opa5.assert.ok(true, "Button was clicked");
            }
        });

        Then.iTeardownMyApp();
    });

});