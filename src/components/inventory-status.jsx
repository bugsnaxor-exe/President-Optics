


import * as React from 'react';

import { useCurrency } from '@/context/currency-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';


export default function InventoryStatus({ products }) {
    const { formatCurrency, registerValue, convertedValues } = useCurrency();

    React.useEffect(() => {
        products.forEach(product => {
            registerValue(`prod_price_${product.id}`, product.price);
        });
    }, [products, registerValue]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Current stock levels for all products.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(product => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.type}</TableCell>
                                <TableCell className={`text-right font-bold ${product.stock < 20 && product.type !== 'Service' ? 'text-red-500' : ''}`}>
                                    {product.type === 'Service' ? 'N/A' : product.stock}
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(convertedValues[`prod_price_${product.id}`] ?? product.price)}</TableCell>
                                <TableCell>{product.createdAt}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
