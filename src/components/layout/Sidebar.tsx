import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BookOpen, 
  FileSpreadsheet,
  GraduationCap,
  CreditCard,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const adminNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Marks", href: "/marks", icon: FileSpreadsheet },
  { name: "Fees", href: "/fees", icon: CreditCard },
];

export function Sidebar() {
  const { role, signOut, user } = useAuth();

  const navigation = role === "admin" ? adminNavigation : [];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <GraduationCap className="h-8 w-8 text-sidebar-primary" />
          <span className="text-lg font-bold text-sidebar-foreground">
            TIET SMS
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

        {/* User Info & Logout */}
        <div className="border-t border-sidebar-border px-4 py-4">
          {user && (
            <div className="mb-3">
              <p className="truncate text-sm text-sidebar-foreground">{user.email}</p>
              <p className="text-xs capitalize text-sidebar-foreground/50">{role}</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-6 py-4">
          <p className="text-xs text-sidebar-foreground/50">
            Student Management System
          </p>
          <p className="text-xs text-sidebar-foreground/50">
            Thapar Institute
          </p>
        </div>
      </div>
    </aside>
  );
}
