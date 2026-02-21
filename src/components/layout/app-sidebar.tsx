
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Calendar,
  HeartPulse,
  History,
  Sprout,
  Star,
  PanelLeft,
  Share2,
  Copy,
} from 'lucide-react';
import {
  SidebarHeader,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ShareQrCode } from '@/components/share-qr-code';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const menuItems = [
  { href: '/', label: 'Diagnose', icon: HeartPulse },
  { href: '/history', label: 'History', icon: History },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/wishlist', label: 'Wishlist', icon: Star },
  { href: '/timeline', label: 'Crop Timeline', icon: Sprout },
  { href: '/chat', label: 'AI Chat', icon: Bot },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.origin);
      if (navigator.share) {
        setIsShareSupported(true);
      }
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Verdant Vision',
          text: 'Check out Verdant Vision, your AI-powered plant care assistant!',
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
          title: 'Sharing Failed',
          description: 'Could not share the app at this moment.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
       toast({ title: 'Link Copied!', description: 'The app link has been copied to your clipboard.' });
    }, (err) => {
       console.error('Could not copy text: ', err);
       toast({ title: 'Copy Failed', description: 'Could not copy the link.', variant: 'destructive'});
    });
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/">
              <Logo className="size-6 text-primary" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <h2 className="font-headline text-lg font-semibold tracking-tight">Verdant Vision</h2>
          </div>
          <div className="grow" />
          <SidebarTrigger className="sm:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 flex flex-col gap-2">
         <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2" /> Share App
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Verdant Vision</DialogTitle>
                  <DialogDescription>
                      Share a link to this app or scan the QR code to open it on another device.
                  </DialogDescription>
                </DialogHeader>
                <ShareQrCode />
                <div className="flex flex-col gap-2 sm:flex-row">
                  {isShareSupported && (
                     <Button onClick={handleShare} className="flex-1">
                      <Share2 className="mr-2" /> Share Link
                    </Button>
                  )}
                  <Button onClick={handleCopy} variant="secondary" className="flex-1">
                    <Copy className="mr-2" /> Copy Link
                  </Button>
                </div>
            </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Verdant Vision
          <Button variant="ghost" size="icon" className="size-7 hidden md:inline-flex" onClick={toggleSidebar}>
            <PanelLeft className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
