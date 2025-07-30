sap.ui.define([
    'freestylesapui5app/controller/ObjectPage.controller',
    'sap/ui/core/Messaging'
], function (
    Controller,
    Messaging
) {
    "use strict";

    QUnit.module("ObjectPage Controller", {
        beforeEach: function () {
            this.oController = new Controller();

            this.oCallFunctionStub = sinon.stub();

            this.oModelStub = {
                callFunction: this.oCallFunctionStub,
                createKey: sinon.stub(),
                resetChanges: sinon.stub()
            };

            sinon.stub(this.oController, "getModel").returns(this.oModelStub);

            this.navToStub = sinon.stub();
            this.oController.navTo = this.navToStub;

            this.oViewMock = {
                bindElement: sinon.stub(),
                addEventDelegate: sinon.stub()
            };
            this.oController.getView = () => this.oViewMock;

            this.oController._toggleButtonsAndView = sinon.stub();
            this.oController._resetCommentControls = sinon.stub();

            if (!Messaging.removeAllMessages.restore) {
                this.messagingStub = sinon.stub(Messaging, "removeAllMessages");
            }
        },

        afterEach: function () {
            sinon.restore();
        }
    });

    QUnit.test("Should bind product context and reset view", function (assert) {
        const oEventMock = {
            getParameter: sinon.stub().withArgs("arguments").returns({ Product_ID: "123" })
        };

        this.oModelStub.createKey.returns("/Products('123')");

        this.oController._onRouteMatched(oEventMock);

        assert.ok(this.oModelStub.createKey.calledOnce, "createKey was called");
        assert.strictEqual(this.oModelStub.createKey.firstCall.args[0], "/Products", "correct entity path");
        assert.deepEqual(this.oModelStub.createKey.firstCall.args[1], { ID: "123" }, "correct key object");

        assert.ok(this.oViewMock.bindElement.calledOnce, "bindElement was called");
        assert.deepEqual(this.oViewMock.bindElement.firstCall.args[0], { path: "/Products('123')" }, "bound to correct path");

        assert.ok(this.oModelStub.resetChanges.calledOnce, "resetChanges was called");
        assert.ok(this.oController._toggleButtonsAndView.calledOnce, "_toggleButtonsAndView called once");
        assert.strictEqual(this.oController._toggleButtonsAndView.firstCall.args[0], false, "called with false");

        assert.ok(this.messagingStub.calledOnce, "Messaging.removeAllMessages was called");
        assert.ok(this.oViewMock.addEventDelegate.calledOnce, "addEventDelegate was called");
    });

    QUnit.test("Should call /mutate and show result", function (assert) {
        this.oController.onInvokeFunctionFromMetadataButtonPress();

        assert.ok(this.oCallFunctionStub.calledOnce, "callFunction was called once");
    });

    QUnit.test("Should navigate to ObjectChartPage", function (assert) {
        this.oController.onColumnListItemPress();

        assert.ok(this.navToStub.calledOnce, "navTo was called once");
        assert.strictEqual(this.navToStub.firstCall.args[0], "ObjectChartPage",
            "Navigated to 'ObjectChartPage'");
    });
});
