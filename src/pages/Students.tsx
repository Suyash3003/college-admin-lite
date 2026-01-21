import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, UserPlus } from "lucide-react";

export default function Students() {
  const [open, setOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; email: string; name: string } | null>(null);
  const [credentialsForm, setCredentialsForm] = useState({ password: "" });
  const [formData, setFormData] = useState({
    roll_number: "",
    name: "",
    email: "",
    phone: "",
    year: "1",
    department_id: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, departments(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("students").insert({
        roll_number: data.roll_number,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        year: parseInt(data.year),
        department_id: data.department_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-count"] });
      setOpen(false);
      setFormData({
        roll_number: "",
        name: "",
        email: "",
        phone: "",
        year: "1",
        department_id: "",
      });
      toast({ title: "Student added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error adding student", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-count"] });
      toast({ title: "Student deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting student", description: error.message, variant: "destructive" });
    },
  });

  const createCredentialsMutation = useMutation({
    mutationFn: async ({ studentId, email, password }: { studentId: string; email: string; password: string }) => {
      // Create auth user with admin privileges
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Link student to auth user
      const { error: updateError } = await supabase
        .from("students")
        .update({ user_id: authData.user.id })
        .eq("id", studentId);
      
      if (updateError) throw updateError;

      // Add student role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: authData.user.id, role: "student" });
      
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setCredentialsOpen(false);
      setCredentialsForm({ password: "" });
      setSelectedStudent(null);
      toast({ title: "Login credentials created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating credentials", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const handleCreateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    createCredentialsMutation.mutate({
      studentId: selectedStudent.id,
      email: selectedStudent.email,
      password: credentialsForm.password,
    });
  };

  const openCredentialsDialog = (student: { id: string; email: string; name: string; user_id: string | null }) => {
    if (student.user_id) {
      toast({ title: "Credentials already exist", description: "This student already has login credentials." });
      return;
    }
    setSelectedStudent({ id: student.id, email: student.email, name: student.name });
    setCredentialsOpen(true);
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-description">Manage student records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roll_number">Roll Number</Label>
                  <Input
                    id="roll_number"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => setFormData({ ...formData, year: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Student"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Credentials Dialog */}
      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Login Credentials</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <p className="text-sm text-muted-foreground">{selectedStudent?.name}</p>
            </div>
            <div className="space-y-2">
              <Label>Email (Login)</Label>
              <p className="text-sm font-medium">{selectedStudent?.email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={credentialsForm.password}
                onChange={(e) => setCredentialsForm({ password: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={createCredentialsMutation.isPending}>
              {createCredentialsMutation.isPending ? "Creating..." : "Create Credentials"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border bg-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Year</th>
              <th>Department</th>
              <th>Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : students?.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  No students found. Add your first student!
                </td>
              </tr>
            ) : (
              students?.map((student) => (
                <tr key={student.id}>
                  <td className="font-medium">{student.roll_number}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.phone || "-"}</td>
                  <td>{student.year}</td>
                  <td>{student.departments?.name || "-"}</td>
                  <td>
                    {student.user_id ? (
                      <span className="inline-flex rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                        Active
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCredentialsDialog(student)}
                      >
                        <UserPlus className="mr-1 h-3 w-3" />
                        Create
                      </Button>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(student.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
