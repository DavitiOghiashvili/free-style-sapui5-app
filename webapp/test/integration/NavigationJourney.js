/*global QUnit*/

sap.ui.define(
  ['sap/ui/test/opaQunit', './pages/App', './pages/ListReport', './pages/ObjectPage', './pages/ObjectChartPage'],
  function (opaTest) {
    'use strict';

    QUnit.module('Navigation Journey');

    opaTest("Should see the ListReport view", function (Given, When, Then) {
      Given.iStartMyApp();

      Then.onTheListReportPage.iShouldSeeThePageListReport();
    });

    opaTest("Should see the ObjectPage view", function (Given, When, Then) {
      When.onTheListReportPage.iClickOnTheFirstItem();

      Then.onTheObjectPage.iShouldSeeThePageObjectPage();
    });

    opaTest("Should see the ObjectChartPage view", function (Given, When, Then) {
      When.onTheObjectPage.iClickOnTheFirstItem();

      Then.onTheObjectChartPage.iShouldSeeThePageObjectChartPage();

      Then.iTeardownMyApp();
    });
  },
);
