import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileSpreadsheet, CreditCard, Loader2 } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ["my-student-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, departments(name)")
        .eq("user_id", user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: marks, isLoading: marksLoading } = useQuery({
    queryKey: ["my-marks", student?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marks")
        .select("*, courses(name, code)")
        .eq("student_id", student?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!student?.id,
  });

  const { data: fees, isLoading: feesLoading } = useQuery({
    queryKey: ["my-fees", student?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fees")
        .select("*")
        .eq("student_id", student?.id)
        .order("semester", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!student?.id,
  });

  const getPercentage = (obtained: number, max: number) => ((obtained / max) * 100).toFixed(1);
  
  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", color: "text-success" };
    if (percentage >= 80) return { grade: "A", color: "text-success" };
    if (percentage >= 70) return { grade: "B", color: "text-primary" };
    if (percentage >= 60) return { grade: "C", color: "text-warning" };
    if (percentage >= 50) return { grade: "D", color: "text-warning" };
    return { grade: "F", color: "text-destructive" };
  };

  if (studentLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No student profile found for your account.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {student.name}</h1>
        <p className="page-description">View your academic information</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="marks" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Marks
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Fees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Personal Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{student.roll_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{student.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{student.departments?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{student.year}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marks" className="mt-6">
          <div className="rounded-lg border bg-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {marksLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : marks?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No marks records found.
                    </td>
                  </tr>
                ) : (
                  marks?.map((mark) => {
                    const percentage = parseFloat(getPercentage(mark.marks_obtained, mark.max_marks));
                    const { grade, color } = getGrade(percentage);
                    return (
                      <tr key={mark.id}>
                        <td>{mark.courses?.code} - {mark.courses?.name}</td>
                        <td>{mark.marks_obtained}/{mark.max_marks}</td>
                        <td>{percentage}%</td>
                        <td className={`font-semibold ${color}`}>{grade}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="mt-6">
          <div className="rounded-lg border bg-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Academic Year</th>
                  <th>Total Fees</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {feesLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : fees?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No fees records found.
                    </td>
                  </tr>
                ) : (
                  fees?.map((fee) => (
                    <tr key={fee.id}>
                      <td>Semester {fee.semester}</td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
