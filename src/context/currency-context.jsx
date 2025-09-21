
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
  const [currency, setCurrencyState] = React.useState('INR');
  const [conversionRate, setConversionRate] = React.useState(1);
  const [originalValues, setOriginalValues] = React.useState({});
  const [convertedValues, setConvertedValues] = React.useState({});
  const [dynamicValues, setDynamicValues] = React.useState({});
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    try {
        const storedCurrency = localStorage.getItem('app-currency');
        if (storedCurrency && currencies.some(c => c.code === storedCurrency)) {
            setCurrencyState(storedCurrency);
        }
    } catch (error) {
        console.warn('Could not read currency from localStorage', error);
    }
  }, []);

  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
     try {
        localStorage.setItem('app-currency', newCurrency);
    } catch (error) {
        console.warn('Could not save currency to localStorage', error);
    }
  };

  React.useEffect(() => {
    if (!isMounted) return;
    const rate = getExchangeRate('USD', currency);
    setConversionRate(rate);
  }, [isMounted, currency]);

  React.useEffect(() => {
    if(!isMounted || conversionRate === 1 && currency === 'USD') return;

    const rate = conversionRate;
    const newConvertedValues = {};
    const baseCurrency = 'USD';

    for (const key in originalValues) {
        newConvertedValues[key] = originalValues[key] * rate;
    }
     for (const key in dynamicValues) {
        // Dynamic values are assumed to be entered in the current currency
        // We need to convert them to the base currency (USD) first for consistent storage,
        // then convert to the new target currency.
        const valueInBase = dynamicValues[key] / getExchangeRate(baseCurrency, currency); // This might need adjustment based on how dynamic values are handled
        newConvertedValues[key] = valueInBase * rate;
    }
    
    setConvertedValues(newConvertedValues);
  }, [currency, conversionRate, originalValues, isMounted, dynamicValues]);
  
  const formatCurrency = (value, showPlus = false) => {
    if (value === undefined || isNaN(value)) {
      value = 0;
    }

    const displayCurrency = isMounted ? currency : 'INR';
    
    const locale = currencies.find(c => c.code === displayCurrency)?.locale || 'en-US';

    const options = {
      style: 'currency',
      currency: displayCurrency,
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
    setCurrency,
    formatCurrency,
    convertedValues,
    registerValue,
    conversionRate,
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
