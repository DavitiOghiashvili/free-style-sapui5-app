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

        Then.iTeardownMyApp()
    });

    opaTest("Should see the ListReport filter bar", function (Given, When, Then) {
        Given.iStartMyApp();

        Then.onTheListReportPage.iShouldSeeTheFilterBar();

        Then.iTeardownMyApp()
    });

    opaTest("Should see the ListReport Products Table", function (Given, When, Then) {
        Given.iStartMyApp();

        Then.onTheListReportPage.iShouldSeeTheProductsTable();

        Then.iTeardownMyApp()
    });

});