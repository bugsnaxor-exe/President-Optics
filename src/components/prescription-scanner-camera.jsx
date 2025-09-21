


import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, Camera } from 'lucide-react';


export default function PrescriptionScannerCamera({ onCapture }) {
  const { toast } = useToast();
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState(null);

  React.useEffect(() => {
    const getCameraPermission = async () => {
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

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if(context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            const dataUri = canvas.toDataURL('image/jpeg');
            onCapture(dataUri);
        } else {
             toast({ variant: 'destructive', title: 'Capture Failed', description: 'Could not get canvas context.'});
        }
    }
  };
  
  return (
    <div className="grid gap-4">
        <div className="relative aspect-video overflow-hidden rounded-md border bg-muted">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
             <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full border-4 border-red-500/50 rounded-lg box-border" />
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

      <Button onClick={handleCapture} disabled={!hasCameraPermission}>
        <Camera className="mr-2 h-4 w-4" /> Capture Prescription
      </Button>
    </div>
  );
}
