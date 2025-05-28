sap.ui.define([
    "sap/ui/model/resource/ResourceModel"
], (ResourceModel) => {
    "use strict";

    const oResourceBundle = new ResourceModel({
        bundleName: "freestylesapui5app.i18n.i18n"
    }).getResourceBundle();

    return {
        /**
         * Format product counts for display.
         * @param {number} countAll - Total product count
         * @param {number} ok - Count of products with OK status
         * @param {number} storage - Count of products in storage
         * @param {number} outOfStock - Count of out-of-stock products
         * @returns {string} Formatted product count string
         * @public
         */
        formatProductCounts(countAll, ok, storage, outOfStock) {
            const parts = [];

            if (ok > 0) parts.push(`${oResourceBundle.getText("OK")}: ${ok}`)
            if (storage > 0) parts.push(`${oResourceBundle.getText("Storage")}: ${storage}`);
            if (outOfStock > 0) parts.push(`${oResourceBundle.getText("outOfStock")}: ${outOfStock}`);

            if (parts.length === 0) {
                return `${oResourceBundle.getText("products")}: ${countAll}`;
            }

            return parts.join(", ");
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