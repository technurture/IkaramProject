import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// User Schema and Interface
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  graduationYear?: number;
  role: 'user' | 'admin' | 'super_admin';
  profileImage?: string;
  bio?: string;
  isActive: boolean;
  isApproved: boolean; // For admin approval by super admin
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  graduationYear: { type: Number },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  profileImage: { type: String },
  bio: { type: String },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false }, // All new admin accounts need super admin approval
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Blog Schema and Interface
export interface IBlog extends Document {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  category: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  authorId: { type: String, required: true, ref: 'User' },
  category: { type: String, required: true },
  featuredImage: { type: String },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  tags: [{ type: String }],
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Comment Schema and Interface
export interface IComment extends Document {
  _id: string;
  content: string;
  authorId?: string; // Optional for anonymous comments
  blogId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: { type: String, required: true },
  authorId: { type: String, ref: 'User' }, // Optional for anonymous comments
  blogId: { type: String, required: true, ref: 'Blog' },
  parentId: { type: String, ref: 'Comment' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Event Schema and Interface
export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  category: string;
  featuredImage?: string;
  isVirtual: boolean;
  maxAttendees?: number;
  registrationDeadline?: Date;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true },
  category: { type: String, required: true },
  featuredImage: { type: String },
  isVirtual: { type: Boolean, default: false },
  maxAttendees: { type: Number },
  registrationDeadline: { type: Date },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  createdBy: { type: String, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Event Registration Schema and Interface
export interface IEventRegistration extends Document {
  _id: string;
  eventId: string;
  userId: string;
  registeredAt: Date;
}

const eventRegistrationSchema = new Schema<IEventRegistration>({
  eventId: { type: String, required: true, ref: 'Event' },
  userId: { type: String, required: true, ref: 'User' },
  registeredAt: { type: Date, default: Date.now }
});

// Staff Schema and Interface
export interface IStaff extends Document {
  _id: string;
  userId: string;
  position: string;
  department?: string;
  bio?: string;
  phoneNumber?: string;
  officeLocation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>({
  userId: { type: String, required: true, ref: 'User' },
  position: { type: String, required: true },
  department: { type: String },
  bio: { type: String },
  phoneNumber: { type: String },
  officeLocation: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Media Schema and Interface
export interface IMedia extends Document {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  cloudinaryId?: string;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  uploadedBy: string;
  createdAt: Date;
}

const mediaSchema = new Schema<IMedia>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  cloudinaryId: { type: String },
  cloudinaryPublicId: { type: String },
  cloudinaryUrl: { type: String },
  uploadedBy: { type: String, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Blog Likes Schema and Interface
export interface IBlogLike extends Document {
  _id: string;
  blogId: string;
  userId: string;
  createdAt: Date;
}

const blogLikeSchema = new Schema<IBlogLike>({
  blogId: { type: String, required: true, ref: 'Blog' },
  userId: { type: String, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Compound indexes for blog likes
blogLikeSchema.index({ blogId: 1, userId: 1 }, { unique: true });

// Export models
export const User = mongoose.model<IUser>('User', userSchema);
export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
export const Comment = mongoose.model<IComment>('Comment', commentSchema);
export const Event = mongoose.model<IEvent>('Event', eventSchema);
export const EventRegistration = mongoose.model<IEventRegistration>('EventRegistration', eventRegistrationSchema);
export const Staff = mongoose.model<IStaff>('Staff', staffSchema);
export const Media = mongoose.model<IMedia>('Media', mediaSchema);
export const BlogLike = mongoose.model<IBlogLike>('BlogLike', blogLikeSchema);

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  graduationYear: z.number().optional(),
  role: z.enum(['user', 'admin', 'super_admin']).default('user'),
  profileImage: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().default(true),
  isApproved: z.boolean().default(true)
});

export const insertBlogSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().min(1).max(500),
  authorId: z.string(),
  category: z.string().min(1),
  featuredImage: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([])
});

export const insertCommentSchema = z.object({
  content: z.string().min(1),
  authorId: z.string().optional(), // Optional for anonymous comments
  blogId: z.string(),
  parentId: z.string().optional()
});

export const insertEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  startDate: z.union([z.date(), z.string()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
  endDate: z.union([z.date(), z.string()]).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
  location: z.string().min(1),
  category: z.string().min(1),
  featuredImage: z.string().optional(),
  isVirtual: z.boolean().default(false),
  maxAttendees: z.number().positive().optional(),
  registrationDeadline: z.union([z.date(), z.string()]).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
  createdBy: z.string()
});

export const insertStaffSchema = z.object({
  userId: z.string(),
  position: z.string().min(1),
  department: z.string().optional(),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  officeLocation: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const insertMediaSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  path: z.string(),
  cloudinaryId: z.string().optional(),
  cloudinaryPublicId: z.string().optional(),
  cloudinaryUrl: z.string().optional(),
  uploadedBy: z.string()
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

// Extended types for API responses
export type UserWithProfile = IUser;
export type BlogWithAuthor = any;
export type CommentWithAuthor = any;
export type EventWithDetails = any;
export type StaffWithUser = any;