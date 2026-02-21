'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { askQuestion } from '@/lib/actions';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await askQuestion(input);
      if (result.answer) {
        const botMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'bot', text: result.answer };
        setMessages((prev) => [...prev, botMessage]);
      } else if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start h-full">
      <Card className="w-full max-w-3xl h-[75vh] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-primary" />
            <span>AI Plant Health Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  <p>Ask me anything about plant health, diseases, or treatments!</p>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'bot' && (
                    <Avatar className="size-8">
                      <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn('max-w-[75%] rounded-lg p-3 text-sm', message.role === 'user' ? 'bg-primary/20' : 'bg-secondary')}>
                    {message.text}
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="size-8">
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4 justify-start">
                   <Avatar className="size-8">
                     <AvatarFallback><Bot /></AvatarFallback>
                   </Avatar>
                  <div className="bg-secondary rounded-lg p-3 flex items-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Type your question..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
