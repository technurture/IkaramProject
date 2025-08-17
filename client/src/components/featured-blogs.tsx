import { useQuery } from "@tanstack/react-query";
import { BlogWithAuthor } from "@shared/mongodb-schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function FeaturedBlogs() {
  const { data: blogs, isLoading } = useQuery<BlogWithAuthor[]>({
    queryKey: ["/api/blogs"],
    queryFn: async () => {
      const response = await fetch("/api/blogs?limit=3");
      if (!response.ok) throw new Error("Failed to fetch blogs");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Latest Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Latest Stories</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">No stories have been shared yet. Be the first to share your story!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Latest Stories</h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Discover inspiring stories, career insights, and life updates from our amazing alumni community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {blogs.map((blog) => (
            <Link key={blog._id} href={`/blogs/${blog._id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                {blog.featuredImage && (
                  <div className="h-48 sm:h-56 overflow-hidden">
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center mb-2 md:mb-3">
                    <Badge variant="secondary" className="mr-2 md:mr-3 text-xs">
                      {blog.category}
                    </Badge>
                    <div className="flex items-center text-gray-500 text-xs md:text-sm">
                      <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-primary-700 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                    {blog.excerpt || blog.content?.substring(0, 120) + '...'}
                  </p>
                </CardContent>

                <CardFooter className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-6 w-6 md:h-8 md:w-8">
                        <AvatarImage src={blog.author.profileImage || undefined} />
                        <AvatarFallback className="text-xs">
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
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/blogs">
            <Button size="lg">View All Stories</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
