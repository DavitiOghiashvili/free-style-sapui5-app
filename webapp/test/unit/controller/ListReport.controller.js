sap.ui.define(
  ['freestylesapui5app/controller/ListReport.controller',
    'freestylesapui5app/utils/Formatter',
    'freestylesapui5app/utils/Constants',
    'sap/ui/core/library',
  ],
  function (
    Controller,
    Formatter,
    Constants,
    coreLibrary
  ) {
    'use strict';
    const { ValueState } = coreLibrary;

    QUnit.module("Product status state and color, FORMATTER", () => {
      const statusStateTestCase = (oOptions) => {
        const sState = Formatter.productStatusState(oOptions.statusValue)

        oOptions.assert.strictEqual(sState, oOptions.expected, 'The status was assigned correctly')
      }

      QUnit.test('Should format OK status as Success color', (assert) => {
        statusStateTestCase.call(this, {
          assert: assert,
          statusValue: Constants.PRODUCT_STATUS.OK,
          expected: ValueState.Success
        })
      })

      QUnit.test('Should format STORAGE status as Warning color', (assert) => {
        statusStateTestCase.call(this, {
          assert: assert,
          statusValue: Constants.PRODUCT_STATUS.STORAGE,
          expected: ValueState.Warning
        })
      })

      QUnit.test('Should format OUT_OF_STOCK status as Error color', (assert) => {
        statusStateTestCase.call(this, {
          assert: assert,
          statusValue: Constants.PRODUCT_STATUS.OUT_OF_STOCK,
          expected: ValueState.Error
        })
      })

      QUnit.test('Should format everything that isn"t OK, STORAGE or OUT_OF_STOCK status as None color', (assert) => {
        statusStateTestCase.call(this, {
          assert: assert,
          statusValue: '',
          expected: ValueState.None
        })
      })
    });

    QUnit.module('Product creation/modification date formatter, FORMATTER', () => {
      const formatDateTestCase = (oOptions) => {
        const formatDate = Formatter.formatDate(oOptions.dateValue)

        oOptions.assert.strictEqual(formatDate, oOptions.expected, 'Product date has been formatted accordingly')
      }

      QUnit.test('Should format product date correctly', (assert) => {
        formatDateTestCase.call(this, {
          assert: assert,
          dateValue: new Date(1753430309333),
          expected: '2025-07-25'
        })
      })

      QUnit.test('Should handle product date absence', (assert) => {
        formatDateTestCase.call(this, {
          assert: assert,
          dateValue: '',
          expected: ''
        })
      })
    })


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