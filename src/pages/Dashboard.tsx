import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, BookOpen, FileSpreadsheet, CreditCard } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: studentsCount } = useQuery({
    queryKey: ["students-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: departmentsCount } = useQuery({
    queryKey: ["departments-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("departments")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: coursesCount } = useQuery({
    queryKey: ["courses-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: marksCount } = useQuery({
    queryKey: ["marks-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("marks")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: feesCount } = useQuery({
    queryKey: ["fees-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("fees")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          TIET Student Management System Overview
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Students"
          value={studentsCount ?? 0}
          icon={<Users className="h-6 w-6 text-primary" />}
          description="Enrolled students"
        />
        <StatCard
          title="Departments"
          value={departmentsCount ?? 0}
          icon={<Building2 className="h-6 w-6 text-primary" />}
          description="Active departments"
        />
        <StatCard
          title="Courses"
          value={coursesCount ?? 0}
          icon={<BookOpen className="h-6 w-6 text-primary" />}
          description="Available courses"
        />
        <StatCard
          title="Marks Records"
          value={marksCount ?? 0}
          icon={<FileSpreadsheet className="h-6 w-6 text-primary" />}
          description="Grade entries"
        />
        <StatCard
          title="Fees Records"
          value={feesCount ?? 0}
          icon={<CreditCard className="h-6 w-6 text-primary" />}
          description="Fee entries"
        />
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Welcome to TIET Student Management System
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This is a database management system for managing students, departments, 
          courses, marks, and fees. Use the sidebar to navigate between different sections.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="font-medium text-foreground">Admin Actions</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Add new students with department assignment</li>
              <li>• Create login credentials for students</li>
              <li>• Manage marks and fees records</li>
              <li>• Add departments and courses</li>
            </ul>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="font-medium text-foreground">Database Relations</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Students belong to Departments</li>
              <li>• Courses belong to Departments</li>
              <li>• Marks link Students to Courses</li>
              <li>• Fees linked to Students</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
