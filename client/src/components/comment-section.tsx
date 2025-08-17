import React, { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Button
} from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  MessageCircle,
  Send,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CommentWithAuthor {
  id?: string;
  _id?: string;
  content: string;
  author?: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  createdAt: string;
  replies?: CommentWithAuthor[];
}

interface CommentSectionProps {
  blogId: string;
  comments?: CommentWithAuthor[];
  commentsLoading: boolean;
}

// Completely isolated comment input component
const CommentInput = React.memo(({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder, 
  disabled,
  id
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled: boolean;
  id: string;
}) => {
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleSubmit = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <>
      <textarea
        id={id}
        key={id}
        placeholder={placeholder}
        value={value}
        onChange={handleTextareaChange}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mb-4"
        data-testid={`input-${id}`}
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        data-testid={`button-submit-${id}`}
      >
        <Send className="h-4 w-4 mr-1" />
        {id.includes('reply') ? 'Reply' : 'Post Comment'}
      </Button>
    </>
  );
});

// Individual comment component
const Comment = React.memo(({ 
  comment, 
  isReply = false, 
  onReply 
}: { 
  comment: CommentWithAuthor; 
  isReply?: boolean;
  onReply: (commentId: string, content: string) => void;
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  
  const handleReplySubmit = useCallback(() => {
    if (replyContent.trim()) {
      const commentId = comment.id || comment._id || '';
      onReply(commentId, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  }, [comment.id, comment._id, replyContent, onReply]);

  const handleReplyContentChange = useCallback((content: string) => {
    setReplyContent(content);
  }, []);

  const toggleReplyForm = useCallback(() => {
    setShowReplyForm(!showReplyForm);
    setReplyContent("");
  }, [showReplyForm]);

  return (
    <div className={`comment-item ${isReply ? 'ml-8 mt-4' : 'mb-6'}`} data-comment-id={comment.id || comment._id || 'anonymous'}>
      <Card className={isReply ? 'border-l-4 border-l-blue-200 bg-blue-50/30' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className={isReply ? 'h-6 w-6' : 'h-8 w-8'}>
              {comment.author ? (
                <>
                  <AvatarImage src={comment.author.profileImage || undefined} />
                  <AvatarFallback className={isReply ? 'text-xs' : ''}>
                    {comment.author.firstName[0]}{comment.author.lastName[0]}
                  </AvatarFallback>
                </>
              ) : (
                <AvatarFallback className={isReply ? 'text-xs' : ''}>
                  <User className={isReply ? 'h-3 w-3' : 'h-4 w-4'} />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {isReply && (
                  <span className="text-xs text-blue-600 font-medium">↳ Reply:</span>
                )}
                <span className={`font-medium text-gray-900 ${isReply ? 'text-sm' : ''}`}>
                  {comment.author ? 
                    `${comment.author.firstName} ${comment.author.lastName}` : 
                    'Anonymous'
                  }
                </span>
                <span className={`text-gray-500 ${isReply ? 'text-xs' : 'text-sm'}`}>
                  {format(new Date(comment.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
                </span>
              </div>
              <p className={`text-gray-700 mb-2 ${isReply ? 'text-sm' : ''}`}>{comment.content}</p>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleReplyForm}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Reply Form - Completely separate from comment card */}
      {showReplyForm && !isReply && (
        <div className="mt-4 ml-11">
          <Card>
            <CardContent className="p-4">
              <CommentInput
                id={`reply-${comment.id || comment._id || 'anonymous'}`}
                value={replyContent}
                onChange={handleReplyContentChange}
                onSubmit={handleReplySubmit}
                placeholder="Write a reply..."
                disabled={false}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleReplyForm}
                className="ml-2"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-section">
          {comment.replies.map((reply, index) => (
            <Comment 
              key={reply.id || reply._id || `reply-${index}`}
              comment={reply} 
              isReply={true}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  blogId, 
  comments, 
  commentsLoading 
}) => {
  const [mainCommentContent, setMainCommentContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: string; authorId?: string; authorName?: string; authorEmail?: string }) => {
      await apiRequest("POST", `/api/blogs/${blogId}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", blogId, "comments"] });
      setMainCommentContent("");
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

  const handleMainComment = useCallback(() => {
    if (!mainCommentContent.trim()) return;
    
    const commentData: any = { content: mainCommentContent };
    if (user) {
      commentData.authorId = user._id;
    }
    
    commentMutation.mutate(commentData);
  }, [mainCommentContent, user, commentMutation]);

  const handleReply = useCallback((parentId: string, content: string) => {
    const replyData: any = { 
      content: content, 
      parentId: parentId 
    };
    if (user) {
      replyData.authorId = user._id;
    }
    
    commentMutation.mutate(replyData);
  }, [user, commentMutation]);

  const handleMainCommentChange = useCallback((content: string) => {
    setMainCommentContent(content);
  }, []);

  return (
    <div className="comment-section mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments?.length || 0})
      </h2>
      
      {/* Main Comment Form */}
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
              <CommentInput
                id="main-comment"
                value={mainCommentContent}
                onChange={handleMainCommentChange}
                onSubmit={handleMainComment}
                placeholder="Share your thoughts..."
                disabled={commentMutation.isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Comments List */}
      {commentsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={`skeleton-${i}`} className="animate-pulse">
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
        <div className="comments-list">
          {comments.map((comment, index) => (
            <Comment 
              key={comment.id || comment._id || `comment-${index}`}
              comment={comment} 
              onReply={handleReply}
            />
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
  );
};