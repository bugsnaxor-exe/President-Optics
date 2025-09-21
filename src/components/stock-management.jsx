


import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, PlusCircle, MinusCircle, PackageSearch } from 'lucide-react';

import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const stockAdjustmentSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  currentStock: z.coerce.number(),
  adjustment: z.coerce.number().int().optional().default(0),
});

const stockManagementSchema = z.object({
  items: z.array(stockAdjustmentSchema),
});



export default function StockManagement({ products: initialProducts }) {
    const { toast } = useToast();
    const [products, setProducts] = React.useState(initialProducts);
    const [searchTerm, setSearchTerm] = React.useState('');

    const form = useForm({
        resolver: zodResolver(stockManagementSchema),
        defaultValues: { items: [] },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    });

    const filteredProducts = React.useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const addProductToForm = (product) => {
        if (fields.some(field => field.productId === product.id)) {
            toast({
                variant: 'destructive',
                title: 'Product Already Added',
                description: `${product.name} is already in the list for stock adjustment.`
            });
            return;
        }
        append({
            productId: product.id,
            productName: product.name,
            currentStock: product.stock,
            adjustment: 0,
        });
    }

    const onSubmit = (data) => {
        const updates = data.items.filter(item => item.adjustment !== 0);

        if(updates.length === 0) {
            toast({ title: 'No changes to submit', description: 'Please enter an adjustment value for at least one product.'});
            return;
        }

        const newProductList = products.map(p => {
            const update = updates.find(u => u.productId === p.id);
            if (update && update.adjustment) {
                return { ...p, stock: p.stock + update.adjustment };
            }
            return p;
        });
        
        setProducts(newProductList);
        
        // This would typically be a backend API call.
        // For now, we just update the local state.
        
        toast({
            title: 'Stock Updated Successfully',
            description: `Updated stock for ${updates.length} products.`
        });
        
        form.reset({ items: [] });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Search Products</CardTitle>
                        <CardDescription>Find products to adjust their stock levels.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or product ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <ScrollArea className="h-64 mt-4 border rounded-md">
                             <Table>
                                <TableBody>
                                    {filteredProducts.length === 0 && (
                                        <TableRow>
                                            <TableCell className="text-center text-muted-foreground py-8">
                                                No products found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {filteredProducts.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-muted-foreground">{product.id}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button type="button" size="sm" onClick={() => addProductToForm(product)}>
                                                    Adjust Stock
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {fields.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Adjust Stock</CardTitle>
                            <CardDescription>
                                Enter positive values to add stock (Stock In) or negative values to remove stock (Stock Out).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">Current Stock</TableHead>
                                        <TableHead className="w-[150px] text-center">Adjustment</TableHead>
                                        <TableHead className="text-center">New Stock</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => {
                                        const adjustment = form.watch(`items.${index}.adjustment`) || 0;
                                        const newStock = field.currentStock + adjustment;
                                        return (
                                            <TableRow key={field.productId}>
                                                <TableCell>{field.productName}</TableCell>
                                                <TableCell className="text-center">{field.currentStock}</TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number" 
                                                        {...form.register(`items.${index}.adjustment`)}
                                                        className="text-center"
                                                        placeholder="0"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center font-bold">{newStock}</TableCell>
                                                <TableCell>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                        <MinusCircle className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                             <Button type="submit">
                                <PackageSearch className="mr-2 h-4 w-4" />
                                Submit Stock Adjustments
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </form>
        </Form>
    );
}
