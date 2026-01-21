import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogOut, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, loading, role, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Student users don't see the sidebar - they have a simpler layout
  if (role === "student") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">TIET</span>
              <span className="text-lg font-medium">Student Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 p-6">{children}</main>
    </div>
  );
}
