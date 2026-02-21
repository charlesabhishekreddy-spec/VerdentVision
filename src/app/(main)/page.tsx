
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import Image from 'next/image';
import { Camera, Upload, Dna, Leaf, Loader2, Info, X, Beaker, Zap, Video, VideoOff, SwitchCamera } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { diagnosePlant, getTreatments } from '@/lib/actions';
import type { Diagnosis, Treatment, DiagnosisHistoryItem, WishlistItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: { error?: string; diagnosis?: Diagnosis } = {};

export default function DiagnosePage() {
  const [state, formAction] = useActionState(diagnosePlant, initialState);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isFetchingTreatments, setIsFetchingTreatments] = useState(false);
  const [treatments, setTreatments] = useState<Treatment[] | null>(null);
  const [plantName, setPlantName] = useState('');
  const [history, setHistory] = useLocalStorage<DiagnosisHistoryItem[]>('diagnosis-history', []);
  const [wishlist, setWishlist] = useLocalStorage<WishlistItem[]>('wishlist', []);
  
  const [cameraMode, setCameraMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (cameraMode) {
      const getCameraPermission = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
          });
          setHasCameraPermission(false);
          return;
        }
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
    } else {
      // Stop camera stream when exiting camera mode
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraMode]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewUrl(dataUrl);
      
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
          setFile(capturedFile);
        });

      setCameraMode(false);
    }
  };

  const handleDiagnose = async (formData: FormData) => {
    if ((!file && !previewUrl) || isDiagnosing) {
      toast({ title: 'No image selected', description: 'Please select an image to diagnose.', variant: 'destructive' });
      return;
    }
    setIsDiagnosing(true);
    if(previewUrl) formData.set('photoDataUri', previewUrl);
    formData.set('plantName', plantName);
    
    formAction(formData);
  };
  
  useEffect(() => {
    if(state.error) {
      toast({ title: 'Diagnosis Failed', description: state.error, variant: 'destructive' });
      setIsDiagnosing(false);
    }
    if(state.diagnosis && previewUrl) {
       if (state.diagnosis.disease) {
        const newHistoryItem: DiagnosisHistoryItem = {
          id: new Date().toISOString(),
          date: new Date().toISOString(),
          imageUrl: previewUrl,
          plantName: state.diagnosis.plantName || "Unknown Plant",
          ...state.diagnosis,
        };
        setHistory([newHistoryItem, ...history]);
      }
      setIsDiagnosing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);


  const handleGetTreatments = async () => {
    if (!state.diagnosis) return;
    setIsFetchingTreatments(true);
    const result = await getTreatments(state.diagnosis, state.diagnosis.plantName || '');
    if (result.treatments) {
      setTreatments(result.treatments);
    } else if (result.error) {
      toast({ title: 'Failed to get treatments', description: result.error, variant: 'destructive' });
    }
    setIsFetchingTreatments(false);
  };

  const handleSaveToWishlist = (treatment: Treatment) => {
    const newWishlistItem: WishlistItem = {
      id: `${treatment.treatmentName}-${new Date().getTime()}`,
      savedAt: new Date().toISOString(),
      ...treatment,
      diagnosis: state.diagnosis ?? undefined
    };
    setWishlist([newWishlistItem, ...wishlist]);
    toast({ title: 'Saved to Wishlist', description: `${treatment.treatmentName} has been added to your wishlist.` });
  };

  const resetState = () => {
    state.diagnosis = undefined;
    state.error = undefined;
    setFile(null);
    setPreviewUrl(null);
    setTreatments(null);
    setPlantName('');
    setIsDiagnosing(false);
    setCameraMode(false);
    setHasCameraPermission(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  if (state.diagnosis) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Diagnosis Result
              <Button variant="ghost" size="sm" onClick={resetState}><X className="mr-2 h-4 w-4" /> Start Over</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            {previewUrl && <Image src={previewUrl} alt="Plant preview" width={600} height={400} className="rounded-lg object-cover w-full aspect-video" />}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Leaf className="text-primary"/> Plant</h3>
              <p className="text-muted-foreground">{state.diagnosis.plantName || 'Your Plant'}</p>
            </div>
             <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Dna className="text-primary"/> Disease</h3>
              <p className="text-2xl font-bold font-headline text-accent-foreground">{state.diagnosis.disease}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Info className="text-primary"/> Infection Level</h3>
              <div className="flex items-center gap-4">
                <Progress value={state.diagnosis.infectionLevel} className="w-full" />
                <span className="font-bold text-lg text-accent-foreground">{state.diagnosis.infectionLevel}%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGetTreatments} disabled={isFetchingTreatments} className="w-full">
              {isFetchingTreatments ? <Loader2 className="animate-spin mr-2" /> : <Beaker className="mr-2" />}
              {treatments ? 'Refetch Treatments' : 'Get Treatment Suggestions'}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          {treatments && (
            <Card>
              <CardHeader>
                <CardTitle>Treatment Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {treatments.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {treatments.map((treatment, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3 capitalize">
                            {treatment.treatmentType === 'organic' 
                              ? <Leaf className="size-4 text-primary" /> 
                              : <Beaker className="size-4 text-accent-foreground" />}
                            <span>{treatment.treatmentType}: {treatment.treatmentName}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold">Proportions</h4>
                            <p className="text-muted-foreground">{treatment.proportions}</p>
                          </div>
                           <div>
                            <h4 className="font-semibold">Description</h4>
                            <p className="text-muted-foreground">{treatment.description}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleSaveToWishlist(treatment)}>Save to Wishlist</Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No specific treatments required. Keep monitoring your plant's health.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <Card className="w-full max-w-2xl">
        <form action={handleDiagnose}>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-headline">Diagnose Your Plant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {!cameraMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="plant-name">Plant Name (Optional)</Label>
                  <Input 
                    id="plant-name" 
                    name="plantName"
                    placeholder="e.g., Tomato, Rose, etc." 
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plant Image</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 h-64">
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <Image src={previewUrl} alt="Plant preview" fill className="object-contain rounded-md" />
                      </div>
                    ) : (
                      <>
                        <Leaf className="size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Upload or capture an image of the affected plant.</p>
                        <div className="flex gap-4">
                           <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Upload
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setCameraMode(true)}>
                            <Camera className="mr-2 h-4 w-4" /> Camera
                          </Button>
                          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        </div>
                      </>
                    )}
                  </div>
                  {previewUrl && (
                    <Button type="button" variant="link" size="sm" onClick={() => { setFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                      Remove image
                    </Button>
                  )}
                </div>
              </>
            )}

            {cameraMode && (
              <div className="space-y-4">
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                   {hasCameraPermission === false && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-background/80">
                        <VideoOff className="size-12 text-destructive mb-4" />
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>
                              Please allow camera access in your browser settings to use this feature.
                            </AlertDescription>
                        </Alert>
                     </div>
                   )}
                   {hasCameraPermission === null && <Loader2 className="absolute size-8 animate-spin" />}
                </div>
                <div className="flex justify-center gap-4">
                  <Button type="button" variant="outline" onClick={() => setCameraMode(false)}>
                    Cancel
                  </Button>
                   <Button type="button" onClick={handleCapture} disabled={!hasCameraPermission}>
                    <Camera className="mr-2 h-4 w-4" /> Capture
                  </Button>
                </div>
              </div>
            )}
            
          </CardContent>
          {!cameraMode && (
            <CardFooter>
              <Button type="submit" className="w-full" disabled={(!file && !previewUrl) || isDiagnosing}>
                {isDiagnosing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDiagnosing ? 'Analyzing...' : 'Analyze Plant'}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
