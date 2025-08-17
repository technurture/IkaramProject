import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IUser, BlogWithAuthor, EventWithDetails, StaffWithUser, insertBlogSchema, insertEventSchema, insertUserSchema, insertStaffSchema } from "@shared/mongodb-schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  Calendar, 
  UserCheck, 
  Settings, 
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  ChevronDown,
  UserPlus,
  Shield,
  Save,
  X,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ScrollableDialog,
  ScrollableDialogContent,
  ScrollableDialogHeader,
  ScrollableDialogBody,
  ScrollableDialogFooter,
  ScrollableDialogTitle,
  ScrollableDialogDescription,
} from "@/components/ui/scrollable-dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { AdminTable } from "@/components/admin-table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const blogFormSchema = insertBlogSchema.omit({ authorId: true }).extend({
  startDate: z.string().optional(),
  featuredImage: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

const eventFormSchema = insertEventSchema.omit({ createdBy: true }).extend({
  startDate: z.string(),
  endDate: z.string().optional(),
  registrationDeadline: z.string().optional(),
  featuredImage: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

const userFormSchema = insertUserSchema.omit({ isActive: true, isApproved: true });

// Enhanced staff form schema - either select existing user or create new
const staffFormSchema = z.object({
  // Option 1: Select existing user
  existingUserId: z.string().optional(),
  // Option 2: Create new user
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  // Staff details
  position: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  officeLocation: z.string().optional(),
  // Auto-admin option
  makeAdmin: z.boolean().default(true),
  // Profile image
  profileImage: z.string().optional(),
});

const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  bio: z.string().optional(),
  graduationYear: z.number().optional(),
  profileImage: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  officeLocation: z.string().optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  }
);

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [createBlogOpen, setCreateBlogOpen] = useState(false);
  const [editBlogOpen, setEditBlogOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createStaffOpen, setCreateStaffOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editStaffOpen, setEditStaffOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBlogMedia, setUploadingBlogMedia] = useState(false);
  const [uploadingEventMedia, setUploadingEventMedia] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);

  // Redirect if not super admin
  if (!user || user.role !== 'super_admin') {
    return <Redirect to="/" />;
  }

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch admin stats");
      return response.json();
    },
  });

  const { data: recentBlogs } = useQuery<BlogWithAuthor[]>({
    queryKey: ["/api/blogs", "recent"],
    queryFn: async () => {
      const response = await fetch("/api/blogs?limit=5");
      if (!response.ok) throw new Error("Failed to fetch blogs");
      return response.json();
    },
  });

  const { data: recentEvents } = useQuery<EventWithDetails[]>({
    queryKey: ["/api/events", "recent"],
    queryFn: async () => {
      const response = await fetch("/api/events?limit=5");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const { data: recentStaff } = useQuery<StaffWithUser[]>({
    queryKey: ["/api/staff", "recent"],
    queryFn: async () => {
      const response = await fetch("/api/staff?limit=10");
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
  });

  const { data: allAdmins } = useQuery<IUser[]>({
    queryKey: ["/api/admin/all"],
    queryFn: async () => {
      const response = await fetch("/api/admin/all");
      if (!response.ok) throw new Error("Failed to fetch admins");
      return response.json();
    },
  });

  const { data: allUsers } = useQuery<IUser[]>({
    queryKey: ["/api/users/all"],
    queryFn: async () => {
      const response = await fetch("/api/users/all");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const { data: pendingAdmins } = useQuery<IUser[]>({
    queryKey: ["/api/admin/pending"],
    queryFn: async () => {
      const response = await fetch("/api/admin/pending");
      if (!response.ok) throw new Error("Failed to fetch pending admins");
      return response.json();
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      const targetUserId = selectedAdminId || user!._id;
      const res = await apiRequest("PUT", `/api/users/${targetUserId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      setProfileOpen(false);
      setSelectedAdminId(null);
      // Invalidate multiple queries to refresh all user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/all"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
    },
  });

  // Blog creation mutation
  const createBlogMutation = useMutation({
    mutationFn: async (data: z.infer<typeof blogFormSchema>) => {
      const blogData = {
        ...data,
        authorId: user!._id,
      };
      const res = await apiRequest("POST", "/api/blogs", blogData);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Blog created successfully" });
      setCreateBlogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create blog", description: error.message, variant: "destructive" });
    },
  });

  // Event creation mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof eventFormSchema>) => {
      const eventData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : undefined,
        createdBy: user!._id,
      };
      const res = await apiRequest("POST", "/api/events", eventData);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Event created successfully" });
      setCreateEventOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    },
  });

  // Blog edit mutation
  const editBlogMutation = useMutation({
    mutationFn: async (data: z.infer<typeof blogFormSchema>) => {
      const res = await apiRequest("PUT", `/api/blogs/${selectedBlogId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Blog updated successfully" });
      setEditBlogOpen(false);
      setSelectedBlogId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update blog", description: error.message, variant: "destructive" });
    },
  });

  // Event edit mutation
  const editEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof eventFormSchema>) => {
      const eventData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : undefined,
      };
      const res = await apiRequest("PUT", `/api/events/${selectedEventId}`, eventData);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Event updated successfully" });
      setEditEventOpen(false);
      setSelectedEventId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update event", description: error.message, variant: "destructive" });
    },
  });

  // User creation mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Admin created successfully" });
      setCreateUserOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/all"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create admin", description: error.message, variant: "destructive" });
    },
  });

  // Staff creation mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data: z.infer<typeof staffFormSchema>) => {
      const res = await apiRequest("POST", "/api/staff", data);
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.defaultPassword) {
        toast({ 
          title: "Staff member added successfully", 
          description: `Default password: ${data.defaultPassword}. Please share this with the new admin.`,
          duration: 10000
        });
      } else {
        toast({ title: "Staff member added successfully" });
      }
      setCreateStaffOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add staff member", description: error.message, variant: "destructive" });
    },
  });

  // Admin approval mutation
  const approveAdminMutation = useMutation({
    mutationFn: async ({ id, isApproved }: { id: string; isApproved: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/${id}/approve`, { isApproved });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Admin status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update admin status", description: error.message, variant: "destructive" });
    },
  });

  // Admin reactivation mutation
  const reactivateAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PUT", `/api/admin/${id}/reactivate`);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Admin reactivated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reactivate admin", description: error.message, variant: "destructive" });
    },
  });

  // Admin deletion mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Admin deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete admin", description: error.message, variant: "destructive" });
    },
  });

  // Edit staff mutation
  const editStaffMutation = useMutation({
    mutationFn: async (data: z.infer<typeof staffFormSchema>) => {
      const res = await apiRequest("PUT", `/api/staff/${selectedStaff._id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Staff member updated successfully" });
      setEditStaffOpen(false);
      setSelectedStaff(null);
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/all"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update staff member", description: error.message, variant: "destructive" });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordChangeSchema>) => {
      const res = await apiRequest("PUT", "/api/user/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setChangePasswordOpen(false);
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to change password", description: error.message, variant: "destructive" });
    },
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
      bio: user?.bio || "",
      graduationYear: user?.graduationYear || undefined,
      profileImage: user?.profileImage || "",
      position: "",
      department: "",
      phoneNumber: "",
      officeLocation: "",
    },
  });

  // Blog form
  const blogForm = useForm<z.infer<typeof blogFormSchema>>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      category: "",
      status: "published",
      tags: [],
      featuredImage: "",
      attachments: [],
    },
  });

  // Event form
  const eventForm = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      location: "",
      category: "",
      isVirtual: false,
      status: "upcoming",
      featuredImage: "",
      attachments: [],
    },
  });

  // User form
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "user",
    },
  });

  // Staff form
  const staffForm = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      existingUserId: "",
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      position: "",
      department: "",
      bio: "",
      phoneNumber: "",
      officeLocation: "",
      makeAdmin: true,
      profileImage: "",
    },
  });

  // Edit staff form
  const editStaffForm = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      position: "",
      department: "",
      bio: "",
      phoneNumber: "",
      officeLocation: "",
      profileImage: "",
    },
  });

  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onUpdateProfile = (values: z.infer<typeof profileFormSchema>) => {
    // Trim whitespace from text fields
    const trimmedValues = {
      ...values,
      firstName: values.firstName?.trim() || "",
      lastName: values.lastName?.trim() || "",
      email: values.email?.trim() || "",
      username: values.username?.trim() || "",
      bio: values.bio?.trim(),
    };
    updateProfileMutation.mutate(trimmedValues);
  };

  const onCreateBlog = (values: z.infer<typeof blogFormSchema>) => {
    // Trim whitespace from text fields
    const trimmedValues = {
      ...values,
      title: values.title.trim(),
      content: values.content.trim(),
      excerpt: values.excerpt?.trim(),
      tags: values.tags?.map((tag: string) => tag.trim()),
    };
    createBlogMutation.mutate(trimmedValues);
  };

  const onCreateEvent = (values: z.infer<typeof eventFormSchema>) => {
    // Trim whitespace from text fields
    const trimmedValues = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location?.trim(),
    };
    createEventMutation.mutate(trimmedValues);
  };

  const onEditBlog = (values: z.infer<typeof blogFormSchema>) => {
    // Trim whitespace from text fields
    const trimmedValues = {
      ...values,
      title: values.title.trim(),
      content: values.content.trim(),
      excerpt: values.excerpt?.trim(),
      tags: values.tags?.map((tag: string) => tag.trim()),
    };
    editBlogMutation.mutate(trimmedValues);
  };

  const onEditEvent = (values: z.infer<typeof eventFormSchema>) => {
    // Trim whitespace from text fields
    const trimmedValues = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location?.trim(),
    };
    editEventMutation.mutate(trimmedValues);
  };

  // Function to open edit dialogs and populate forms
  const openEditBlog = (blog: BlogWithAuthor) => {
    setSelectedBlogId(blog._id);
    blogForm.reset({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || "",
      category: blog.category,
      status: blog.status,
      tags: blog.tags || [],
      featuredImage: blog.featuredImage || "",
      attachments: blog.attachments || [],
    });
    setEditBlogOpen(true);
  };

  const openEditEvent = (event: EventWithDetails) => {
    setSelectedEventId(event._id);
    eventForm.reset({
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
      location: event.location,
      category: event.category,
      isVirtual: event.isVirtual,
      status: event.status,
      featuredImage: event.featuredImage || "",
      attachments: event.attachments || [],
    });
    setEditEventOpen(true);
  };

  const onCreateUser = (values: z.infer<typeof userFormSchema>) => {
    // Trim whitespace from text fields
    const trimmedValues = {
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      username: values.username.trim(),
      password: values.password.trim(),
      bio: values.bio?.trim(),
    };
    createUserMutation.mutate(trimmedValues);
  };

  const onCreateStaff = (values: z.infer<typeof staffFormSchema>) => {
    // Trim whitespace from text fields and handle the new_user case
    const trimmedValues = {
      ...values,
      existingUserId: values.existingUserId === "new_user" ? undefined : values.existingUserId,
      firstName: values.firstName?.trim(),
      lastName: values.lastName?.trim(),
      email: values.email?.trim(),
      username: values.username?.trim(),
      position: values.position?.trim() || "",
      department: values.department?.trim(),
      phoneNumber: values.phoneNumber?.trim(),
      bio: values.bio?.trim(),
      officeLocation: values.officeLocation?.trim(),
    };
    createStaffMutation.mutate(trimmedValues);
  };

  const onEditStaff = (values: z.infer<typeof staffFormSchema>) => {
    // Trim whitespace from text fields
    const trimmedValues = {
      ...values,
      position: values.position?.trim() || "",
      department: values.department?.trim() || "",
      bio: values.bio?.trim() || "",
      phoneNumber: values.phoneNumber?.trim() || "",
      officeLocation: values.officeLocation?.trim() || "",
    };
    editStaffMutation.mutate(trimmedValues);
  };

  const onChangePassword = (values: z.infer<typeof passwordChangeSchema>) => {
    changePasswordMutation.mutate(values);
  };

  // Media upload handlers for super admin
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to upload image');
      return response.json();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to upload image", description: error.message, variant: "destructive" });
    },
  });

  // Blog media upload handler
  const handleBlogMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'attachment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Please upload a file smaller than 10MB.", variant: "destructive" });
      return;
    }

    setUploadingBlogMedia(true);
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      if (type === 'featured') {
        blogForm.setValue('featuredImage', result.url);
        toast({ title: "Featured image uploaded successfully" });
      } else {
        const currentAttachments = blogForm.getValues('attachments') || [];
        blogForm.setValue('attachments', [...currentAttachments, result.url]);
        toast({ title: "File uploaded successfully" });
      }
    } finally {
      setUploadingBlogMedia(false);
    }
  };

  // Event media upload handler
  const handleEventMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'attachment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Please upload a file smaller than 10MB.", variant: "destructive" });
      return;
    }

    setUploadingEventMedia(true);
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      if (type === 'featured') {
        eventForm.setValue('featuredImage', result.url);
        toast({ title: "Featured image uploaded successfully" });
      } else {
        const currentAttachments = eventForm.getValues('attachments') || [];
        eventForm.setValue('attachments', [...currentAttachments, result.url]);
        toast({ title: "File uploaded successfully" });
      }
    } finally {
      setUploadingEventMedia(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-700">Super Admin Dashboard</h1>
            <p className="text-gray-600 text-sm md:text-base">Full system administration and management</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-4">
            <Button 
              onClick={() => setProfileOpen(true)} 
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              onClick={() => setChangePasswordOpen(true)} 
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Actions
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setCreateBlogOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Blog Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCreateEventOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCreateUserOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCreateStaffOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Add Staff Member
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("admin")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Admins
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="admin" className="text-xs md:text-sm">Admin</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm">Users</TabsTrigger>
            <TabsTrigger value="content" className="text-xs md:text-sm">Content</TabsTrigger>
            <TabsTrigger value="events" className="text-xs md:text-sm">Events</TabsTrigger>
            <TabsTrigger value="staff" className="text-xs md:text-sm">Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="border-l-4 border-l-primary-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Admins</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalUsers?.toLocaleString()}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-primary-600" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    +{stats?.newUsersThisMonth} new admins this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalBlogs?.toLocaleString()}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    +{stats?.newBlogsThisWeek} this week
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Events</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalEvents}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    {stats?.upcomingEvents} upcoming
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.pendingApprovals}
                      </p>
                    </div>
                    <UserCheck className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-sm text-orange-600 mt-2">
                    Requires attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Recent Blog Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBlogs?.slice(0, 5).map((blog) => (
                      <div key={blog._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{blog.title}</p>
                          <p className="text-sm text-gray-600">
                            by {blog.author.firstName} {blog.author.lastName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{blog.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEvents?.slice(0, 5).map((event) => (
                      <div key={event._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{event.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(event.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{event.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {pendingAdmins?.length || 0} pending approvals
                </Badge>
              </div>
            </div>
            
            {pendingAdmins && pendingAdmins.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center text-orange-800">
                    <UserCheck className="h-5 w-5 mr-2" />
                    Pending Admin Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminTable 
                    admins={pendingAdmins} 
                    type="pending"
                    onApprove={(id, approved) => approveAdminMutation.mutate({ id, isApproved: approved })}
                  />
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  All Administrators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminTable 
                  admins={allAdmins || []} 
                  type="all"
                  onEdit={(admin) => {
                    // Pre-fill the edit form with admin data
                    profileForm.setValue('firstName', admin.firstName);
                    profileForm.setValue('lastName', admin.lastName);
                    profileForm.setValue('email', admin.email);
                    profileForm.setValue('username', admin.username);
                    profileForm.setValue('bio', admin.bio || '');
                    profileForm.setValue('graduationYear', admin.graduationYear || undefined);
                    profileForm.setValue('profileImage', admin.profileImage || '');
                    setSelectedAdminId(admin._id);
                    setProfileOpen(true);
                  }}
                  onReactivate={(id) => reactivateAdminMutation.mutate(id)}
                  onDelete={(id) => deleteAdminMutation.mutate(id)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">System Users</h2>
              <Button onClick={() => setCreateUserOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Admin
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  All System Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminTable 
                  admins={allUsers || []} 
                  type="all"
                  onEdit={(admin) => {
                    // Pre-fill the edit form with user data
                    profileForm.setValue('firstName', admin.firstName);
                    profileForm.setValue('lastName', admin.lastName);
                    profileForm.setValue('email', admin.email);
                    profileForm.setValue('username', admin.username);
                    profileForm.setValue('bio', admin.bio || '');
                    profileForm.setValue('graduationYear', admin.graduationYear || undefined);
                    profileForm.setValue('profileImage', admin.profileImage || '');
                    setSelectedAdminId(admin._id);
                    setProfileOpen(true);
                  }}
                  onReactivate={(id) => reactivateAdminMutation.mutate(id)}
                  onDelete={(id) => deleteAdminMutation.mutate(id)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
              <Button onClick={() => setCreateBlogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Blog Post
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Blog Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBlogs?.map((blog) => (
                    <div key={blog._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{blog.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{blog.excerpt}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{blog.status}</Badge>
                          <span className="text-xs text-gray-500">
                            by {blog.author.firstName} {blog.author.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditBlog(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
              <Button onClick={() => setCreateEventOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents?.map((event) => (
                    <div key={event._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{event.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{event.status}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
              <Button onClick={() => setCreateStaffOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Staff Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentStaff?.map((staff: any) => (
                    <div key={staff._id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {staff.user?.firstName} {staff.user?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{staff.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{staff.department}</Badge>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedStaff(staff);
                              editStaffForm.reset({
                                position: staff.position || "",
                                department: staff.department || "",
                                bio: staff.bio || "",
                                phoneNumber: staff.phoneNumber || "",
                                officeLocation: staff.officeLocation || "",
                                profileImage: staff.profileImage || "",
                              });
                              setEditStaffOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
              <Button onClick={() => setCreateUserOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">User management interface would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
              <Button onClick={() => setCreateBlogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentBlogs?.map((blog) => (
                    <div key={blog._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{blog.title}</h3>
                        <p className="text-sm text-gray-600">
                          by {blog.author.firstName} {blog.author.lastName} • {blog.category}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                          {blog.status}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => openEditBlog(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
              <Button onClick={() => setCreateEventOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentEvents?.map((event) => (
                    <div key={event._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startDate).toLocaleDateString()} • {event.location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {event.registrationCount || 0} registered
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => openEditEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
              <Button onClick={() => setCreateStaffOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Management</h3>
                  <p className="text-gray-600">Staff management interface would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Profile Edit Modal */}
        <ScrollableDialog open={profileOpen} onOpenChange={setProfileOpen}>
          <ScrollableDialogContent className="max-w-lg">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle>
                {selectedAdminId ? 'Edit Admin Profile' : 'Edit Profile'}
              </ScrollableDialogTitle>
              <ScrollableDialogDescription>
                {selectedAdminId 
                  ? 'Update this administrator\'s information and account details.' 
                  : 'Update your personal information and account details.'
                }
              </ScrollableDialogDescription>
            </ScrollableDialogHeader>
            <ScrollableDialogBody>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about yourself..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2023" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Staff-specific fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Professor, Administrator" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., +1-234-567-8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="officeLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Building A, Room 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Profile Image Upload */}
                <div className="space-y-4">
                  <FileUpload
                    label="Profile Image"
                    description="Upload a profile picture"
                    accept="image/*"
                    multiple={false}
                    maxFiles={1}
                    onUrlsChange={(urls) => profileForm.setValue('profileImage', urls[0] || '')}
                    data-testid="profile-image-upload"
                  />
                </div>
              </form>
            </Form>
            </ScrollableDialogBody>
            <ScrollableDialogFooter>
              <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={profileForm.handleSubmit(onUpdateProfile)} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </ScrollableDialogFooter>
          </ScrollableDialogContent>
        </ScrollableDialog>

        {/* Create Blog Modal */}
        <ScrollableDialog open={createBlogOpen} onOpenChange={setCreateBlogOpen}>
          <ScrollableDialogContent className="max-w-2xl">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle>Create New Blog Post</ScrollableDialogTitle>
              <ScrollableDialogDescription>Write and publish a new blog post for the community.</ScrollableDialogDescription>
            </ScrollableDialogHeader>
            <ScrollableDialogBody>
              <Form {...blogForm}>
                <form onSubmit={blogForm.handleSubmit(onCreateBlog)} className="space-y-4">
                <FormField
                  control={blogForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter blog title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={blogForm.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of the blog post" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={blogForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Write your blog content here..." className="min-h-[200px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={blogForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Alumni Stories" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={blogForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                  
                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <FileUpload
                      label="Featured Image"
                      description="Upload a featured image for this blog post"
                      accept="image/*"
                      multiple={false}
                      maxFiles={1}
                      onUrlsChange={(urls) => blogForm.setValue('featuredImage', urls[0] || '')}
                      data-testid="blog-featured-image-upload"
                    />
                    
                    <FileUpload
                      label="Multiple Images & Files"
                      description="Select multiple images, videos, or documents (hold Ctrl/Cmd while clicking to select multiple)"
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                      multiple={true}
                      maxFiles={10}
                      maxSize={25}
                      onUrlsChange={(urls) => blogForm.setValue('attachments', urls)}
                      data-testid="blog-attachments-upload"
                    />
                  </div>
                </form>
              </Form>
            </ScrollableDialogBody>
            <ScrollableDialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateBlogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={blogForm.handleSubmit(onCreateBlog)} disabled={createBlogMutation.isPending}>
                {createBlogMutation.isPending ? "Creating..." : "Create Blog"}
              </Button>
            </ScrollableDialogFooter>
          </ScrollableDialogContent>
        </ScrollableDialog>

        {/* Edit Blog Modal */}
        <ScrollableDialog open={editBlogOpen} onOpenChange={setEditBlogOpen}>
          <ScrollableDialogContent className="max-w-2xl">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle>Edit Blog Post</ScrollableDialogTitle>
              <ScrollableDialogDescription>Update your blog post content and settings.</ScrollableDialogDescription>
            </ScrollableDialogHeader>
            <ScrollableDialogBody>
              <Form {...blogForm}>
                <form onSubmit={blogForm.handleSubmit(onEditBlog)} className="space-y-4">
                <FormField
                  control={blogForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter blog title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={blogForm.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of the blog post" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={blogForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Write your blog content here..." className="min-h-[200px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={blogForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Alumni Stories" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={blogForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                  
                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <FileUpload
                      label="Featured Image"
                      description="Upload a featured image for this blog post"
                      accept="image/*"
                      multiple={false}
                      maxFiles={1}
                      onUrlsChange={(urls) => blogForm.setValue('featuredImage', urls[0] || '')}
                      data-testid="blog-featured-image-upload"
                    />
                    
                    <FileUpload
                      label="Multiple Images & Files"
                      description="Select multiple images, videos, or documents (hold Ctrl/Cmd while clicking to select multiple)"
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                      multiple={true}
                      maxFiles={10}
                      maxSize={25}
                      onUrlsChange={(urls) => blogForm.setValue('attachments', urls)}
                      data-testid="blog-attachments-upload"
                    />
                  </div>
                </form>
              </Form>
            </ScrollableDialogBody>
            <ScrollableDialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditBlogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={blogForm.handleSubmit(onEditBlog)} disabled={editBlogMutation.isPending}>
                {editBlogMutation.isPending ? "Updating..." : "Update Blog"}
              </Button>
            </ScrollableDialogFooter>
          </ScrollableDialogContent>
        </ScrollableDialog>

        {/* Create Event Modal */}
        <ScrollableDialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
          <ScrollableDialogContent className="max-w-2xl">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle>Create New Event</ScrollableDialogTitle>
              <ScrollableDialogDescription>Organize a new event for the alumni community.</ScrollableDialogDescription>
            </ScrollableDialogHeader>
            <ScrollableDialogBody>
              <Form {...eventForm}>
                <form onSubmit={eventForm.handleSubmit(onCreateEvent)} className="space-y-4">
                <FormField
                  control={eventForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Event description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={eventForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={eventForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={eventForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Event location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={eventForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Networking" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={eventForm.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attendees (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Maximum number of attendees" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* File Upload Section */}
                <div className="space-y-4">
                  <FileUpload
                    label="Featured Image"
                    description="Upload a featured image for this event"
                    accept="image/*"
                    multiple={false}
                    maxFiles={1}
                    onUrlsChange={(urls) => eventForm.setValue('featuredImage', urls[0] || '')}
                    data-testid="event-featured-image-upload"
                  />
                  
                  <FileUpload
                    label="Event Attachments"
                    description="Upload multiple event documents, flyers, or additional files (up to 10 files, 25MB each)"
                    multiple={true}
                    maxFiles={10}
                    maxSize={25}
                    onUrlsChange={(urls) => eventForm.setValue('attachments', urls)}
                    data-testid="event-attachments-upload"
                  />
                </div>
              </form>
            </Form>
            </ScrollableDialogBody>
            <ScrollableDialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateEventOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={eventForm.handleSubmit(onCreateEvent)} disabled={createEventMutation.isPending}>
                {createEventMutation.isPending ? "Creating..." : "Create Event"}
              </Button>
            </ScrollableDialogFooter>
          </ScrollableDialogContent>
        </ScrollableDialog>

        {/* Edit Event Modal */}
        <ScrollableDialog open={editEventOpen} onOpenChange={setEditEventOpen}>
          <ScrollableDialogContent className="max-w-2xl">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle>Edit Event</ScrollableDialogTitle>
              <ScrollableDialogDescription>Update event details and settings.</ScrollableDialogDescription>
            </ScrollableDialogHeader>
            <ScrollableDialogBody>
              <Form {...eventForm}>
                <form onSubmit={eventForm.handleSubmit(onEditEvent)} className="space-y-4">
                <FormField
                  control={eventForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={eventForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Event description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={eventForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={eventForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={eventForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Event venue or online link" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={eventForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Networking" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                  
                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <FileUpload
                      label="Featured Image"
                      description="Upload a featured image for this event"
                      accept="image/*"
                      multiple={false}
                      maxFiles={1}
                      onUrlsChange={(urls) => eventForm.setValue('featuredImage', urls[0] || '')}
                      data-testid="event-featured-image-upload"
                    />
                    
                    <FileUpload
                      label="Event Attachments"
                      description="Upload multiple event documents, flyers, or additional files (up to 10 files, 25MB each)"
                      multiple={true}
                      maxFiles={10}
                      maxSize={25}
                      onUrlsChange={(urls) => eventForm.setValue('attachments', urls)}
                      data-testid="event-attachments-upload"
                    />
                  </div>
                </form>
              </Form>
            </ScrollableDialogBody>
            <ScrollableDialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditEventOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={eventForm.handleSubmit(onEditEvent)} disabled={editEventMutation.isPending}>
                {editEventMutation.isPending ? "Updating..." : "Update Event"}
              </Button>
            </ScrollableDialogFooter>
          </ScrollableDialogContent>
        </ScrollableDialog>

        {/* Create User Modal */}
        <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>Create a new admin account for the platform.</DialogDescription>
            </DialogHeader>
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onCreateUser)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={userForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimum 6 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={userForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="graduationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Graduation Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2023" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create Admin"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Create Staff Modal */}
        <ScrollableDialog open={createStaffOpen} onOpenChange={setCreateStaffOpen}>
          <ScrollableDialogContent className="max-w-lg">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle>Add Staff Member</ScrollableDialogTitle>
              <ScrollableDialogDescription>Add a new staff member to the platform.</ScrollableDialogDescription>
            </ScrollableDialogHeader>
            <ScrollableDialogBody>
              <Form {...staffForm}>
                <form onSubmit={staffForm.handleSubmit(onCreateStaff)} className="space-y-4">
                <FormField
                  control={staffForm.control}
                  name="existingUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Existing User (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user or create new one below" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new_user">Create New User</SelectItem>
                          {allUsers?.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.firstName} {user.lastName} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(!staffForm.watch("existingUserId") || staffForm.watch("existingUserId") === "new_user") && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={staffForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={staffForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={staffForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={staffForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={staffForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Alumni Coordinator" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={staffForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Alumni Relations" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={staffForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={staffForm.control}
                  name="officeLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Building A, Room 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={staffForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief bio about the staff member" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!staffForm.watch("existingUserId") && (
                  <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                    <FormField
                      control={staffForm.control}
                      name="makeAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Make this staff member an admin
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Staff members will automatically receive admin privileges and a default password to change on first login.
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                
                {/* Profile Image Upload */}
                <div className="space-y-4">
                  <FileUpload
                    label="Profile Image"
                    description="Upload a profile picture for the staff member"
                    accept="image/*"
                    multiple={false}
                    maxFiles={1}
                    onUrlsChange={(urls) => staffForm.setValue('profileImage', urls[0] || '')}
                    data-testid="staff-profile-image-upload"
                  />
                </div>
              </form>
            </Form>
            </ScrollableDialogBody>
            <ScrollableDialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateStaffOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={staffForm.handleSubmit(onCreateStaff)} disabled={createStaffMutation.isPending}>
                {createStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
              </Button>
            </ScrollableDialogFooter>
          </ScrollableDialogContent>
        </ScrollableDialog>

        {/* Edit Staff Modal */}
        <ScrollableDialog open={editStaffOpen} onOpenChange={setEditStaffOpen}>
          <ScrollableDialogContent className="max-w-lg">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle>Edit Staff Member</ScrollableDialogTitle>
              <ScrollableDialogDescription>
                Update staff member information for {selectedStaff?.user?.firstName} {selectedStaff?.user?.lastName}.
              </ScrollableDialogDescription>
            </ScrollableDialogHeader>
            <ScrollableDialogBody>
              <Form {...editStaffForm}>
                <form onSubmit={editStaffForm.handleSubmit(onEditStaff)} className="space-y-4">
                  <FormField
                    control={editStaffForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="System Administrator" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editStaffForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Information Technology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editStaffForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description about the staff member..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editStaffForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1-555-0100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editStaffForm.control}
                    name="officeLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Admin Building, Room 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Profile Image</Label>
                    <FileUpload
                      label="Upload Profile Image"
                      description="Upload a profile picture for the staff member"
                      accept="image/*"
                      multiple={false}
                      maxFiles={1}
                      onUrlsChange={(urls) => editStaffForm.setValue('profileImage', urls[0] || '')}
                      data-testid="edit-staff-profile-image-upload"
                    />
                  </div>
                </form>
              </Form>
            </ScrollableDialogBody>
            <ScrollableDialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditStaffOpen(false)}
                disabled={editStaffMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={editStaffForm.handleSubmit(onEditStaff)}
                disabled={editStaffMutation.isPending}
              >
                {editStaffMutation.isPending ? "Updating..." : "Update Staff Member"}
              </Button>
            </ScrollableDialogFooter>
          </ScrollableDialogContent>
        </ScrollableDialog>



        {/* Change Password Dialog */}
        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>Update your account password</DialogDescription>
            </DialogHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Footer />
    </div>
  );
}