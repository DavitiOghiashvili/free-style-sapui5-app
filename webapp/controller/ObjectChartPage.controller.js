sap.ui.define(
  [
    'freestylesapui5app/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'freestylesapui5app/utils/Formatter',
    'freestylesapui5app/utils/Constants',
  ],
  (
    BaseController,
    JSONModel,
    MessageBox,
    Filter,
    FilterOperator,
    Formatter,
    Constants,
  ) => {
    'use strict';

    return BaseController.extend(
      'freestylesapui5app.controller.ObjectChartPage',
      {
        /**
         * Initializes the controller, fetches product counts by status, and sets up the chart
         * @public
         */
        onInit() {
          const oVizFrame = this.getView().byId('idVizFrame');
          const oPopOver = this.getView().byId('idPopover');
          oPopOver.connect(oVizFrame.getVizUid());

          const statuses = Object.values(Constants.PRODUCT_STATUS);
          const chartData = [];
          let amount = 0;

          statuses.forEach((status) => {
            this.getMainModel().read('/Products/$count', {
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
                MessageBox.error(this.i18n('productCountError'), {
                  details: error,
                });
              },
            });
          });
        },
      },
    );
  },
);
