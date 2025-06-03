sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'freestylesapui5app/utils/Formatter'
], (Controller, JSONModel, MessageBox, Formatter) => {
    "use strict";

    return Controller.extend("freestylesapui5app.controller.ObjectChartPage", {
        onInit() {
            const i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            const oModel = this.getOwnerComponent().getModel();

            const oVizFrame = this.getView().byId("idVizFrame");
            const oPopOver = this.getView().byId("idPopover");
            oPopOver.connect(oVizFrame.getVizUid());

            oModel.read("/Products", {
                success: (oData) => {
                    const statusCounts = oData.results.reduce((total, product) => {
                        total[product.Status] = (total[product.Status] || 0) + 1;
                        return total;
                    }, {});

                    const chartData = Object.keys(statusCounts).map(status => ({
                        Status: Formatter.productStatusText(status),
                        Count: statusCounts[status]
                    }));

                    oVizFrame.setModel(new JSONModel({ Products: chartData }));
                },
                error: (error) => {
                    MessageBox.error(i18n.getText("productCountError"), { details: error });
                }
            });
        }
    });
});