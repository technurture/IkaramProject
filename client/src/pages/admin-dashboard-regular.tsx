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
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  username: z.string().min(3).max(50),
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
  const [createEventOpen, setCreateEventOpen] = useState(false);

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
    try {
      await uploadImageMutation.mutateAsync(file);
    } finally {
      setUploadingImage(false);
    }
  };

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
      } else {
        const currentAttachments = blogForm.getValues('attachments') || [];
        blogForm.setValue('attachments', [...currentAttachments, result.url]);
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
      } else {
        const currentAttachments = eventForm.getValues('attachments') || [];
        eventForm.setValue('attachments', [...currentAttachments, result.url]);
      }
    } finally {
      setUploadingEventMedia(false);
    }
  };

  const onUpdateProfile = (values: z.infer<typeof profileFormSchema>) => {
    // Trim whitespace from text fields
    const trimmedValues = {
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      username: values.username.trim(),
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



  const onChangePassword = (values: z.infer<typeof passwordChangeSchema>) => {
    changePasswordMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>
            <p className="text-gray-600">Manage content, events, and community</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => setProfileOpen(true)} variant="outline">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button onClick={() => setChangePasswordOpen(true)} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div key={blog.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
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
                      <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
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
                    <div key={blog.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
                        <Button variant="ghost" size="sm">
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
                    <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
                        <Button variant="ghost" size="sm">
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


        </Tabs>

        {/* Profile Edit Modal */}
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your personal information and account details.</DialogDescription>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>

        {/* Create Blog Modal */}
        <Dialog open={createBlogOpen} onOpenChange={setCreateBlogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
              <DialogDescription>Write and publish a new blog post for the community.</DialogDescription>
            </DialogHeader>
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
                {/* Featured Image Upload */}
                <FormField
                  control={blogForm.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value && (
                            <div className="flex items-center space-x-4">
                              <img
                                src={field.value}
                                alt="Featured image preview"
                                className="h-20 w-32 rounded object-cover border-2 border-gray-300"
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
                              accept="image/*,video/*"
                              onChange={(e) => handleBlogMediaUpload(e, 'featured')}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              disabled={uploadingBlogMedia}
                            />
                            {uploadingBlogMedia && (
                              <div className="text-sm text-gray-600">Uploading...</div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Attachments */}
                <FormField
                  control={blogForm.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Files (Images, Videos, Documents)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value && field.value.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Uploaded Files:</Label>
                              {field.value.map((url, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                                    {url.split('/').pop()}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newAttachments = field.value?.filter((_, i) => i !== index) || [];
                                      field.onChange(newAttachments);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center space-x-4">
                            <Input
                              type="file"
                              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                              onChange={(e) => handleBlogMediaUpload(e, 'attachment')}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                              disabled={uploadingBlogMedia}
                            />
                            {uploadingBlogMedia && (
                              <div className="text-sm text-gray-600">Uploading...</div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Supported: Images, Videos, PDF, Word, Excel files (max 10MB each)
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateBlogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBlogMutation.isPending}>
                    {createBlogMutation.isPending ? "Creating..." : "Create Blog"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Create Event Modal */}
        <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Organize a new event for the alumni community.</DialogDescription>
            </DialogHeader>
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
                {/* Featured Image Upload */}
                <FormField
                  control={eventForm.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value && (
                            <div className="flex items-center space-x-4">
                              <img
                                src={field.value}
                                alt="Featured image preview"
                                className="h-20 w-32 rounded object-cover border-2 border-gray-300"
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
                              accept="image/*,video/*"
                              onChange={(e) => handleEventMediaUpload(e, 'featured')}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              disabled={uploadingEventMedia}
                            />
                            {uploadingEventMedia && (
                              <div className="text-sm text-gray-600">Uploading...</div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Attachments */}
                <FormField
                  control={eventForm.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Files (Images, Videos, Documents)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value && field.value.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Uploaded Files:</Label>
                              {field.value.map((url, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                                    {url.split('/').pop()}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newAttachments = field.value?.filter((_, i) => i !== index) || [];
                                      field.onChange(newAttachments);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center space-x-4">
                            <Input
                              type="file"
                              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                              onChange={(e) => handleEventMediaUpload(e, 'attachment')}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                              disabled={uploadingEventMedia}
                            />
                            {uploadingEventMedia && (
                              <div className="text-sm text-gray-600">Uploading...</div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Supported: Images, Videos, PDF, Word, Excel files (max 10MB each)
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateEventOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEventMutation.isPending}>
                    {createEventMutation.isPending ? "Creating..." : "Create Event"}
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