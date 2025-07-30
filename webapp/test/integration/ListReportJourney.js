sap.ui.define([
    'sap/ui/test/opaQunit', './pages/ListReport',
], function (
    opaTest
) {
    "use strict";

    QUnit.module('ListReport Journey');

    opaTest("Should see the ListReport Title", function (Given, When, Then) {
        Given.iStartMyApp();

        Then.onTheListReportPage.iShouldSeeTheTitle();
    });

    opaTest("Should see the ListReport filter bar", function (Given, When, Then) {
        Then.onTheListReportPage.iShouldSeeTheFilterBar();
    });

    opaTest("Should see the ListReport Products Table", function (Given, When, Then) {
        Then.onTheListReportPage.iShouldSeeTheProductsTable();

        When.onTheListReportPage.iClickOnTheCreateButton()
        When.onTheListReportPage.iClickOnTheCancelProductCreateDialogButton()

        Then.iTeardownMyApp()
    });

});