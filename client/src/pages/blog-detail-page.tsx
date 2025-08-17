import React, { useState, useEffect, useCallback } from "react";
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
import { Heart, MessageCircle, Clock, Send, User, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Media Gallery Component
const ImageGallery = ({ attachments }: { attachments: string[] }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  
  const images = attachments.filter(attachment => 
    attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );
  const videos = attachments.filter(attachment => 
    attachment.match(/\.(mp4|webm|ogg)$/i)
  );
  const documents = attachments.filter(attachment => 
    !attachment.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg)$/i)
  );

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  const nextVideo = () => {
    if (selectedVideo !== null) {
      setSelectedVideo((selectedVideo + 1) % videos.length);
    }
  };

  const prevVideo = () => {
    if (selectedVideo !== null) {
      setSelectedVideo(selectedVideo === 0 ? videos.length - 1 : selectedVideo - 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (selectedImage !== null) {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setSelectedImage(null);
    }
    if (selectedVideo !== null) {
      if (e.key === 'ArrowRight') nextVideo();
      if (e.key === 'ArrowLeft') prevVideo();
      if (e.key === 'Escape') setSelectedVideo(null);
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, selectedVideo]);

  return (
    <div className="space-y-6">
      {/* Images Grid */}
      {images.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Images ({images.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div 
                key={index}
                className="aspect-square border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Videos ({videos.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {videos.map((video, index) => (
              <div 
                key={index}
                className="aspect-video border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group relative"
                onClick={() => setSelectedVideo(index)}
              >
                <video
                  src={video}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-2 border-y-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Documents ({documents.length})</h4>
          <div className="space-y-2">
            {documents.map((document, index) => {
              const filename = document.split('/').pop() || `document-${index + 1}`;
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📄</div>
                    <span className="font-medium text-gray-900">{filename}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(document, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(document, filename)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Download Button */}
            <button
              onClick={() => downloadFile(images[selectedImage], `image-${selectedImage + 1}.jpg`)}
              className="absolute top-4 right-16 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
            >
              <Download className="h-6 w-6" />
            </button>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Image */}
            <img
              src={images[selectedImage]}
              alt={`Image ${selectedImage + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Download Button */}
            <button
              onClick={() => downloadFile(videos[selectedVideo], `video-${selectedVideo + 1}.mp4`)}
              className="absolute top-4 right-16 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
            >
              <Download className="h-6 w-6" />
            </button>

            {/* Previous Button */}
            {videos.length > 1 && (
              <button
                onClick={prevVideo}
                className="absolute left-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next Button */}
            {videos.length > 1 && (
              <button
                onClick={nextVideo}
                className="absolute right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Video */}
            <video
              src={videos[selectedVideo]}
              className="max-w-full max-h-full"
              controls
              autoPlay
            />

            {/* Video Counter */}
            {videos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                {selectedVideo + 1} / {videos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

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
    mutationFn: async (data: { content: string; parentId?: string; authorId?: string; authorName?: string; authorEmail?: string }) => {
      await apiRequest("POST", `/api/blogs/${id}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", id, "comments"] });
      setCommentContent("");
      setReplyInputs({});
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
    // Allow anonymous liking
    likeMutation.mutate();
  };

  const handleComment = useCallback(() => {
    if (!commentContent.trim()) return;
    
    const commentData: any = { content: commentContent };
    if (user) {
      // Authenticated user
      commentData.authorId = user._id;
    }
    // Anonymous users can comment without any additional info
    
    commentMutation.mutate(commentData);
  }, [commentContent, user, commentMutation]);

  const handleReplyInputChange = useCallback((commentId: string, value: string) => {
    setReplyInputs(prev => ({
      ...prev,
      [commentId]: value
    }));
  }, []);

  const handleReply = useCallback((parentId: string) => {
    const content = replyInputs[parentId];
    if (!content?.trim()) return;
    
    const replyData: any = { content, parentId };
    if (user) {
      replyData.authorId = user._id;
    }
    
    commentMutation.mutate(replyData);
  }, [replyInputs, user, commentMutation]);

  const handleCancelReply = useCallback((commentId: string) => {
    setReplyingTo(null);
    setReplyInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[commentId];
      return newInputs;
    });
  }, []);

  const CommentCard = ({ comment, isReply = false }: { comment: CommentWithAuthor; isReply?: boolean }) => {
    const commentId = comment.id;
    
    return (
      <div className={`${isReply ? 'ml-8 mt-4' : 'mb-6'}`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                {comment.author ? (
                  <>
                    <AvatarImage src={comment.author.profileImage || undefined} />
                    <AvatarFallback>
                      {comment.author.firstName[0]}{comment.author.lastName[0]}
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {comment.author ? 
                      `${comment.author.firstName} ${comment.author.lastName}` : 
                      'Anonymous'
                    }
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
                    onClick={() => setReplyingTo(replyingTo === commentId ? null : commentId)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            </div>
            
            {replyingTo === commentId && (
              <div className="mt-4 ml-11">
                <textarea
                  placeholder="Write a reply..."
                  value={replyInputs[commentId] || ''}
                  onChange={(e) => handleReplyInputChange(commentId, e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mb-2"
                  autoFocus
                  data-testid={`input-reply-${commentId}`}
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleReply(commentId)}
                    disabled={commentMutation.isPending || !replyInputs[commentId]?.trim()}
                    data-testid={`button-reply-${commentId}`}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelReply(commentId)}
                    data-testid={`button-cancel-reply-${commentId}`}
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
  };

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

  // For anonymous users, we can't track individual likes, so we don't show like state
  // For authenticated users, check if they've liked this blog
  const isLiked = user && (blog as any).likes?.some((like: any) => like.userId === user._id) || false;

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
                  {(blog as any).likesCount || 0}
                </Button>
                <span className="flex items-center space-x-1 text-gray-500">
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments?.length || 0}</span>
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
          <Card className="mb-8">
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

          {/* Blog Attachments */}
          {(blog as any).attachments && (blog as any).attachments.length > 0 && (
            <Card className="mb-12">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Media Gallery</h3>
                <ImageGallery attachments={(blog as any).attachments} />
              </CardContent>
            </Card>
          )}
          
          {/* Comments Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({comments?.length || 0})
            </h2>
            
            {/* Add Comment */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {user ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage || undefined} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <textarea
                      placeholder="Share your thoughts..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mb-4"
                      data-testid="input-main-comment"
                    />
                    <Button
                      onClick={handleComment}
                      disabled={commentMutation.isPending || !commentContent.trim()}
                      data-testid="button-post-comment"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
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
