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
import { Plus, Trash2 } from "lucide-react";

export default function Marks() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
    marks_obtained: "",
    max_marks: "100",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: marks, isLoading } = useQuery({
    queryKey: ["marks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marks")
        .select("*, students(name, roll_number), courses(name, code)")
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

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("marks").insert({
        student_id: data.student_id,
        course_id: data.course_id,
        marks_obtained: parseInt(data.marks_obtained),
        max_marks: parseInt(data.max_marks),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["marks-count"] });
      setOpen(false);
      setFormData({ student_id: "", course_id: "", marks_obtained: "", max_marks: "100" });
      toast({ title: "Marks added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error adding marks", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["marks-count"] });
      toast({ title: "Marks deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting marks", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const getPercentage = (obtained: number, max: number) => {
    return ((obtained / max) * 100).toFixed(1);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", color: "text-success" };
    if (percentage >= 80) return { grade: "A", color: "text-success" };
    if (percentage >= 70) return { grade: "B", color: "text-primary" };
    if (percentage >= 60) return { grade: "C", color: "text-warning" };
    if (percentage >= 50) return { grade: "D", color: "text-warning" };
    return { grade: "F", color: "text-destructive" };
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Marks</h1>
          <p className="page-description">Manage student marks and grades</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Marks
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Marks</DialogTitle>
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
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marks_obtained">Marks Obtained</Label>
                  <Input
                    id="marks_obtained"
                    type="number"
                    min="0"
                    value={formData.marks_obtained}
                    onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_marks">Max Marks</Label>
                  <Input
                    id="max_marks"
                    type="number"
                    min="1"
                    value={formData.max_marks}
                    onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Marks"}
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
              <th>Course</th>
              <th>Marks</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : marks?.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No marks records found. Add marks for students!
                </td>
              </tr>
            ) : (
              marks?.map((mark) => {
                const percentage = parseFloat(getPercentage(mark.marks_obtained, mark.max_marks));
                const { grade, color } = getGrade(percentage);
                return (
                  <tr key={mark.id}>
                    <td className="font-medium">{mark.students?.roll_number}</td>
                    <td>{mark.students?.name}</td>
                    <td>{mark.courses?.code} - {mark.courses?.name}</td>
                    <td>{mark.marks_obtained}/{mark.max_marks}</td>
                    <td>{percentage}%</td>
                    <td className={`font-semibold ${color}`}>{grade}</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(mark.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
