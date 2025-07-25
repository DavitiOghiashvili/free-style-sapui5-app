sap.ui.define(
  ['freestylesapui5app/utils/Formatter',
    'freestylesapui5app/utils/Constants',
    'sap/ui/core/library',
  ],
  function (
    Formatter,
    Constants,
    coreLibrary
  ) {
    'use strict';
    const { ValueState } = coreLibrary;

    QUnit.module("Product status state and color", () => {
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

    QUnit.module('Product creation/modification date formatter', () => {
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
  });