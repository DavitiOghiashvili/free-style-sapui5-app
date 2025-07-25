sap.ui.define(
  ['freestylesapui5app/controller/ListReport.controller'],
  function (
    Controller
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

  });