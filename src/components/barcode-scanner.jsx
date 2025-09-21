


import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle } from 'lucide-react';
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { getProducts } from '@/lib/api';



export default function BarcodeScanner({ onScan }) {
  const { toast } = useToast();
  const videoRef = React.useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState(null);
  const [products, setProducts] = React.useState([]);

  React.useEffect(() => {
    const setup = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
        }
    };
    setup();

    getProducts().then(setProducts);
    
    // Cleanup function to stop the video stream
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const simulateScan = () => {
    // In a real app, you would use a library like `react-zxing` or `scandit-sdk-react`
    // to process the video feed and detect barcodes.
    // For this demo, we'll just pick a random product.
    if (products.length === 0) {
        toast({ variant: 'destructive', title: "No products loaded" });
        return;
    }
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    onScan(randomProduct.id);
  };
  
  return (
    <div className="grid gap-4">
        <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>Position the barcode within the frame to scan it.</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video overflow-hidden rounded-md border bg-muted">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-1/2 border-4 border-red-500/50 rounded-lg" />
            </div>
        </div>

      {hasCameraPermission === false && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
                Please allow camera access in your browser settings to use the scanner.
            </AlertDescription>
        </Alert>
      )}

      <Button onClick={simulateScan} disabled={!hasCameraPermission}>
        Simulate Scan
      </Button>
    </div>
  );
}
