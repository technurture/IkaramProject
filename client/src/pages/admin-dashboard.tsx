import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import SuperAdminDashboard from "./super-admin-dashboard";
import RegularAdminDashboard from "./admin-dashboard-regular";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Redirect if not admin or super admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Redirect to="/" />;
  }

  // Route to appropriate dashboard based on role
  if (user.role === 'super_admin') {
    return <SuperAdminDashboard />;
  }

  if (user.role === 'admin') {
    return <RegularAdminDashboard />;
  }

  // Fallback redirect
  return <Redirect to="/" />;
}