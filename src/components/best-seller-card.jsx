


import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Crown } from 'lucide-react';
import { getProducts, getInvoices } from '@/lib/api';
import { Skeleton } from './ui/skeleton';


export default function BestSellerCard({ year }) {
    const [bestSeller, setBestSeller] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchBestSeller() {
            setIsLoading(true);
            const [products, invoices] = await Promise.all([getProducts(), getInvoices()]);

            const salesByProduct = {};

            invoices
                .filter(invoice => new Date(invoice.issueDate).getFullYear() === year && invoice.status === 'Paid')
                .forEach(invoice => {
                    invoice.items.forEach(item => {
                        if (products.find(p => p.id === item.productId)?.type === 'Eyewear') {
                           salesByProduct[item.productId] = (salesByProduct[item.productId] || 0) + item.quantity;
                        }
                    });
                });
            
            if (Object.keys(salesByProduct).length === 0) {
                setBestSeller(null);
                setIsLoading(false);
                return;
            }

            const bestSellerId = Object.keys(salesByProduct).reduce((a, b) => salesByProduct[a] > salesByProduct[b] ? a : b, '');
            const product = products.find(p => p.id === bestSellerId);

            if (product) {
                setBestSeller({
                    product,
                    unitsSold: salesByProduct[bestSellerId]
                });
            } else {
                setBestSeller(null);
            }
            setIsLoading(false);
        }

        fetchBestSeller();
    }, [year]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <Skeleton className="w-[200px] h-[150px] rounded-lg" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-24 mt-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!bestSeller || !bestSeller.product) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Best Seller of {year}</CardTitle>
                    <CardDescription>The top-selling eyewear model of the year.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-8">
                    No sales data available for this year yet.
                </CardContent>
            </Card>
        );
    }
    
    const { product, unitsSold } = bestSeller;

    return (
        <Card className="relative overflow-hidden">
            <CardHeader>
                <CardTitle>Best Seller of {year}</CardTitle>
                <CardDescription>The top-selling eyewear model of the year.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="relative">
                         <img
                             src={`https://picsum.photos/seed/${product.id}/400/300`}
                             alt={product.name}
                             className="rounded-lg object-cover w-[200px] h-[150px]"
                             data-ai-hint="eyewear product"
                         />
                         <Badge className="absolute top-2 left-2 bg-yellow-400 text-yellow-950">
                            <Crown className="w-4 h-4 mr-1.5" />
                            Best Seller
                         </Badge>
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <p className="text-muted-foreground">{product.brand || 'Local Brand'}</p>
                        <div className="text-2xl font-semibold text-primary pt-2">
                            {unitsSold}
                            <span className="text-sm font-medium text-muted-foreground ml-1">units sold</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
