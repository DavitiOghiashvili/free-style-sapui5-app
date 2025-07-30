/* global QUnit */

sap.ui.require(
  ['freestylesapui5app/test/integration/AllJourneys',
    'freestylesapui5app/test/integration/ListReportJourney',
    'freestylesapui5app/test/integration/ObjectPageJourney',
    'freestylesapui5app/test/integration/ObjectChartPageJourney'
  ],
  function () {
    QUnit.config.autostart = false;
    QUnit.start();
  },
);
