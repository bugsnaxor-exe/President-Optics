


import * as React from 'react';
import { useCurrency } from '@/context/currency-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { currencies } from '@/lib/data';
import { Skeleton } from './ui/skeleton';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
      setIsMounted(true);
  }, []);

  if (!isMounted) {
      return (
        <div className="flex items-center space-x-2 h-10 w-[120px]">
            <Skeleton className="h-full w-full" />
        </div>
      );
  }

  return (
    <div className="w-[120px]">
       <Select onValueChange={(value) => setCurrency(value)} defaultValue={currency}>
            <SelectTrigger aria-label="Select currency">
                <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
                {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                       {c.code} - {c.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
  );
}
