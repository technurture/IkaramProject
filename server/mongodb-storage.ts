import {
  User, Blog, Comment, Event, EventRegistration, Staff, Media, BlogLike,
  type IUser, type IBlog, type IComment, type IEvent, type IStaff, type IMedia,
  type InsertUser, type InsertBlog, type InsertComment, type InsertEvent, 
  type InsertStaff, type InsertMedia,
  type BlogWithAuthor, type CommentWithAuthor, type EventWithDetails, type StaffWithUser
} from "@shared/mongodb-schema";
import session from "express-session";
import MongoStore from "connect-mongo";

export interface IMongoStorage {
  // User methods
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(user: InsertUser): Promise<IUser>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<IUser | null>;
  getAllAdmins(): Promise<IUser[]>;
  updateUserApproval(id: string, isApproved: boolean): Promise<IUser | null>;
  
  // Blog methods
  getBlogs(limit?: number, offset?: number): Promise<BlogWithAuthor[]>;
  getBlog(id: string): Promise<BlogWithAuthor | null>;
  createBlog(blog: InsertBlog): Promise<IBlog>;
  updateBlog(id: string, updates: Partial<InsertBlog>): Promise<IBlog | null>;
  deleteBlog(id: string): Promise<boolean>;
  getBlogsByAuthor(authorId: string): Promise<BlogWithAuthor[]>;
  searchBlogs(query: string): Promise<BlogWithAuthor[]>;
  
  // Comment methods
  getCommentsByBlog(blogId: string): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment): Promise<IComment>;
  deleteComment(id: string): Promise<boolean>;
  
  // Event methods
  getEvents(limit?: number, offset?: number): Promise<EventWithDetails[]>;
  getEvent(id: string): Promise<EventWithDetails | null>;
  createEvent(event: InsertEvent): Promise<IEvent>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<IEvent | null>;
  deleteEvent(id: string): Promise<boolean>;
  registerForEvent(eventId: string, userId: string): Promise<boolean>;
  unregisterFromEvent(eventId: string, userId: string): Promise<boolean>;
  
  // Staff methods
  getStaff(): Promise<StaffWithUser[]>;
  getStaffMember(id: string): Promise<StaffWithUser | null>;
  createStaff(staff: InsertStaff): Promise<IStaff>;
  updateStaff(id: string, updates: Partial<InsertStaff>): Promise<IStaff | null>;
  deleteStaff(id: string): Promise<boolean>;
  
  // Media methods
  createMedia(media: InsertMedia): Promise<IMedia>;
  getMedia(id: string): Promise<IMedia | null>;
  getMediaByUser(userId: string): Promise<IMedia[]>;
  deleteMedia(id: string): Promise<boolean>;
  
  // Blog likes
  toggleBlogLike(blogId: string, userId: string): Promise<boolean>;
  
  sessionStore: any;
}

export class MongoDBStorage implements IMongoStorage {
  sessionStore: any;

  constructor() {
    const mongoUrl = process.env.MONGODB_URL || "mongodb+srv://technurture619:EljLBiQMpurchBD1@ikaram.13ysrj8.mongodb.net/?retryWrites=true&w=majority&appName=Ikaram";
    
    this.sessionStore = MongoStore.create({
      mongoUrl,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60 // 1 day
    });
  }

  // User methods
  async getUser(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async createUser(user: InsertUser): Promise<IUser> {
    // If creating an admin (non-super admin), set isApproved to false
    if (user.role === 'admin') {
      user.isApproved = false;
    }
    
    const newUser = new User(user);
    return await newUser.save();
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
  }

  async getAllAdmins(): Promise<IUser[]> {
    return await User.find({ role: 'admin' }).sort({ createdAt: -1 });
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { isApproved, updatedAt: new Date() }, { new: true });
  }

  // Blog methods
  async getBlogs(limit = 50, offset = 0): Promise<BlogWithAuthor[]> {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('authorId', 'firstName lastName username profileImage');
    
    return blogs.map(blog => ({
      ...blog.toObject(),
      author: blog.authorId as any
    }));
  }

  async getBlog(id: string): Promise<BlogWithAuthor | null> {
    const blog = await Blog.findById(id)
      .populate('authorId', 'firstName lastName username profileImage');
    
    if (!blog) return null;
    
    return {
      ...blog.toObject(),
      author: blog.authorId as any
    };
  }

  async createBlog(blog: InsertBlog): Promise<IBlog> {
    const newBlog = new Blog(blog);
    return await newBlog.save();
  }

  async updateBlog(id: string, updates: Partial<InsertBlog>): Promise<IBlog | null> {
    return await Blog.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await Blog.findByIdAndDelete(id);
    return !!result;
  }

  async getBlogsByAuthor(authorId: string): Promise<BlogWithAuthor[]> {
    const blogs = await Blog.find({ authorId })
      .sort({ createdAt: -1 })
      .populate('authorId', 'firstName lastName username profileImage');
    
    return blogs.map(blog => ({
      ...blog.toObject(),
      author: blog.authorId as any
    }));
  }

  async searchBlogs(query: string): Promise<BlogWithAuthor[]> {
    const blogs = await Blog.find({
      $and: [
        { status: 'published' },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('authorId', 'firstName lastName username profileImage');
    
    return blogs.map(blog => ({
      ...blog.toObject(),
      author: blog.authorId as any
    }));
  }

  // Comment methods
  async getCommentsByBlog(blogId: string): Promise<CommentWithAuthor[]> {
    const comments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .populate('authorId', 'firstName lastName username profileImage');
    
    return comments.map(comment => ({
      ...comment.toObject(),
      author: comment.authorId as any
    }));
  }

  async createComment(comment: InsertComment): Promise<IComment> {
    const newComment = new Comment(comment);
    return await newComment.save();
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await Comment.findByIdAndDelete(id);
    return !!result;
  }

  // Event methods
  async getEvents(limit = 50, offset = 0): Promise<EventWithDetails[]> {
    const events = await Event.find()
      .sort({ startDate: 1 })
      .skip(offset)
      .limit(limit)
      .populate('createdBy', 'firstName lastName username');
    
    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await EventRegistration.countDocuments({ eventId: event._id });
        return {
          ...event.toObject(),
          creator: event.createdBy as any,
          registrationCount
        };
      })
    );
    
    return eventsWithDetails;
  }

  async getEvent(id: string): Promise<EventWithDetails | null> {
    const event = await Event.findById(id)
      .populate('createdBy', 'firstName lastName username');
    
    if (!event) return null;
    
    const registrationCount = await EventRegistration.countDocuments({ eventId: event._id });
    
    return {
      ...event.toObject(),
      creator: event.createdBy as any,
      registrationCount
    };
  }

  async createEvent(event: InsertEvent): Promise<IEvent> {
    const newEvent = new Event(event);
    return await newEvent.save();
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await Event.findByIdAndDelete(id);
    return !!result;
  }

  async registerForEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const registration = new EventRegistration({ eventId, userId });
      await registration.save();
      return true;
    } catch (error) {
      return false; // Already registered or other error
    }
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<boolean> {
    const result = await EventRegistration.findOneAndDelete({ eventId, userId });
    return !!result;
  }

  // Staff methods
  async getStaff(): Promise<StaffWithUser[]> {
    const staff = await Staff.find({ isActive: true })
      .populate('userId', 'firstName lastName username email profileImage');
    
    return staff.map(staffMember => ({
      ...staffMember.toObject(),
      user: staffMember.userId as any
    }));
  }

  async getStaffMember(id: string): Promise<StaffWithUser | null> {
    const staffMember = await Staff.findById(id)
      .populate('userId', 'firstName lastName username email profileImage');
    
    if (!staffMember) return null;
    
    return {
      ...staffMember.toObject(),
      user: staffMember.userId as any
    };
  }

  async createStaff(staff: InsertStaff): Promise<IStaff> {
    const newStaff = new Staff(staff);
    return await newStaff.save();
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<IStaff | null> {
    return await Staff.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
  }

  async deleteStaff(id: string): Promise<boolean> {
    const result = await Staff.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() });
    return !!result;
  }

  // Media methods
  async createMedia(media: InsertMedia): Promise<IMedia> {
    const newMedia = new Media(media);
    return await newMedia.save();
  }

  async getMedia(id: string): Promise<IMedia | null> {
    return await Media.findById(id);
  }

  async getMediaByUser(userId: string): Promise<IMedia[]> {
    return await Media.find({ uploadedBy: userId }).sort({ createdAt: -1 });
  }

  async deleteMedia(id: string): Promise<boolean> {
    const result = await Media.findByIdAndDelete(id);
    return !!result;
  }

  // Blog likes
  async toggleBlogLike(blogId: string, userId: string): Promise<boolean> {
    const existingLike = await BlogLike.findOne({ blogId, userId });
    
    if (existingLike) {
      await BlogLike.findByIdAndDelete(existingLike._id);
      return false; // Unliked
    } else {
      const newLike = new BlogLike({ blogId, userId });
      await newLike.save();
      return true; // Liked
    }
  }
}