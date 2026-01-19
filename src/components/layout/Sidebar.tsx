import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BookOpen, 
  FileSpreadsheet,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Marks", href: "/marks", icon: FileSpreadsheet },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <GraduationCap className="h-8 w-8 text-sidebar-primary" />
          <span className="text-lg font-bold text-sidebar-foreground">
            SMS
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-6 py-4">
          <p className="text-xs text-sidebar-foreground/50">
            Student Management System
          </p>
          <p className="text-xs text-sidebar-foreground/50">
            College Database Project
          </p>
        </div>
      </div>
    </aside>
  );
}
