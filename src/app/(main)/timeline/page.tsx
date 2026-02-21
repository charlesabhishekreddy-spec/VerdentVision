'use client';

import { useState, useActionState } from 'react';
import { Sprout, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTimeline } from '@/lib/actions';
import type { TimelineData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const initialState: { error?: string; timelineData?: TimelineData } = {};

export default function TimelinePage() {
  const [state, formAction] = useActionState(getTimeline, initialState);
  const [cropName, setCropName] = useState('Tomato');
  const { toast } = useToast();

  const handleGetTimeline = (formData: FormData) => {
    if (!cropName.trim()) {
      toast({ title: 'Crop name required', description: 'Please enter a crop name.', variant: 'destructive' });
      return;
    }
    formAction(formData);
  };
  
  const isLoading = (state as any).pending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Crop Timeline</h1>
        <p className="text-muted-foreground">Generate a growth timeline for your crops from seed to harvest.</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form action={handleGetTimeline}>
          <CardHeader>
            <CardTitle>Generate a Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="crop-name">Crop Name</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="crop-name"
                name="cropName"
                placeholder="e.g., Tomato, Cucumber, Basil"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !cropName.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sprout className="mr-2 h-4 w-4" />}
                Generate
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
      
      {state?.error && <p className="text-destructive text-center">{state.error}</p>}

      {state?.timelineData && (
        <Card>
          <CardHeader>
            <CardTitle>{state.timelineData.cropName} Growth Timeline</CardTitle>
            <CardDescription>Follow these stages for a successful {state.timelineData.cropName.toLowerCase()} harvest.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-border after:left-0">
              {state.timelineData.timeline.map((item, index) => (
                <div key={index} className="grid gap-1.5 relative py-4">
                  <div className="absolute left-0 -translate-x-1/2 size-3 bg-primary rounded-full ring-4 ring-background" />
                  <p className="text-sm text-primary font-semibold">{item.stage}</p>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!state?.timelineData && !isLoading && !state?.error && (
         <Card className="w-full py-20">
          <CardContent className="text-center text-muted-foreground space-y-4">
            <Sprout className="mx-auto size-12" />
            <h3 className="text-xl font-semibold">Ready to Grow?</h3>
            <p>Enter a crop name above to generate its growth timeline.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
