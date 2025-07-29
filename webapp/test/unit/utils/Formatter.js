sap.ui.define([
    'freestylesapui5app/utils/Formatter',
    'freestylesapui5app/utils/Constants',
    'sap/ui/core/library',
], function (
    Formatter,
    Constants,
    coreLibrary
) {
    "use strict";

    const { ValueState } = coreLibrary;

    QUnit.module("Formatter Utilities", () => {

        const statusStateTestCase = (oOptions) => {
            const sState = Formatter.productStatusState(oOptions.statusValue);
            oOptions.assert.strictEqual(sState, oOptions.expected, 'The status was assigned correctly');
        };

        QUnit.test('Should format OK status as Success color', (assert) => {
            statusStateTestCase({
                assert: assert,
                statusValue: Constants.PRODUCT_STATUS.OK,
                expected: ValueState.Success
            });
        });

        QUnit.test('Should format STORAGE status as Warning color', (assert) => {
            statusStateTestCase({
                assert: assert,
                statusValue: Constants.PRODUCT_STATUS.STORAGE,
                expected: ValueState.Warning
            });
        });

        QUnit.test('Should format OUT_OF_STOCK status as Error color', (assert) => {
            statusStateTestCase({
                assert: assert,
                statusValue: Constants.PRODUCT_STATUS.OUT_OF_STOCK,
                expected: ValueState.Error
            });
        });

        QUnit.test('Should format unknown status as None color', (assert) => {
            statusStateTestCase({
                assert: assert,
                statusValue: '',
                expected: ValueState.None
            });
        });

        const formatDateTestCase = (oOptions) => {
            const formattedDate = Formatter.formatDate(oOptions.dateValue);
            oOptions.assert.strictEqual(formattedDate, oOptions.expected, 'Product date has been formatted accordingly');
        };

        QUnit.test('Should format product date correctly', (assert) => {
            formatDateTestCase({
                assert: assert,
                dateValue: new Date(1753430309333),
                expected: '2025-07-25'
            });
        });

        QUnit.test('Should handle empty product date', (assert) => {
            formatDateTestCase({
                assert: assert,
                dateValue: '',
                expected: ''
            });
        });

        const productStatusTextTestCase = (oOptions) => {
            const productStatusText = Formatter.productStatusText(oOptions.sStatusValue);
            oOptions.assert.strictEqual(productStatusText, oOptions.expected, 'Product status text displayed correctly');
        };

        QUnit.test('Should return proper i18n text for OUT_OF_STOCK', (assert) => {
            productStatusTextTestCase({
                assert: assert,
                sStatusValue: 'OUT_OF_STOCK',
                expected: 'Out of stock'
            });
        });

        const formatProductCountTitleTestCase = (oOptions) => {
            const title = Formatter.formatProductCountTitle(oOptions.iCount);
            oOptions.assert.strictEqual(title, oOptions.expected, 'Displayed correct title');
        };

        QUnit.test('Should show title for multiple products', (assert) => {
            formatProductCountTitleTestCase({
                assert: assert,
                iCount: 2,
                expected: 'Products: 2'
            });
        });

        QUnit.test('Should show title for one product', (assert) => {
            formatProductCountTitleTestCase({
                assert: assert,
                iCount: 1,
                expected: 'Products: 1'
            });
        });

        QUnit.test('Should show title for no products', (assert) => {
            formatProductCountTitleTestCase({
                assert: assert,
                iCount: 0,
                expected: 'Product: 0'
            });
        });

        const getFormattedSummaryTextTestCase = (oOptions) => {
            const result = Formatter.getFormattedSummaryText(oOptions.oFilterBar);
            oOptions.assert.strictEqual(result, oOptions.expected, 'Displays selected filter text');
        };

        QUnit.test('Should display "no filters active" text', (assert) => {
            getFormattedSummaryTextTestCase({
                assert: assert,
                oFilterBar: {
                    retrieveFiltersWithValues: () => []
                },
                expected: 'No filters active'
            });
        });

        QUnit.test('Should display one filter active', (assert) => {
            getFormattedSummaryTextTestCase({
                assert: assert,
                oFilterBar: {
                    retrieveFiltersWithValues: () => ['First']
                },
                expected: '1 filter active: First'
            });
        });

        QUnit.test('Should display multiple filters active', (assert) => {
            getFormattedSummaryTextTestCase({
                assert: assert,
                oFilterBar: {
                    retrieveFiltersWithValues: () => ['First', 'Second']
                },
                expected: '2 filters active: First, Second'
            });
        });

        const getFormattedSummaryTextExpandedTestCase = (oOptions) => {
            const result = Formatter.getFormattedSummaryTextExpanded(oOptions.oFilterBar);
            oOptions.assert.strictEqual(result, oOptions.expected, 'Displays correct text of selected filters when expanded');
        };

        QUnit.test('Should display no active filters when expanded', (assert) => {
            getFormattedSummaryTextExpandedTestCase({
                assert: assert,
                oFilterBar: {
                    retrieveFiltersWithValues: () => [],
                    retrieveNonVisibleFiltersWithValues: () => []
                },
                expected: 'No filters active'
            });
        });

    });
});
