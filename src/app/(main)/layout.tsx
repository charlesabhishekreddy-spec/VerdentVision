import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[auto_1fr]">
        <Sidebar collapsible="icon" className="hidden md:block">
          <AppSidebar />
        </Sidebar>
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            {/* Header Content can go here */}
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
