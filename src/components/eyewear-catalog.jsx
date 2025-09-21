


import * as React from 'react';

import { useCurrency } from '@/context/currency-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { getProducts } from '@/lib/api';
import { Skeleton } from './ui/skeleton';
import { Loader2 } from 'lucide-react';

const ProductDetailCard = ({ product }) => {
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const priceId = `catalog_product_${product.id}`;
    const stockId = `catalog_stock_value_${product.id}`;
    const stockValue = product.price * product.stock;

    React.useEffect(() => {
        registerValue(priceId, product.price);
        registerValue(stockId, stockValue);
    }, [registerValue, priceId, stockId, product.price, stockValue]);

    const displayPrice = convertedValues[priceId] ?? product.price;
    const displayStockValue = convertedValues[stockId] ?? stockValue;

    return (
        <Card className="mt-6">
             <CardHeader>
                <img
                    src={`https://picsum.photos/seed/${product.id}/600/400`}
                    alt={product.name}
                    className="rounded-lg object-cover aspect-video w-full h-auto"
                    data-ai-hint="eyewear product"
                />
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold">{product.name}</h3>
                        <p className="text-muted-foreground">{product.description}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="grid gap-2 pt-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
                                <span className="font-semibold">Price</span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(displayPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
                                <span className="font-semibold">Type</span>
                                <Badge variant="outline">{product.type}</Badge>
                            </div>
                             <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
                                <span className="font-semibold">Stock Level</span>
                                <span className="font-bold">{product.stock} units</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
                                <span className="font-semibold">Total Stock Value</span>
                                <span className="font-bold">{formatCurrency(displayStockValue)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export function EyewearCatalog() {
    const [products, setProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedBrand, setSelectedBrand] = React.useState(null);
    const [selectedModelId, setSelectedModelId] = React.useState(null);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const prods = await getProducts();
            setProducts(prods);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const brands = React.useMemo(() => {
        const brandSet = new Set(products.map(p => p.brand).filter(Boolean));
        return ['Local', ...Array.from(brandSet)];
    }, [products]);

    const modelsForSelectedBrand = React.useMemo(() => {
        if (!selectedBrand) return [];
        if (selectedBrand === 'Local') {
            return products.filter(p => !p.brand && p.type === 'Eyewear');
        }
        return products.filter(p => p.brand === selectedBrand && p.type === 'Eyewear');
    }, [selectedBrand, products]);

    const selectedProduct = React.useMemo(() => {
        if (!selectedModelId) return null;
        return products.find(p => p.id === selectedModelId) || null;
    }, [selectedModelId, products]);

    const handleBrandChange = (brand) => {
        setSelectedBrand(brand);
        setSelectedModelId(null);
    }

    if (isLoading) {
        return (
            <div>
                <CardHeader className="px-0">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </div>
            </div>
        )
    }
    
    return (
        <div>
            <CardHeader className="px-0">
                <CardTitle>Browse Our Collection</CardTitle>
                <CardDescription>Select a brand and model to see the full details.</CardDescription>
            </CardHeader>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="brand-select">Brand</Label>
                    <Select onValueChange={handleBrandChange}>
                        <SelectTrigger id="brand-select">
                            <SelectValue placeholder="Select a brand..." />
                        </SelectTrigger>
                        <SelectContent>
                            {brands.map(brand => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="model-select">Model</Label>
                    <Select
                        onValueChange={setSelectedModelId}
                        disabled={!selectedBrand}
                        value={selectedModelId || ''}
                    >
                        <SelectTrigger id="model-select">
                            <SelectValue placeholder="Select a model..." />
                        </SelectTrigger>
                        <SelectContent>
                            {modelsForSelectedBrand.map(model => (
                                <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedProduct ? (
                <ProductDetailCard product={selectedProduct} />
            ) : (
                <div className="text-center text-muted-foreground py-20">
                    <p>Please select a brand and model to view details.</p>
                </div>
            )}
        </div>
    );
}
