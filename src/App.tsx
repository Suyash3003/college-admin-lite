import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Departments from "./pages/Departments";
import Courses from "./pages/Courses";
import Marks from "./pages/Marks";
import Fees from "./pages/Fees";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { role, loading } = useAuth();
  
  if (loading) return null;
  
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={role === "student" ? "/student-dashboard" : "/"} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to={role === "student" ? "/student-dashboard" : "/"} replace />} />
      
      {/* Admin Routes */}
      <Route path="/" element={
        <MainLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        </MainLayout>
      } />
      <Route path="/students" element={
        <MainLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Students />
          </ProtectedRoute>
        </MainLayout>
      } />
      <Route path="/departments" element={
        <MainLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Departments />
          </ProtectedRoute>
        </MainLayout>
      } />
      <Route path="/courses" element={
        <MainLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Courses />
          </ProtectedRoute>
        </MainLayout>
      } />
      <Route path="/marks" element={
        <MainLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Marks />
          </ProtectedRoute>
        </MainLayout>
      } />
      <Route path="/fees" element={
        <MainLayout>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Fees />
          </ProtectedRoute>
        </MainLayout>
      } />

      {/* Student Route */}
      <Route path="/student-dashboard" element={
        <MainLayout>
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        </MainLayout>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
