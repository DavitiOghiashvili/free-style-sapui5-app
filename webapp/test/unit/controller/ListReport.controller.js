sap.ui.define(
  ['freestylesapui5app/controller/ListReport.controller',
      "sap/ui/model/FilterOperator"
  ],
  function (
    Controller,
    FilterOperator
  ) {
    'use strict';

    QUnit.module("ListReport Controller - _getFiltersWithValues", (hooks) => {
      hooks.beforeEach(function () {
        this.oController = new Controller();

        const oControlWithKeys = {
          getSelectedKeys: () => ["A", "B"]
        };

        const oControlNoKeys = {
          getSelectedKeys: () => []
        };

        this.oFilterGroupItem1 = {
          getControl: () => oControlWithKeys
        };

        this.oFilterGroupItem2 = {
          getControl: () => oControlNoKeys
        };

        this.oController._oFilterBar = {
          getFilterGroupItems: () => [this.oFilterGroupItem1, this.oFilterGroupItem2]
        };
      });

      QUnit.test("Should return only filter group items with selected keys", function (assert) {
        const result = this.oController._getFiltersWithValues();

        assert.strictEqual(result.length, 1, "Only one filter item returned");
        assert.strictEqual(result[0], this.oFilterGroupItem1, "Correct filter item returned");
      });
    });


    QUnit.module("ListReport Controller - onColumnListItemPress", {
      beforeEach: function () {
        this.oController = new Controller();

        sinon.stub(this.oController, "navTo");
      },

      afterEach: function () {
        sinon.restore();
      }
    });

    QUnit.test("Should navigate to ObjectPage with Product_ID", function (assert) {
      const oFakeContext = {
        getProperty: sinon.stub().withArgs("ID").returns("123")
      };

      const oFakeEvent = {
        getSource: () => ({
          getBindingContext: () => oFakeContext
        })
      };

      this.oController.onColumnListItemPress(oFakeEvent);

      assert.ok(this.oController.navTo.calledOnce, "navTo was called");
      assert.deepEqual(this.oController.navTo.firstCall.args[1], { Product_ID: "123" }, "Correct Product_ID passed");
    });


    QUnit.module("ListReport Controller - onProductsTableSelectionChange", {
      beforeEach: function () {
        this.oController = new Controller();

        this.oController._oProductDeleteButton = {
          setEnabled: sinon.stub()
        };
      },

      afterEach: function () {
        sinon.restore();
      }
    });

    QUnit.test("Should disable delete button when no item is selected", function (assert) {
      const oFakeEvent = {
        getSource: () => ({
          getSelectedContexts: () => []
        })
      };

      this.oController.onProductsTableSelectionChange(oFakeEvent);

      const stub = this.oController._oProductDeleteButton.setEnabled;
      assert.ok(stub.calledOnce, "setEnabled was called once");
      assert.strictEqual(stub.firstCall.args[0], false, "Delete button is disabled");
    });

    QUnit.test("should enable delete button when items are selected", function (assert) {
      const oFakeEvent = {
        getSource: () => ({
          getSelectedContexts: () => [{}, {}]
        })
      };

      this.oController.onProductsTableSelectionChange(oFakeEvent);

      const stub = this.oController._oProductDeleteButton.setEnabled;
      assert.ok(stub.calledOnce, "setEnabled was called once");
      assert.strictEqual(stub.firstCall.args[0], true, "Delete button is enabled");
    });

  });