
'use client';

import Image from 'next/image';
import { Dna, Calendar, Trash2, History } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { DiagnosisHistoryItem } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';

export default function HistoryPage() {
  const [history, setHistory] = useLocalStorage<DiagnosisHistoryItem[]>('diagnosis-history', []);
  
  const handleDelete = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };
  
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Diagnosis History</h1>
          <p className="text-muted-foreground">Review your past plant health analyses.</p>
        </div>
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your diagnosis history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="w-full py-20">
          <CardContent className="text-center text-muted-foreground space-y-4">
            <History className="mx-auto size-12" />
            <h3 className="text-xl font-semibold">No History Found</h3>
            <p>Your diagnosed plants will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden group">
              <div className="relative w-full aspect-video bg-muted">
                <Image 
                  src={item.imageUrl} 
                  alt={`A photo of ${item.plantName}`} 
                  fill 
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-xl">{item.plantName || 'Diagnosed Plant'}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                  <Calendar className="size-4" />
                  {new Date(item.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="space-y-2">
                   <p className="font-semibold text-sm text-muted-foreground flex items-center gap-2"><Dna className="size-4" /> Diagnosis</p>
                   <p className="font-semibold text-base">{item.disease}</p>
                </div>
                 <div className="space-y-2">
                   <p className="font-semibold text-sm text-muted-foreground">Infection Level</p>
                   <div className="flex items-center gap-2">
                     <Progress value={item.infectionLevel} className="w-full" />
                     <span className="font-bold text-sm text-accent-foreground">{item.infectionLevel}%</span>
                   </div>
                </div>
              </CardContent>
               <CardFooter>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Trash2 className="mr-2 size-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Diagnosis?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove this diagnosis from your history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
               </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
