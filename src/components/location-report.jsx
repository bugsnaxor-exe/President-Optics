


import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

import { Building, DollarSign, Users } from 'lucide-react';
import { useCurrency } from '@/context/currency-context';
import { Separator } from './ui/separator';
import { getShops, getPatients, getInvoices } from '@/lib/api';
import { Skeleton } from './ui/skeleton';

function ShopCard({ shop, clientCount, totalRevenue }) {
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const revenueId = `shop_revenue_${shop.id}`;

    React.useEffect(() => {
        registerValue(revenueId, totalRevenue);
    }, [registerValue, revenueId, totalRevenue]);

    const displayRevenue = convertedValues[revenueId] ?? totalRevenue;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                     <Building className="w-8 h-8 mt-1" />
                    <div>
                        <CardTitle className="text-xl">{shop.name}</CardTitle>
                        <CardDescription>{shop.address}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-2 rounded-md bg-muted/40">
                        <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{clientCount}</p>
                        <p className="text-xs text-muted-foreground">Total Clients</p>
                    </div>
                     <div className="p-2 rounded-md bg-muted/40">
                        <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{formatCurrency(displayRevenue)}</p>
                        <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


export default function LocationReport() {
    const [shops, setShops] = React.useState([]);
    const [patients, setPatients] = React.useState([]);
    const [invoices, setInvoices] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const [sh, pat, inv] = await Promise.all([
                getShops(),
                getPatients(),
                getInvoices()
            ]);
            setShops(sh);
            setPatients(pat.patients || pat);
            setInvoices(inv);
            setIsLoading(false);
        }
        fetchData();
    }, []);
    
    const locationData = React.useMemo(() => {
        // Group shops by state and city from the address string
        const groupedShops = {};

        shops.forEach(shop => {
            const addressParts = shop.address.split(', ');
            const state = addressParts[addressParts.length - 2] || 'Unknown';
            const city = addressParts[addressParts.length - 3] || 'Unknown';

            if (!groupedShops[state]) {
                groupedShops[state] = {};
            }
            if (!groupedShops[state][city]) {
                groupedShops[state][city] = [];
            }
            groupedShops[state][city].push(shop);
        });
        return groupedShops;

    }, [shops]);

    const getShopMetrics = (shopId) => {
        const clientCount = patients.filter(p => p.shopId === shopId).length;
        const totalRevenue = invoices
            .filter(i => i.shopId === shopId && i.status === 'Paid')
            .reduce((acc, inv) => acc + inv.total, 0);
        return { clientCount, totalRevenue };
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <CardHeader className="px-0">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <CardHeader className="px-0">
                <CardTitle>All Shops Overview</CardTitle>
                <CardDescription>A complete breakdown of all business locations, grouped by state and city.</CardDescription>
            </CardHeader>

            {Object.keys(locationData).sort().map(state => (
                <div key={state} className="space-y-6">
                    <div className="relative">
                        <Separator />
                        <h2 className="absolute left-1/2 -translate-x-1/2 -top-3.5 bg-card px-3 text-lg font-semibold text-muted-foreground">{state}</h2>
                    </div>

                    {Object.keys(locationData[state]).sort().map(city => (
                        <div key={city}>
                            <h3 className="text-xl font-medium mb-4">{city}</h3>
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {locationData[state][city].map(shop => {
                                    const { clientCount, totalRevenue } = getShopMetrics(shop.id);
                                    return <ShopCard key={shop.id} shop={shop} clientCount={clientCount} totalRevenue={totalRevenue} />;
                                })}
                            </div>
                        </div>
                    ))}
                </div>
             ))}

             {Object.keys(locationData).length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    No shop data available to display.
                </div>
            )}
        </div>
    )
}
