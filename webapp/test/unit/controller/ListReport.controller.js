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

    QUnit.module("Status State and color", () => {

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
  });