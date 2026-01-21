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
import { Plus, Trash2, CreditCard } from "lucide-react";

export default function Fees() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    total_fees: "",
    fees_paid: "",
    semester: "1",
    academic_year: "2024-25",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fees, isLoading } = useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fees")
        .select("*, students(name, roll_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("fees").insert({
        student_id: data.student_id,
        total_fees: parseInt(data.total_fees),
        fees_paid: parseInt(data.fees_paid),
        semester: parseInt(data.semester),
        academic_year: data.academic_year,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["fees-count"] });
      setOpen(false);
      setFormData({
        student_id: "",
        total_fees: "",
        fees_paid: "",
        semester: "1",
        academic_year: "2024-25",
      });
      toast({ title: "Fees record added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error adding fees", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["fees-count"] });
      toast({ title: "Fees record deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting fees", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Fees</h1>
          <p className="page-description">Manage student fee records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Fees
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Fees Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.roll_number} - {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) => setFormData({ ...formData, semester: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Select
                    value={formData.academic_year}
                    onValueChange={(value) => setFormData({ ...formData, academic_year: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_fees">Total Fees (₹)</Label>
                  <Input
                    id="total_fees"
                    type="number"
                    min="0"
                    value={formData.total_fees}
                    onChange={(e) => setFormData({ ...formData, total_fees: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fees_paid">Fees Paid (₹)</Label>
                  <Input
                    id="fees_paid"
                    type="number"
                    min="0"
                    value={formData.fees_paid}
                    onChange={(e) => setFormData({ ...formData, fees_paid: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Fees Record"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Semester</th>
              <th>Year</th>
              <th>Total Fees</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : fees?.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  No fees records found. Add fees for students!
                </td>
              </tr>
            ) : (
              fees?.map((fee) => (
                <tr key={fee.id}>
                  <td className="font-medium">{fee.students?.roll_number}</td>
                  <td>{fee.students?.name}</td>
                  <td>Sem {fee.semester}</td>
                  <td>{fee.academic_year}</td>
                  <td>₹{fee.total_fees.toLocaleString()}</td>
                  <td className="text-success">₹{fee.fees_paid.toLocaleString()}</td>
                  <td className={fee.fees_due > 0 ? "text-destructive" : ""}>
                    ₹{fee.fees_due.toLocaleString()}
                  </td>
                  <td>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      fee.fees_due === 0 
                        ? "bg-success/10 text-success" 
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {fee.fees_due === 0 ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(fee.id)}
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
