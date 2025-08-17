import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BlogWithAuthor } from "@shared/mongodb-schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Clock, Search, Plus } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { data: blogs, isLoading } = useQuery<BlogWithAuthor[]>({
    queryKey: ["/api/blogs", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/blogs?search=${encodeURIComponent(searchQuery)}`
        : "/api/blogs?limit=20";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch blogs");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Alumni Stories</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Discover inspiring stories, career insights, and life updates from our amazing alumni community.
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {user && (
            <Link href="/blogs/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Share Your Story
              </Button>
            </Link>
          )}
        </div>

        {/* Blog Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !blogs || blogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchQuery ? "No stories found" : "No stories yet"}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? "Try adjusting your search terms." 
                : "Be the first to share your story with the community!"
              }
            </p>
            {!searchQuery && user && (
              <Link href="/blogs/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Write the First Story
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {blogs.map((blog) => (
              <div key={blog._id} className="relative">
                <Link href={`/blogs/${blog._id}`} className="block">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                  {blog.featuredImage && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={blog.featuredImage} 
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-4 md:p-6 flex-1">
                    <div className="flex items-center mb-3">
                      <Badge variant="secondary" className="mr-3">
                        {blog.category}
                      </Badge>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-primary-700 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                      {blog.excerpt || blog.content.substring(0, 120) + '...'}
                    </p>
                  </CardContent>

                  <CardFooter className="px-4 md:px-6 pb-4 md:pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={blog.author.profileImage || undefined} />
                          <AvatarFallback>
                            {blog.author.firstName[0]}{blog.author.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900 text-sm md:text-base">
                            {blog.author.firstName} {blog.author.lastName}
                          </div>
                          <div className="text-gray-500 text-xs md:text-sm">
                            Class of {blog.author.graduationYear || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 md:space-x-4 text-gray-500 text-sm">
                        <span className="flex items-center space-x-1">
                          <Heart className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{blog._count?.likes || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{blog._count?.comments || 0}</span>
                        </span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
                </Link>
                {user?.role === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/admin#edit-blog-${blog._id}`;
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
