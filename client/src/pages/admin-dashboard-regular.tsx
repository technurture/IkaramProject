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
  ScrollableDialogDescription,
  ScrollableDialogHeader,
  ScrollableDialogTitle,
  ScrollableDialogBody,
  ScrollableDialogFooter,
} from "@/components/ui/scrollable-dialog";
import { FileUpload } from "@/components/ui/file-upload";
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



const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  bio: z.string().optional(),
  graduationYear: z.number().optional(),
  profileImage: z.string().optional(),
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

export default function RegularAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [createBlogOpen, setCreateBlogOpen] = useState(false);
  const [editBlogOpen, setEditBlogOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBlogMedia, setUploadingBlogMedia] = useState(false);
  const [uploadingEventMedia, setUploadingEventMedia] = useState(false);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
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

  const { data: allBlogs } = useQuery<BlogWithAuthor[]>({
    queryKey: ["/api/blogs", "all"],
    queryFn: async () => {
      const response = await fetch("/api/blogs?limit=20");
      if (!response.ok) throw new Error("Failed to fetch blogs");
      return response.json();
    },
  });

  const { data: allEvents } = useQuery<EventWithDetails[]>({
    queryKey: ["/api/events", "all"],
    queryFn: async () => {
      const response = await fetch("/api/events?limit=20");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  // Filter content to show only user's own posts
  const userBlogs = allBlogs?.filter(blog => blog.author._id === user?._id) || [];
  const userEvents = allEvents?.filter(event => {
    // Handle both cases: createdBy as string or as object with _id
    const createdById = typeof event.createdBy === 'string' ? event.createdBy : (event.createdBy as any)?._id;
    return createdById === user?._id;
  }) || [];
  const recentBlogs = userBlogs.slice(0, 5);
  const recentEvents = userEvents.slice(0, 5);

  // Query to get all admins for the directory (regular admins can view all admins)
  const { data: admins } = useQuery<IUser[]>({
    queryKey: ["/api/admin/all"],
    queryFn: async () => {
      const response = await fetch("/api/admin/all");
      if (!response.ok) throw new Error("Failed to fetch admins");
      return response.json();
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      const res = await apiRequest("PUT", `/api/users/${user!._id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      setProfileOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
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



  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Profile image upload mutation
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
    onSuccess: (data) => {
      profileForm.setValue('profileImage', data.url);
      toast({ title: "Image uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to upload image", description: error.message, variant: "destructive" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPEG, PNG, or WebP image.", variant: "destructive" });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Please upload an image smaller than 5MB.", variant: "destructive" });
      return;
    }

    setUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  // Blog media upload handler
  const handleBlogMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'attachment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBlogMedia(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to upload file');
      const data = await response.json();
      
      if (type === 'featured') {
        blogForm.setValue('featuredImage', data.url);
      } else {
        const currentAttachments = blogForm.getValues('attachments') || [];
        blogForm.setValue('attachments', [...currentAttachments, data.url]);
      }
      
      toast({ title: "File uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload file", description: "Please try again", variant: "destructive" });
    } finally {
      setUploadingBlogMedia(false);
    }
  };

  // Event media upload handler
  const handleEventMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'attachment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEventMedia(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to upload file');
      const data = await response.json();
      
      if (type === 'featured') {
        eventForm.setValue('featuredImage', data.url);
      } else {
        const currentAttachments = eventForm.getValues('attachments') || [];
        eventForm.setValue('attachments', [...currentAttachments, data.url]);
      }
      
      toast({ title: "File uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload file", description: "Please try again", variant: "destructive" });
    } finally {
      setUploadingEventMedia(false);
    }
  };

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



  const onChangePassword = (values: z.infer<typeof passwordChangeSchema>) => {
    changePasswordMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-700">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm md:text-base">Manage content, events, and community</p>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="my-blogs" className="text-xs md:text-sm">My Blogs</TabsTrigger>
            <TabsTrigger value="my-events" className="text-xs md:text-sm">My Events</TabsTrigger>
            <TabsTrigger value="admins" className="text-xs md:text-sm">Admins</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs md:text-sm">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalUsers?.toLocaleString()}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    +{stats?.newUsersThisMonth} this month
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

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Events</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalEvents}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    {stats?.upcomingEvents} upcoming
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

          <TabsContent value="admins" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Administrator Directory</h2>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {admins?.map((admin) => (
                    <div key={admin._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {admin.profileImage ? (
                            <img
                              src={admin.profileImage}
                              alt={`${admin.firstName} ${admin.lastName}`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {admin.email} • @{admin.username}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                              {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </Badge>
                            <Badge variant={admin.isApproved ? 'outline' : 'destructive'}>
                              {admin.isApproved ? 'Active' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        View Only
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-blogs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Blog Posts</h2>
              <Button onClick={() => setCreateBlogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Blog Post
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {userBlogs.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">You haven't created any blog posts yet.</p>
                      <Button onClick={() => setCreateBlogOpen(true)} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Blog Post
                      </Button>
                    </div>
                  ) : (
                    userBlogs.map((blog) => (
                      <div key={blog._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{blog.title}</h3>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(blog.createdAt).toLocaleDateString()} • {blog.category}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{blog.excerpt}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                            {blog.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditBlog(blog)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
              <Button onClick={() => setCreateEventOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {userEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">You haven't created any events yet.</p>
                      <Button onClick={() => setCreateEventOpen(true)} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Event
                      </Button>
                    </div>
                  ) : (
                    userEvents.map((event) => (
                      <div key={event._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(event.startDate).toLocaleDateString()} • {event.location}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditEvent(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Name</Label>
                    <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Username</Label>
                    <p className="text-gray-900">@{user?.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Role</Label>
                    <Badge>{user?.role === 'admin' ? 'Administrator' : user?.role}</Badge>
                  </div>
                  <Button onClick={() => setProfileOpen(true)} className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Password</Label>
                    <p className="text-gray-500">••••••••</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Account Status</Label>
                    <Badge variant={user?.isActive ? 'default' : 'destructive'}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Button onClick={() => setChangePasswordOpen(true)} className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


        </Tabs>

        {/* Profile Edit Modal */}
        <ScrollableDialog open={profileOpen} onOpenChange={setProfileOpen}>
          <ScrollableDialogContent className="max-w-lg">
            <ScrollableDialogHeader>
              <ScrollableDialogTitle>Edit Profile</ScrollableDialogTitle>
              <ScrollableDialogDescription>Update your personal information and account details.</ScrollableDialogDescription>
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
                <FormField
                  control={profileForm.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value && (
                            <div className="flex items-center space-x-4">
                              <img
                                src={field.value}
                                alt="Profile preview"
                                className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange('')}
                              >
                                Remove Image
                              </Button>
                            </div>
                          )}
                          <div className="flex items-center space-x-4">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              disabled={uploadingImage}
                            />
                            {uploadingImage && (
                              <div className="text-sm text-gray-600">Uploading...</div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
            </ScrollableDialogBody>
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
                    label="Blog Attachments"
                    description="Upload multiple images, videos, or documents (up to 10 files, 25MB each)"
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

        {/* Edit Blog Modal */}
        <Dialog open={editBlogOpen} onOpenChange={setEditBlogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
              <DialogDescription>Update your blog post content and settings.</DialogDescription>
            </DialogHeader>
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
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditBlogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editBlogMutation.isPending}>
                    {editBlogMutation.isPending ? "Updating..." : "Update Blog"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Event Modal */}
        <Dialog open={editEventOpen} onOpenChange={setEditEventOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>Update event details and settings.</DialogDescription>
            </DialogHeader>
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
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditEventOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editEventMutation.isPending}>
                    {editEventMutation.isPending ? "Updating..." : "Update Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

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