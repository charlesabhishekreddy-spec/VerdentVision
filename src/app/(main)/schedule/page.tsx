'use client';

import { useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { ScheduleItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"


const scheduleSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  date: z.string().min(1, 'Date is required.'),
  notes: z.string().optional(),
});

export default function SchedulePage() {
  const [schedule, setSchedule] = useLocalStorage<ScheduleItem[]>('schedule', []);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { title: '', date: '', notes: '' },
  });

  const onSubmit = (values: z.infer<typeof scheduleSchema>) => {
    const newItem: ScheduleItem = {
      id: new Date().toISOString(),
      completed: false,
      ...values,
    };
    setSchedule([newItem, ...schedule].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    toast({ title: 'Task added', description: `"${values.title}" has been added to your schedule.` });
    form.reset();
    setIsDialogOpen(false);
  };

  const toggleComplete = (id: string) => {
    setSchedule(schedule.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };
  
  const handleDelete = (id: string) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Farming Schedule</h1>
          <p className="text-muted-foreground">Keep track of your farming activities.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Schedule a new farming activity.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Water tomatoes" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl><Textarea placeholder="Add any extra details..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Add Task</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {schedule.length === 0 ? (
        <Card className="w-full py-20">
          <CardContent className="text-center text-muted-foreground space-y-4">
            <Calendar className="mx-auto size-12" />
            <h3 className="text-xl font-semibold">Your Schedule is Empty</h3>
            <p>Add a task to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {schedule.map(item => (
                <li key={item.id} className="flex items-center p-4 gap-4 hover:bg-muted/50">
                  <Checkbox checked={item.completed} onCheckedChange={() => toggleComplete(item.id)} id={`task-${item.id}`} />
                  <div className="grid gap-1 flex-1">
                    <label htmlFor={`task-${item.id}`} className={`font-semibold ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.title}</label>
                    <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="size-4" />
                    <span className="sr-only">Delete task</span>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
