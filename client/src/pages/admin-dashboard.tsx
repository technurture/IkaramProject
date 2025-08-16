import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IUser, BlogWithAuthor, EventWithDetails, StaffWithUser } from "@shared/mongodb-schema";
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
  BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not admin or super admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Redirect to="/" />;
  }

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      // Mock data for demonstration - in real app this would be API calls
      return {
        totalUsers: 2847,
        newUsersThisMonth: 156,
        totalBlogs: 1293,
        newBlogsThisWeek: 23,
        totalEvents: 156,
        upcomingEvents: 12,
        pendingApprovals: 8
      };
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your alumni association platform</p>
          </div>
          <div className="flex space-x-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Quick Actions
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalUsers?.toLocaleString()}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-primary-600" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    +{stats?.newUsersThisMonth} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalBlogs?.toLocaleString()}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-secondary-600" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    +{stats?.newBlogsThisWeek} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Events</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalEvents}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    {stats?.upcomingEvents} upcoming
                  </p>
                </CardContent>
              </Card>

              <Card>
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

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
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
              <Button>
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
              <Button>
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

          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
              <Button>
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
      </div>
      
      <Footer />
    </div>
  );
}
