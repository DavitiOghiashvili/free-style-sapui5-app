sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'freestylesapui5app/utils/Formatter',
  ],
  (Controller, JSONModel, MessageBox, Filter, FilterOperator, Formatter) => {
    'use strict';

    return Controller.extend('freestylesapui5app.controller.ObjectChartPage', {
      /**
       * Initializes the controller, fetches product counts by status, and sets up the chart
       * @public
       */
      onInit() {
        const i18n = this.getOwnerComponent()
          .getModel('i18n')
          .getResourceBundle();
        const oModel = this.getOwnerComponent().getModel();

        const oVizFrame = this.getView().byId('idVizFrame');
        const oPopOver = this.getView().byId('idPopover');
        oPopOver.connect(oVizFrame.getVizUid());

        const statuses = ['OK', 'STORAGE', 'OUT_OF_STOCK'];
        const chartData = [];
        let amount = 0;

        statuses.forEach((status) => {
          oModel.read('/Products/$count', {
            filters: [new Filter('Status', FilterOperator.EQ, status)],
            success: (count) => {
              chartData.push({
                Status: Formatter.productStatusText(status),
                Count: count,
              });
              amount++;
              if (amount === statuses.length) {
                oVizFrame.setModel(new JSONModel({ Products: chartData }));
              }
            },
            error: (error) => {
              MessageBox.error(i18n.getText('productCountError'), {
                details: error,
              });
            },
          });
        });
      },
    });
  },
);
