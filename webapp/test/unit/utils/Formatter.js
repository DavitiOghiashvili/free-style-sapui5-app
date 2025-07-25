sap.ui.define([
    'freestylesapui5app/utils/Formatter',
    'freestylesapui5app/utils/Constants',
    'sap/ui/core/library',
], function (
    Formatter,
    Constants,
    coreLibrary,
) {
    "use strict";
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


    QUnit.module('Display proper product status text from i18n, FORMATTER', () => {
        const productStatusTestCase = (oOptions) => {
            const productStatusText = Formatter.productStatusText(oOptions.sStatusValue);

            oOptions.assert.strictEqual(productStatusText, oOptions.expected, 'Product status text displayed correctly')
        }

        QUnit.test('Should get proper i18n text from resource bundle for status', (assert) => {
            productStatusTestCase.call(this, {
                assert: assert,
                sStatusValue: 'OUT_OF_STOCK',
                expected: 'Out of stock'
            })
        })
    })


    QUnit.module('Display correct title according to product count, FORMATTER', () => {
        const formatProductCountTitleTestCase = (oOptions) => {
            const formatProductCountTitle = Formatter.formatProductCountTitle(oOptions.iCount)

            oOptions.assert.strictEqual(formatProductCountTitle, oOptions.expected, 'Displayed correct title')
        }

        QUnit.test('Should show correct title for multiple products', (assert) => {
            formatProductCountTitleTestCase.call(this, {
                assert: assert,
                iCount: 2,
                expected: 'Products: 2'
            })
        })

        QUnit.test('Should show correct title for single product', (assert) => {
            formatProductCountTitleTestCase.call(this, {
                assert: assert,
                iCount: 1,
                expected: 'Products: 1'
            })
        })

        QUnit.test('Should show correct title for no product', (assert) => {
            formatProductCountTitleTestCase.call(this, {
                assert: assert,
                iCount: 0,
                expected: 'Product: 0'
            })
        })
    })


    QUnit.module('Display selected filter formatted text, FORMATTER', () => {
        const getFormattedSummaryTextTestCase = (oOptions) => {
            const getFormattedSummaryText = Formatter.getFormattedSummaryText(oOptions.oFilterBar)

            oOptions.assert.strictEqual(getFormattedSummaryText, oOptions.expected, 'Displays selected filter text')
        }

        QUnit.test('Should display no filter active text', (assert) => {
            getFormattedSummaryTextTestCase.call(this, {
                assert: assert,
                oFilterBar: {
                    retrieveFiltersWithValues: () => []
                },
                expected: 'No filters active'
            })
        })

        QUnit.test('Should display selected singular filter text', (assert) => {
            getFormattedSummaryTextTestCase.call(this, {
                assert: assert,
                oFilterBar: {
                    retrieveFiltersWithValues: () => ['First']
                },
                expected: '1 filter active: First'
            })
        })

        QUnit.test('Should display selected filters text', (assert) => {
            getFormattedSummaryTextTestCase.call(this, {
                assert: assert,
                oFilterBar: {
                    retrieveFiltersWithValues: () => ['First', 'Second']
                },
                expected: '2 filters active: First, Second'
            })
        })
    })

    QUnit.module('Display EXPANDED selected filter formatted text, FORMATTER', () => {
        const getFormattedSummaryTextExpandedTestCase = (oOptions) => {
            const getFormattedSummaryTextExpanded = Formatter.getFormattedSummaryTextExpanded(oOptions.oFilterBar)

            oOptions.assert.strictEqual(getFormattedSummaryTextExpanded, oOptions.expected, 'Displays correct text of selected filters when expanded')
        }

        QUnit.test('Should display no active filters text when expanded', (assert) => {
            getFormattedSummaryTextExpandedTestCase.call(this, {
                assert: assert,
                oFilterBar: {
                    retrieveFiltersWithValues: () => [],
                    retrieveNonVisibleFiltersWithValues: () => []
                },
                expected: 'No filters active'
            })
        })
    })
});