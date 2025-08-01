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
    });

    opaTest("Should open and close Product create dialog", function (Given, When, Then) {
        When.onTheListReportPage.iClickOnTheCreateButton()

        Then.onTheListReportPage.iShouldSeeTheProductCreateDialog();

        When.onTheListReportPage.iClickOnTheSelectStoreButton()
        When.onTheListReportPage.iClickOnTheSelectStoreFirstItem()
        When.onTheListReportPage.iClickOnTheCancelProductCreateDialogButton()
    });

    opaTest("Should create product successfully", function (Given, When, Then) {
        When.onTheListReportPage.iClickOnTheCreateButton()

        Then.onTheListReportPage.iShouldSeeTheProductCreateDialog();
        When.onTheListReportPage.iClickOnTheSelectStoreButton()
        When.onTheListReportPage.iClickOnTheSelectStoreFirstItem()
        When.onTheListReportPage.iEnterProductName();
        When.onTheListReportPage.iEnterProductPrice();
        When.onTheListReportPage.iEnterProductSpecs();
        When.onTheListReportPage.iEnterProductRating();
        When.onTheListReportPage.iEnterProductSupplierInfo();
        When.onTheListReportPage.iEnterProductMadeIn();
        When.onTheListReportPage.iEnterProductProdCompany();

        When.onTheListReportPage.iClickOnTheOpenProductStatusSelect();
        When.onTheListReportPage.iClickOnTheStatusSelectItem()

        When.onTheListReportPage.iClickOnTheConfirmProductCreateButton();
        Then.iTeardownMyApp();
    });

    opaTest("Should validate fields before creating product", function (Given, When, Then) {
        Given.iStartMyApp();
        When.onTheListReportPage.iClickOnTheCreateButton()

        Then.onTheListReportPage.iShouldSeeTheProductCreateDialog();
        When.onTheListReportPage.iClickOnTheSelectStoreButton()
        When.onTheListReportPage.iClickOnTheSelectStoreFirstItem()

        When.onTheListReportPage.iEnterProductSpecs();
        When.onTheListReportPage.iEnterProductRating();
        When.onTheListReportPage.iEnterProductSupplierInfo();
        When.onTheListReportPage.iEnterProductMadeIn();
        When.onTheListReportPage.iEnterProductProdCompany();

        When.onTheListReportPage.iClickOnTheOpenProductStatusSelect();
        When.onTheListReportPage.iClickOnTheStatusSelectItem()

        When.onTheListReportPage.iClickOnTheConfirmProductCreateButton();
        Then.iTeardownMyApp();
    });

    opaTest("Should appear confirmation before closing create dialog with inputted info", function (Given, When, Then) {
        Given.iStartMyApp();
        When.onTheListReportPage.iClickOnTheCreateButton()

        Then.onTheListReportPage.iShouldSeeTheProductCreateDialog();
        When.onTheListReportPage.iClickOnTheSelectStoreButton()
        When.onTheListReportPage.iClickOnTheSelectStoreFirstItem()
        When.onTheListReportPage.iEnterProductName();
        When.onTheListReportPage.iEnterProductPrice();
        When.onTheListReportPage.iEnterProductSpecs();
        When.onTheListReportPage.iEnterProductRating();
        When.onTheListReportPage.iEnterProductSupplierInfo();
        When.onTheListReportPage.iEnterProductMadeIn();
        When.onTheListReportPage.iEnterProductProdCompany();

        When.onTheListReportPage.iClickOnTheOpenProductStatusSelect();
        When.onTheListReportPage.iClickOnTheStatusSelectItem()

        When.onTheListReportPage.iClickOnTheCancelProductCreateDialogButton();
        Then.iTeardownMyApp();
    });

    opaTest("Should confirm closing product create dialog", function (Given, When, Then) {
        Given.iStartMyApp();
        When.onTheListReportPage.iClickOnTheCreateButton()

        Then.onTheListReportPage.iShouldSeeTheProductCreateDialog();
        When.onTheListReportPage.iClickOnTheSelectStoreButton()
        When.onTheListReportPage.iClickOnTheSelectStoreFirstItem()
        When.onTheListReportPage.iEnterProductName();
        When.onTheListReportPage.iEnterProductPrice();
        When.onTheListReportPage.iEnterProductSpecs();
        When.onTheListReportPage.iEnterProductRating();
        When.onTheListReportPage.iEnterProductSupplierInfo();
        When.onTheListReportPage.iEnterProductMadeIn();
        When.onTheListReportPage.iEnterProductProdCompany();

        When.onTheListReportPage.iClickOnTheOpenProductStatusSelect();
        When.onTheListReportPage.iClickOnTheStatusSelectItem()

        When.onTheListReportPage.iClickOnTheCancelProductCreateDialogButton();
        When.onTheListReportPage.iConfirmTheMessageBox();
        Then.iTeardownMyApp();
    });

    opaTest("Should close product create dialog", function (Given, When, Then) {
        Given.iStartMyApp();
        When.onTheListReportPage.iClickOnTheCreateButton()

        Then.onTheListReportPage.iShouldSeeTheProductCreateDialog();
        When.onTheListReportPage.iClickOnTheSelectStoreButton()
        When.onTheListReportPage.iClickOnTheSelectStoreFirstItem()
        When.onTheListReportPage.iEnterProductName();
        When.onTheListReportPage.iEnterProductPrice();
        When.onTheListReportPage.iEnterProductSpecs();
        When.onTheListReportPage.iEnterProductRating();
        When.onTheListReportPage.iEnterProductSupplierInfo();
        When.onTheListReportPage.iEnterProductMadeIn();
        When.onTheListReportPage.iEnterProductProdCompany();

        When.onTheListReportPage.iClickOnTheOpenProductStatusSelect();
        When.onTheListReportPage.iClickOnTheStatusSelectItem()

        When.onTheListReportPage.iClickOnTheCancelProductCreateDialogButton();
        When.onTheListReportPage.iCancelTheMessageBox();
        Then.iTeardownMyApp();
    });



});