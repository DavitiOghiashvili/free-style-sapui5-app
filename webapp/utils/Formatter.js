sap.ui.define(
  [
    'sap/ui/model/resource/ResourceModel',
    'sap/ui/core/library',
    'freestylesapui5app/utils/Constants',
  ],
  (ResourceModel, coreLibrary, Constants) => {
    'use strict';

    const oResourceBundle = new ResourceModel({
      bundleName: 'freestylesapui5app.i18n.i18n',
    }).getResourceBundle();

    const { ValueState } = coreLibrary;

    return {
      /**
       * Returns a UI5 value state based on product status.
       * @param {string} statusValue - The product status.
       * @returns {sap.ui.core.ValueState} The corresponding value state.
       */
      productStatusState(statusValue) {
        switch (statusValue) {
          case Constants.PRODUCT_STATUS.OK:
            return ValueState.Success;
          case Constants.PRODUCT_STATUS.STORAGE:
            return ValueState.Warning;
          case Constants.PRODUCT_STATUS.OUT_OF_STOCK:
            return ValueState.Error;
          default:
            return ValueState.None;
        }
      },

      /**
       * Returns a localized text corresponding to a product status key.
       * @param {string} sStatusValue - The product status key.
       * @returns {string} Localized status text.
       */
      productStatusText(sStatusValue) {
        return oResourceBundle.getText(sStatusValue);
      },

      /**
       * Formats the title showing the number of products.
       * @param {number} iCount - The number of products.
       * @returns {string} Localized product count title.
       */
      formatProductCountTitle(iCount) {
        if (iCount === undefined || iCount === null) {
          return '0';
        }
        const sKey = iCount > 0 ? 'products' : 'product';
        return oResourceBundle.getText(sKey, [iCount]);
      },

      /**
       * Returns a formatted summary of active filters in snapped state.
       * @param {object} oFilterBar - The filter bar control.
       * @returns {string} Localized summary of active filters.
       * @public
       */
      getFormattedSummaryText(oFilterBar) {
        const aFiltersWithValues = oFilterBar.retrieveFiltersWithValues();

        if (aFiltersWithValues.length === 0) {
          return oResourceBundle.getText('noFiltersActive');
        }

        const sKey =
          aFiltersWithValues.length === 1 ? 'filterActive' : 'filtersActive';

        return (
          `${aFiltersWithValues.length} ${oResourceBundle.getText(sKey)} ` +
          aFiltersWithValues.join(', ')
        );
      },

      /**
       * Returns a formatted summary of active and hidden filters in expanded state.
       * @param {object} oFilterBar - The filter bar control.
       * @returns {string} Localized summary of active and hidden filters.
       * @public
       */
      getFormattedSummaryTextExpanded(oFilterBar) {
        const aFiltersWithValues = oFilterBar.retrieveFiltersWithValues();
        const aNonVisibleFiltersWithValues =
          oFilterBar.retrieveNonVisibleFiltersWithValues();

        if (aFiltersWithValues.length === 0) {
          return oResourceBundle.getText('noFiltersActive');
        }

        const sKey =
          aFiltersWithValues.length === 1 ? 'filterActive' : 'filtersActive';

        let sText = `${aFiltersWithValues.length} ${oResourceBundle.getText(
          sKey,
        )} `;

        if (aNonVisibleFiltersWithValues?.length > 0) {
          sText += `(${aNonVisibleFiltersWithValues.length} hidden)`;
        }

        return sText;
      },

      /**
       * Formats a date object to ISO format (yyyy-mm-dd).
       * @param {Date | undefined} dateValue - The date object.
       * @returns {string} Formatted date string or empty string if undefined.
       * @public
       */
      formatDate(dateValue) {
        if (!dateValue) {
          return '';
        }
        return dateValue.toISOString().slice(0, 10);
      },
    };
  },
);
