sap.ui.define([], () => {
  'use strict';

  return {
    MAX_PRICE_QUERY_LENGTH: 4,

    PRODUCT_STATUS: {
      OK: 'OK',
      STORAGE: 'STORAGE',
      OUT_OF_STOCK: 'OUT_OF_STOCK',
    },

    PRICE_CURRENCIES: {
      USD: 'USD',
      EUR: 'EUR',
    },

    RATING_LENGTH: {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
    },

    SEARCH_FILTERS: {
      byText: [
        'Name',
        'Specs',
        'SupplierInfo',
        'MadeIn',
        'ProductionCompanyName',
      ],
    },

    FRAGMENTS: {
      DISPLAY_PRODUCT: 'DisplayProduct',
      EDIT_PRODUCT: 'EditProduct',
    },
  };
});
