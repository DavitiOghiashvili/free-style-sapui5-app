sap.ui.define([
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/core/library"
], (ResourceModel, coreLibrary) => {
    "use strict";
    const oResourceBundle = new ResourceModel({
        bundleName: "freestylesapui5app.i18n.i18n"
    }).getResourceBundle();

    const { ValueState } = coreLibrary.ValueState

    return {
        productStatusState(fValue) {

            if (fValue === 'OK') {
                return ValueState.Success;
            } else if (fValue === 'STORAGE') {
                return ValueState.Warning;
            } else if (fValue === 'OUT_OF_STOCK') {
                return ValueState.Error;
            } else {
                return ValueState.None;
            }
        },

        /**
         * Format the product count title
         * @param {number} iCount - The product count
         * @returns {string} Formatted title
         */
        formatProductCountTitle(iCount) {
            if (iCount === undefined || iCount === null) {
                return '0';
            }
            const sKey = iCount > 0 ? "product" : "products";
            return oResourceBundle.getText(sKey, [iCount]);
        },

        /**
         * Get summary text for snapped state.
         * @param {Object} oFilterBar - The filter bar control
         * @returns {string} Formatted summary text
         * @public
         */
        getFormattedSummaryText(oFilterBar) {
            let aFiltersWithValues = oFilterBar.retrieveFiltersWithValues();

            if (aFiltersWithValues.length === 0) {
                return `${oResourceBundle.getText("noFiltersActive")}`;
            }

            if (aFiltersWithValues.length === 1) {
                return aFiltersWithValues.length + ` ${oResourceBundle.getText("filterActive")} ` + aFiltersWithValues.join(", ");
            }

            return aFiltersWithValues.length + ` ${oResourceBundle.getText("filtersActive")} ` + aFiltersWithValues.join(", ");
        },

        /**
         * Get summary text for expanded state.
         * @param {Object} oFilterBar - The filter bar control
         * @returns {string} Formatted summary text
         * @public
         */
        getFormattedSummaryTextExpanded(oFilterBar) {
            let aFiltersWithValues = oFilterBar.retrieveFiltersWithValues();

            if (aFiltersWithValues.length === 0) {
                return `${oResourceBundle.getText("noFiltersActive")}`;
            }

            let sText = aFiltersWithValues.length + ` ${oResourceBundle.getText("filtersActive")} `,
                aNonVisibleFiltersWithValues = oFilterBar.retrieveNonVisibleFiltersWithValues();

            if (aFiltersWithValues.length === 1) {
                sText = aFiltersWithValues.length + ` ${oResourceBundle.getText("filterActive")} `;
            }

            if (aNonVisibleFiltersWithValues && aNonVisibleFiltersWithValues.length > 0) {
                sText += " (" + aNonVisibleFiltersWithValues.length + " hidden)";
            }

            return sText;
        }
    };
});