import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BlogWithAuthor, CommentWithAuthor } from "@shared/schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Clock, Send } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: blog, isLoading: blogLoading } = useQuery<BlogWithAuthor>({
    queryKey: ["/api/blogs", id],
    queryFn: async () => {
      const response = await fetch(`/api/blogs/${id}`);
      if (!response.ok) throw new Error("Failed to fetch blog");
      return response.json();
    },
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/blogs", id, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/blogs/${id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/blogs/${id}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: string }) => {
      await apiRequest("POST", `/api/blogs/${id}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", id, "comments"] });
      setCommentContent("");
      setReplyContent("");
      setReplyingTo(null);
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }
    if (!commentContent.trim()) return;
    commentMutation.mutate({ content: commentContent });
  };

  const handleReply = (parentId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to reply",
        variant: "destructive",
      });
      return;
    }
    if (!replyContent.trim()) return;
    commentMutation.mutate({ content: replyContent, parentId });
  };

  const CommentCard = ({ comment, isReply = false }: { comment: CommentWithAuthor; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 mt-4' : 'mb-6'}`}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.profileImage || undefined} />
              <AvatarFallback>
                {comment.author.firstName[0]}{comment.author.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                <span className="text-gray-500 text-sm">
                  {format(new Date(comment.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-4 ml-11">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-2"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleReply(comment.id)}
                  disabled={commentMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {comment.replies?.map((reply) => (
        <CommentCard key={reply.id} comment={reply} isReply />
      ))}
    </div>
  );

  if (blogLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
            <p className="text-gray-600">The blog post you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isLiked = user && blog.likes.some(like => like.userId === user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Blog Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Badge variant="secondary" className="mr-3">
                {blog.category}
              </Badge>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {format(new Date(blog.createdAt), 'MMMM dd, yyyy')}
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{blog.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={blog.author.profileImage || undefined} />
                  <AvatarFallback>
                    {blog.author.firstName[0]}{blog.author.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">
                    {blog.author.firstName} {blog.author.lastName}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Class of {blog.author.graduationYear || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {blog._count.likes}
                </Button>
                <span className="flex items-center space-x-1 text-gray-500">
                  <MessageCircle className="h-4 w-4" />
                  <span>{blog._count.comments}</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="mb-8">
              <img 
                src={blog.featuredImage} 
                alt={blog.title}
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
          )}
          
          {/* Blog Content */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {blog.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Comments Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({blog._count.comments})
            </h2>
            
            {/* Add Comment */}
            {user && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage || undefined} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="mb-4"
                      />
                      <Button
                        onClick={handleComment}
                        disabled={commentMutation.isPending || !commentContent.trim()}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <div>
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-600">
                    {user ? "Be the first to share your thoughts!" : "Sign in to join the conversation."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
