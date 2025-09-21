


import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Crown } from 'lucide-react';
import { getProduct, getInvoice } from '@/lib/api';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

const priceRanges = [
    { label: 'All Prices', value: 'all', min: 0, max: Infinity },
    { label: '$0 - $50', value: '0-50', min: 0, max: 50 },
    { label: '$50 - $100', value: '50-100', min: 50, max: 100 },
    { label: '$100 - $200', value: '100-200', min: 100, max: 200 },
    { label: '$200+', value: '200-plus', min: 200, max: Infinity },
];

export default function BestSellerByPriceRange() {
    const [products, setProducts] = React.useState([]);
    const [invoices, setInvoices] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedRangeValue, setSelectedRangeValue] = React.useState(priceRanges[0].value);

    const bestSeller = React.useMemo(() => {
        if (isLoading || !products.length || !invoices.length) return undefined;

        const selectedRange = priceRanges.find(r => r.value === selectedRangeValue) || priceRanges[0];

        const salesByProduct = {};

        invoices
            .filter(invoice => invoice.status === 'Paid')
            .forEach(invoice => {
                invoice.items.forEach(item => {
                    const product = products.find(p => p.id === item.productId);
                    if (product && product.price >= selectedRange.min && product.price < selectedRange.max) {
                        salesByProduct[item.productId] = (salesByProduct[item.productId] || 0) + item.quantity;
                    }
                });
            });

        if (Object.keys(salesByProduct).length === 0) {
            return null; // Explicitly null for no data
        }

        const bestSellerId = Object.keys(salesByProduct).reduce((a, b) => salesByProduct[a] > salesByProduct[b] ? a : b, '');
        const product = products.find(p => p.id === bestSellerId);

        if (product) {
            return {
                product,
                unitsSold: salesByProduct[bestSellerId]
            };
        }

        return null;

    }, [isLoading, products, invoices, selectedRangeValue]);


    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const [productsData, invoicesData] = await Promise.all([getProduct(), getInvoice()]);
            setProducts(productsData);
            setInvoices(invoicesData);
            setIsLoading(false);
        }
        fetchData();
    }, []);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Best Seller by Price Range</CardTitle>
                <CardDescription>Find the top-selling product within a specific price range.</CardDescription>
                <div className="pt-2">
                    <Label htmlFor="price-range-select" className="text-xs text-muted-foreground">Select a Price Range</Label>
                    <Select onValueChange={setSelectedRangeValue} defaultValue={selectedRangeValue}>
                        <SelectTrigger id="price-range-select" className="w-full sm:w-[250px]">
                            <SelectValue placeholder="Select a range..." />
                        </SelectTrigger>
                        <SelectContent>
                            {priceRanges.map(range => (
                                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <Skeleton className="w-full sm:w-[200px] h-[150px] rounded-lg" />
                        <div className="space-y-2 flex-1 w-full">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-8 w-1/4 mt-2" />
                        </div>
                    </div>
                ) : bestSeller ? (
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <div className="relative">
                            <img
                                src={`https://picsum.photos/seed/${bestSeller.product.id}/400/300`}
                                alt={bestSeller.product.name}
                                width={200}
                                height={150}
                                className="rounded-lg object-cover"
                                data-ai-hint="eyewear product"
                            />
                            <Badge className="absolute top-2 left-2 bg-yellow-400 text-yellow-950">
                                <Crown className="w-4 h-4 mr-1.5" />
                                Top Seller
                            </Badge>
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                            <h3 className="text-xl font-bold">{bestSeller.product.name}</h3>
                            <p className="text-muted-foreground">{bestSeller.product.brand || 'Local Brand'}</p>
                            <div className="text-2xl font-semibold text-primary pt-2">
                                {bestSeller.unitsSold}
                                <span className="text-sm font-medium text-muted-foreground ml-1">units sold</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        No sales data available for this price range.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
