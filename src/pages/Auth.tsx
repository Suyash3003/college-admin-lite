import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2 } from "lucide-react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const { signIn, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if any admin exists
  const { data: hasAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["has-admin"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if (error) return true; // Assume admin exists if we can't check
      return (count ?? 0) > 0;
    },
  });

  useEffect(() => {
    if (!loading && user && role) {
      if (role === "admin") {
        navigate("/");
      } else {
        navigate("/student-dashboard");
      }
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    if (isSetupMode) {
      // Create admin account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (signUpError) {
        toast({
          title: "Setup Failed",
          description: signUpError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // Add admin role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: "admin" });
        
        if (roleError) {
          toast({
            title: "Setup Failed",
            description: roleError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        toast({ title: "Admin account created! Please sign in." });
        setIsSetupMode(false);
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || checkingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const showSetupOption = !hasAdmin && !isSetupMode;
  const isSetup = isSetupMode || !hasAdmin;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">TIET Student Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSetup ? "Create Admin Account" : "Sign in to access the system"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {showSetupOption && (
            <div className="mb-4 rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm text-foreground">No admin account exists yet.</p>
              <Button 
                variant="link" 
                className="text-primary" 
                onClick={() => setIsSetupMode(true)}
              >
                Create Admin Account
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSetup ? "Creating..." : "Signing in..."}
                </>
              ) : (
                isSetup ? "Create Admin Account" : "Sign In"
              )}
            </Button>
          </form>
          
          {isSetupMode && (
            <Button 
              variant="ghost" 
              className="mt-4 w-full" 
              onClick={() => setIsSetupMode(false)}
            >
              Back to Sign In
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Thapar Institute of Engineering & Technology
        </p>
      </div>
    </div>
  );
}
