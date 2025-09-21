
import * as React from 'react';
import { MOCK_RATES, currencies } from '@/lib/data';

function getExchangeRate(from, to) {
    const fromRate = MOCK_RATES[from];
    const toRate = MOCK_RATES[to];

    if (fromRate && toRate) {
        // Convert 'from' currency to USD, then USD to 'to' currency
        return (1 / fromRate) * toRate;
    }
    
    // Fallback for direct conversion if available (legacy support)
    if (from === 'USD' && MOCK_RATES[to]) {
      return MOCK_RATES[to];
    }
    if (to === 'USD' && MOCK_RATES[from]) {
       return 1 / MOCK_RATES[from];
    }

    // Default to 1 if no rate is found to avoid breaking calculations
    console.warn(`Unable to find exchange rate from ${from} to ${to}`);
    return 1;
}

const CurrencyContext = React.createContext(undefined);

export function CurrencyProvider({ children }) {
   const currency = 'INR'; // Fixed to INR only
   const conversionRate = 1; // No conversion
   const [originalValues, setOriginalValues] = React.useState({});
   const [convertedValues, setConvertedValues] = React.useState({});
   const [dynamicValues, setDynamicValues] = React.useState({});
   const [isMounted, setIsMounted] = React.useState(false);

   React.useEffect(() => {
     setIsMounted(true);
   }, []);

   React.useEffect(() => {
     if(!isMounted) return;

     // Since no conversion, convertedValues = originalValues
     const newConvertedValues = { ...originalValues, ...dynamicValues };
     setConvertedValues(newConvertedValues);
   }, [originalValues, isMounted, dynamicValues]);
  
  const formatCurrency = (value, showPlus = false) => {
     if (value === undefined || isNaN(value)) {
       value = 0;
     }

     const locale = 'en-IN'; // Always INR

     const options = {
       style: 'currency',
       currency: 'INR',
       minimumFractionDigits: 2,
       maximumFractionDigits: 2,
     };
     const formattedValue = new Intl.NumberFormat(locale, options).format(value);

     if (showPlus && value > 0) {
       return `+${formattedValue}`;
     }
     return formattedValue;
   };

  const registerValue = React.useCallback((id, value, isDynamic = false) => {
      if(isDynamic) {
        setDynamicValues(prev => ({...prev, [id]: value}));
      } else {
        setOriginalValues(prev => {
          if (prev[id] === value) return prev;
          return { ...prev, [id]: value };
        });
      }
  }, []);
  
  const value = {
     currency,
     formatCurrency,
     convertedValues,
     registerValue,
   };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = React.useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
