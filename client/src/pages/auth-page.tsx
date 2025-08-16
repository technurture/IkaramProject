import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  graduationYear: z.coerce.number().min(1950).max(2030).optional(),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Simple registration form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    graduationYear: ''
  });
  
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      graduationYear: undefined,
    },
  });


  // Redirect if already logged in
  if (user) {
    // Redirect to admin dashboard if user is admin or super_admin
    if (user.role === 'admin' || user.role === 'super_admin') {
      return <Redirect to="/admin" />;
    }
    return <Redirect to="/" />;
  }

  const handleLogin = (data: LoginData) => {
    // Trim whitespace from all fields
    const trimmedData = {
      email: data.email.trim(),
      password: data.password.trim()
    };
    loginMutation.mutate(trimmedData);
  };

  const handleRegister = (data: RegisterData) => {
    registerMutation.mutate(data);
  };
  
  const handleSimpleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const errors: Record<string, string> = {};
    
    if (!registerData.firstName || registerData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    if (!registerData.lastName || registerData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    if (!registerData.email || !/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!registerData.username || registerData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    if (!registerData.password || registerData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }
    
    setRegisterErrors({});
    
    // Convert graduation year to number if provided
    const submitData = {
      ...registerData,
      graduationYear: registerData.graduationYear ? parseInt(registerData.graduationYear) : undefined
    };
    
    registerMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Home Button */}
        <div className="flex justify-start">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Ikaram Alumni" 
              className="h-16 w-auto"
              onError={(e) => {
                // Fallback to logo.jpeg if png fails
                e.currentTarget.src = "/logo.jpeg";
              }}
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === "login" ? "Welcome back!" : "Join our community"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "login" 
              ? "Sign in to your account to continue" 
              : "Create your account to get started"
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setMode("login")}
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setMode("register")}
              >
                Register
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mode === "login" ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            ) : (
              <form onSubmit={handleSimpleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      type="text"
                      placeholder="John" 
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({...registerData, firstName: e.target.value.trim()})}
                      className={registerErrors.firstName ? 'border-red-500' : ''}
                    />
                    {registerErrors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{registerErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      type="text"
                      placeholder="Doe" 
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({...registerData, lastName: e.target.value.trim()})}
                      className={registerErrors.lastName ? 'border-red-500' : ''}
                    />
                    {registerErrors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{registerErrors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="your@email.com" 
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value.trim()})}
                    className={registerErrors.email ? 'border-red-500' : ''}
                  />
                  {registerErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{registerErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    type="text"
                    placeholder="johndoe" 
                    value={registerData.username}
                    onChange={(e) => setRegisterData({...registerData, username: e.target.value.trim()})}
                    className={registerErrors.username ? 'border-red-500' : ''}
                  />
                  {registerErrors.username && (
                    <p className="text-sm text-red-500 mt-1">{registerErrors.username}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="graduationYear">Graduation Year (Optional)</Label>
                  <select 
                    id="graduationYear"
                    value={registerData.graduationYear}
                    onChange={(e) => setRegisterData({...registerData, graduationYear: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 30 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••" 
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className={registerErrors.password ? 'border-red-500' : ''}
                  />
                  {registerErrors.password && (
                    <p className="text-sm text-red-500 mt-1">{registerErrors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
