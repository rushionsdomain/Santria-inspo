import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Stethoscope } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-border z-50 flex items-center px-4 gap-4 shadow-card">
          <SidebarTrigger className="ml-2" />
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-medical rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Santria</h1>
              <p className="text-sm text-muted-foreground">Patient Management System</p>
            </div>
          </div>
        </header>

        <div className="flex w-full">
          <div className="pt-16">
            <AppSidebar />
          </div>
          <main className="flex-1 p-6 pt-24">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}