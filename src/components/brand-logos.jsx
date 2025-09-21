


import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

import { useCurrency } from '@/context/currency-context';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { getProducts } from '@/lib/api';
import { Skeleton } from './ui/skeleton';

const ProductListItem = ({ product }) => {
    const { formatCurrency, registerValue, convertedValues } = useCurrency();
    const priceId = `brand_product_${product.id}`;

    React.useEffect(() => {
        registerValue(priceId, product.price);
    }, [registerValue, priceId, product.price]);

    const displayPrice = convertedValues[priceId] ?? product.price;

    return (
        <div className="flex items-center gap-4 py-2">
            <img
                src={`https://picsum.photos/seed/${product.id}/100/100`}
                alt={product.name}
                className="rounded-md object-cover w-[60px] h-[60px]"
                data-ai-hint="eyewear product"
            />
            <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
            <div className="text-lg font-bold">{formatCurrency(displayPrice)}</div>
        </div>
    )
}


export default function BrandLogos() {
    const [products, setProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

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
        return Array.from(brandSet);
    }, [products]);
    
    const [selectedBrand, setSelectedBrand] = React.useState(null);

    const productsForSelectedBrand = React.useMemo(() => {
        if (!selectedBrand) return [];
        return products.filter(p => p.brand === selectedBrand);
    }, [selectedBrand, products]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Collaborating Brands</CardTitle>
                <CardDescription>Click on a brand to see their products.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                ) : (
                    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedBrand(null)}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {brands.map(brand => (
                                <DialogTrigger asChild key={brand}>
                                    <button 
                                        onClick={() => setSelectedBrand(brand)} 
                                        className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg bg-muted/30 transition-colors hover:bg-accent"
                                    >
                                        <img
                                            src={`https://picsum.photos/seed/${brand}/150/80`}
                                            alt={`${brand} logo`}
                                            className="object-contain w-[120px] h-[60px]"
                                            data-ai-hint="brand logo"
                                        />
                                        <p className="text-sm font-semibold">{brand}</p>
                                    </button>
                                </DialogTrigger>
                            ))}
                        </div>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Products by {selectedBrand}</DialogTitle>
                                <DialogDescription>
                                    A list of all available products from {selectedBrand}.
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh]">
                                <div className="pr-4">
                                    {productsForSelectedBrand.map(product => (
                                        <ProductListItem key={product.id} product={product} />
                                    ))}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    );
}

    
