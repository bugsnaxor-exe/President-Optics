

'use client'

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCurrency } from '@/context/currency-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getInvoices, getProducts, getPurchaseOrders, getShops } from '@/lib/api';
import { parseISO } from 'date-fns';

import { Skeleton } from './ui/skeleton';


function ReportTableRow({ item, index }) {
    const { registerValue, convertedValues, formatCurrency } = useCurrency();
    const valueId = `report_item_${item.productId}_${index}`;
    
    React.useEffect(() => {
        registerValue(valueId, item.totalValue);
    }, [registerValue, valueId, item.totalValue]);

    const displayValue = convertedValues[valueId] !== undefined ? convertedValues[valueId] : item.totalValue;

    return (
        <TableRow>
            <TableCell className="font-medium">{item.productName}</TableCell>
            <TableCell>{item.brand}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">{formatCurrency(displayValue ?? 0)}</TableCell>
        </TableRow>
    )
}

function ReportTable({ data }) {
    if (data.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-md mt-4">
                No data available for the selected brand.
            </div>
        )
    }

    return (
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((item, index) => (
                    <ReportTableRow key={`${item.productId}_${index}`} item={item} index={index} />
                ))}
            </TableBody>
        </Table>
    )
}


export default function AuditReport({ detailed = false, dateRange = null }) {
    const [selectedBrand, setSelectedBrand] = React.useState('all');
    const [selectedShopId, setSelectedShopId] = React.useState('all');
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const [invoices, setInvoices] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [purchaseOrders, setPurchaseOrders] = React.useState([]);
    const [shops, setShops] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const [inv, prod, po, sh] = await Promise.all([
                getInvoices(),
                getProducts(),
                getPurchaseOrders(),
                getShops(),
            ]);
            setInvoices(inv);
            setProducts(prod);
            setPurchaseOrders(po);
            setShops(sh);
            setIsLoading(false);
        }
        fetchData();
    }, []);
  
    const brands = React.useMemo(() => {
        const brandSet = new Set(products.map(p => p.brand).filter(Boolean));
        return ['all', ...Array.from(brandSet)];
    }, [products]);

    const filteredInvoices = React.useMemo(() => {
        let filtered = selectedShopId === 'all' ? invoices : invoices.filter(i => i.shopId === selectedShopId);
        if (dateRange) {
            filtered = filtered.filter(inv => {
                const invDate = parseISO(inv.issueDate);
                return invDate >= dateRange.start && invDate <= dateRange.end;
            });
        }
        return filtered;
    }, [selectedShopId, invoices, dateRange]);
    
    const salesData = React.useMemo(() => {
        const salesMap = new Map();
        
        filteredInvoices.forEach(invoice => {
            if(invoice.status === 'Paid') {
                invoice.items.forEach(item => {
                    const productDetails = products.find(p => p.id === item.productId);
                    if(!productDetails || productDetails.type === 'Service') return;

                    if(selectedBrand !== 'all' && productDetails.brand !== selectedBrand) return;

                    const existing = salesMap.get(item.productId);
                    if (existing) {
                        existing.quantity += item.quantity;
                        existing.totalValue += item.quantity * item.unitPrice;
                    } else {
                        salesMap.set(item.productId, {
                            productId: item.productId,
                            productName: item.productName,
                            brand: productDetails.brand || 'N/A',
                            quantity: item.quantity,
                            totalValue: item.quantity * item.unitPrice
                        });
                    }
                });
            }
        });
        return Array.from(salesMap.values()).sort((a,b) => b.totalValue - a.totalValue);
    }, [selectedBrand, filteredInvoices, products]);

    const brandSalesData = React.useMemo(() => {
        const brandSales = new Map();

        filteredInvoices.forEach(invoice => {
            if (invoice.status === 'Paid') {
                invoice.items.forEach(item => {
                    const productDetails = products.find(p => p.id === item.productId);
                    if (productDetails && productDetails.brand) {
                        const currentSales = brandSales.get(productDetails.brand) || 0;
                        brandSales.set(productDetails.brand, currentSales + (item.quantity * item.unitPrice));
                    }
                });
            }
        });

        return Array.from(brandSales.entries())
            .map(([brandName, totalSales]) => ({ brand: brandName, sales: totalSales }))
            .sort((a, b) => b.sales - a.sales);

    }, [filteredInvoices, products]);

    React.useEffect(() => {
        brandSalesData.forEach(brand => {
            const valueId = `brand_sales_${brand.brand.replace(/ /g,'_')}`;
            registerValue(valueId, brand.sales);
        });
    }, [brandSalesData, registerValue]);

    const chartConfig = React.useMemo(() => {
        const config = {};
        const colors = [
            "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))",
        ];
        brandSalesData.forEach((item, index) => {
            config[item.brand] = {
                label: item.brand,
                color: colors[index % colors.length],
            };
        });
        return {
            sales: {
                label: "Sales"
            },
            ...config
        };
    }, [brandSalesData]);


    const chartData = brandSalesData.map(item => ({
        brand: item.brand,
        sales: convertedValues[`brand_sales_${item.brand.replace(/ /g, '_')}`] ?? item.sales,
        fill: `var(--color-${item.brand})`
    }));


    const purchaseData = React.useMemo(() => {
        const purchaseMap = new Map();
        let filteredPurchaseOrders = selectedShopId === 'all' ? purchaseOrders : purchaseOrders.filter(p => p.shopId === selectedShopId);
        if (dateRange) {
            filteredPurchaseOrders = filteredPurchaseOrders.filter(po => {
                const poDate = parseISO(po.orderDate);
                return poDate >= dateRange.start && poDate <= dateRange.end;
            });
        }

        filteredPurchaseOrders.forEach(po => {
            po.items.forEach(item => {
                  if(selectedBrand !== 'all' && item.brand !== selectedBrand) return;

                  const existing = purchaseMap.get(item.productId);
                   if (existing) {
                       existing.quantity += item.quantity;
                       existing.totalValue += item.quantity * item.unitPrice;
                   } else {
                       purchaseMap.set(item.productId, {
                           productId: item.productId,
                           productName: item.productName,
                           brand: item.brand || 'N/A',
                           quantity: item.quantity,
                           totalValue: item.quantity * item.unitPrice
                       });
                   }
            })
        });
        return Array.from(purchaseMap.values()).sort((a, b) => b.totalValue - a.totalValue);
    }, [selectedBrand, selectedShopId, purchaseOrders, dateRange]);

    const stockData = React.useMemo(() => {
        let filteredProducts = products;
        if(selectedBrand !== 'all') {
            filteredProducts = products.filter(p => p.brand === selectedBrand);
        }
        if (dateRange) {
            filteredProducts = filteredProducts.filter(p => {
                if (!p.createdAt) return false;
                const createdDate = parseISO(p.createdAt);
                return createdDate >= dateRange.start && createdDate <= dateRange.end;
            });
        }
        return filteredProducts.filter(p => p.type !== 'Service');
    }, [selectedBrand, products, dateRange]);

    React.useEffect(() => {
        stockData.forEach(item => {
            registerValue(`stock_value_${item.id}`, item.stock * item.price);
        });
    }, [stockData, registerValue]);
    
    if (detailed) {
        if (isLoading) {
            return (
                <TabsContent value="sales">
                     <Skeleton className="h-96 w-full" />
                </TabsContent>
            )
        }
        return (
            <>
                <TabsContent value="sales">
                    <ReportTable data={salesData} />
                </TabsContent>
                <TabsContent value="purchases">
                    <ReportTable data={purchaseData} />
                </TabsContent>
                <TabsContent value="stock">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockData.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.brand}</TableCell>
                                    <TableCell className="text-right">{item.stock}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(convertedValues[`stock_value_${item.id}`] ?? (item.stock * item.price))}</TableCell>
                                    <TableCell>{item.createdAt}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
            </>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Brand Sales at a Glance</CardTitle>
                <CardDescription>A quick overview of sales performance by brand.</CardDescription>
                <div className="pt-2">
                    <Label htmlFor="shop-select-chart" className="text-xs text-muted-foreground">Filter by Shop</Label>
                     <Select onValueChange={setSelectedShopId} defaultValue={selectedShopId}>
                        <SelectTrigger id="shop-select-chart" className="w-full sm:w-[250px]">
                            <SelectValue placeholder="Select a shop..." />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">All Shops</SelectItem>
                            {shops.map(shop => (
                                <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <Skeleton className="min-h-[250px] w-full aspect-square rounded-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full aspect-square">
                            <PieChart>
                                <ChartTooltip 
                                    formatter={(value) => formatCurrency(Number(value))}
                                    cursor={false} 
                                    content={<ChartTooltipContent hideLabel />} 
                                />
                                <Pie
                                    data={chartData}
                                    dataKey="sales"
                                    nameKey="brand"
                                    innerRadius={50}
                                    strokeWidth={5}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                        <div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Brand</TableHead>
                                        <TableHead className="text-right">Total Sales</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {chartData.map(item => (
                                        <TableRow key={item.brand}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                                {item.brand}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(item.sales ?? 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
