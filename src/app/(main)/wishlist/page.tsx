
'use client';

import { Star, Trash2, Leaf, Beaker } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { WishlistItem } from '@/lib/types';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useLocalStorage<WishlistItem[]>('wishlist', []);
  
  const handleDelete = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">My Wishlist</h1>
        <p className="text-muted-foreground">A collection of your saved treatments.</p>
      </div>

      {wishlist.length === 0 ? (
        <Card className="w-full py-20">
          <CardContent className="text-center text-muted-foreground space-y-4">
            <Star className="mx-auto size-12" />
            <h3 className="text-xl font-semibold">Your Wishlist is Empty</h3>
            <p>Save treatments from the diagnosis page to see them here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
             <Accordion type="multiple" className="w-full">
              {wishlist.map((item) => (
                <AccordionItem value={item.id} key={item.id} className="px-6">
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                      <span className="capitalize flex items-center gap-3">
                        {item.treatmentType === 'organic' 
                          ? <Leaf className="size-4 text-primary" /> 
                          : <Beaker className="size-4 text-accent-foreground" />}
                        {item.treatmentType}: {item.treatmentName}
                      </span>
                       <span className="text-xs text-muted-foreground font-normal">
                          Saved: {new Date(item.savedAt).toLocaleDateString()}
                       </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {item.diagnosis && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-sm">Saved for Diagnosis:</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.diagnosis.disease} ({item.diagnosis.infectionLevel}% infection)
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold">Proportions</h4>
                      <p className="text-muted-foreground">{item.proportions}</p>
                    </div>
                     <div>
                      <h4 className="font-semibold">Description</h4>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="mr-2 size-4" /> Remove from Wishlist
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
