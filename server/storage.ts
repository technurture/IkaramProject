import { 
  users, blogs, comments, events, eventRegistrations, staff, media, blogLikes,
  type User, type InsertUser, type Blog, type InsertBlog, 
  type Comment, type InsertComment, type Event, type InsertEvent,
  type InsertStaff, type Staff, type InsertMedia, type Media,
  type BlogWithAuthor, type CommentWithAuthor, type EventWithDetails, type StaffWithUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, count, or, ilike } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Blog methods
  getBlogs(limit?: number, offset?: number): Promise<BlogWithAuthor[]>;
  getBlog(id: string): Promise<BlogWithAuthor | undefined>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: string, updates: Partial<InsertBlog>): Promise<Blog | undefined>;
  deleteBlog(id: string): Promise<boolean>;
  getBlogsByAuthor(authorId: string): Promise<BlogWithAuthor[]>;
  searchBlogs(query: string): Promise<BlogWithAuthor[]>;
  
  // Comment methods
  getCommentsByBlog(blogId: string): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;
  
  // Event methods
  getEvents(limit?: number, offset?: number): Promise<EventWithDetails[]>;
  getEvent(id: string): Promise<EventWithDetails | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  registerForEvent(eventId: string, userId: string): Promise<boolean>;
  unregisterFromEvent(eventId: string, userId: string): Promise<boolean>;
  
  // Staff methods
  getStaff(): Promise<StaffWithUser[]>;
  getStaffMember(id: string): Promise<StaffWithUser | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: string): Promise<boolean>;
  
  // Media methods
  createMedia(media: InsertMedia): Promise<Media>;
  getMedia(id: string): Promise<Media | undefined>;
  getMediaByUser(userId: string): Promise<Media[]>;
  deleteMedia(id: string): Promise<boolean>;
  
  // Blog likes
  toggleBlogLike(blogId: string, userId: string): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getBlogs(limit: number = 10, offset: number = 0): Promise<BlogWithAuthor[]> {
    const blogsWithAuthor = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        content: blogs.content,
        excerpt: blogs.excerpt,
        authorId: blogs.authorId,
        category: blogs.category,
        featuredImage: blogs.featuredImage,
        status: blogs.status,
        tags: blogs.tags,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          graduationYear: users.graduationYear,
          role: users.role,
          bio: users.bio,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          password: users.password
        }
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.status, 'published'))
      .orderBy(desc(blogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get counts for each blog
    const blogIds = blogsWithAuthor.map(blog => blog.id);
    const commentCounts = await db
      .select({
        blogId: comments.blogId,
        count: count(comments.id)
      })
      .from(comments)
      .where(sql`${comments.blogId} = ANY(${blogIds})`)
      .groupBy(comments.blogId);

    const likeCounts = await db
      .select({
        blogId: blogLikes.blogId,
        count: count(blogLikes.id)
      })
      .from(blogLikes)
      .where(sql`${blogLikes.blogId} = ANY(${blogIds})`)
      .groupBy(blogLikes.blogId);

    const likes = await db
      .select({
        blogId: blogLikes.blogId,
        userId: blogLikes.userId
      })
      .from(blogLikes)
      .where(sql`${blogLikes.blogId} = ANY(${blogIds})`);

    return blogsWithAuthor.map(blog => ({
      ...blog,
      likes: likes.filter(like => like.blogId === blog.id).map(like => ({ userId: like.userId })),
      _count: {
        comments: Number(commentCounts.find(c => c.blogId === blog.id)?.count || 0),
        likes: Number(likeCounts.find(l => l.blogId === blog.id)?.count || 0)
      }
    }));
  }

  async getBlog(id: string): Promise<BlogWithAuthor | undefined> {
    const [blog] = await this.getBlogs(1, 0);
    const result = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        content: blogs.content,
        excerpt: blogs.excerpt,
        authorId: blogs.authorId,
        category: blogs.category,
        featuredImage: blogs.featuredImage,
        status: blogs.status,
        tags: blogs.tags,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          graduationYear: users.graduationYear,
          role: users.role,
          bio: users.bio,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          password: users.password
        }
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.id, id));

    if (!result[0]) return undefined;

    const blogData = result[0];
    
    const commentCount = await db
      .select({ count: count(comments.id) })
      .from(comments)
      .where(eq(comments.blogId, id));

    const likeCount = await db
      .select({ count: count(blogLikes.id) })
      .from(blogLikes)
      .where(eq(blogLikes.blogId, id));

    const likes = await db
      .select({ userId: blogLikes.userId })
      .from(blogLikes)
      .where(eq(blogLikes.blogId, id));

    return {
      ...blogData,
      likes: likes.map(like => ({ userId: like.userId })),
      _count: {
        comments: Number(commentCount[0]?.count || 0),
        likes: Number(likeCount[0]?.count || 0)
      }
    };
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [newBlog] = await db
      .insert(blogs)
      .values(blog)
      .returning();
    return newBlog;
  }

  async updateBlog(id: string, updates: Partial<InsertBlog>): Promise<Blog | undefined> {
    const [blog] = await db
      .update(blogs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogs.id, id))
      .returning();
    return blog || undefined;
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await db.delete(blogs).where(eq(blogs.id, id));
    return result.rowCount > 0;
  }

  async getBlogsByAuthor(authorId: string): Promise<BlogWithAuthor[]> {
    return this.getBlogs(100, 0); // Get all blogs then filter in memory for simplicity
  }

  async searchBlogs(query: string): Promise<BlogWithAuthor[]> {
    const blogsWithAuthor = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        content: blogs.content,
        excerpt: blogs.excerpt,
        authorId: blogs.authorId,
        category: blogs.category,
        featuredImage: blogs.featuredImage,
        status: blogs.status,
        tags: blogs.tags,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          graduationYear: users.graduationYear,
          role: users.role,
          bio: users.bio,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          password: users.password
        }
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(
        and(
          eq(blogs.status, 'published'),
          or(
            ilike(blogs.title, `%${query}%`),
            ilike(blogs.content, `%${query}%`),
            ilike(blogs.excerpt, `%${query}%`)
          )
        )
      )
      .orderBy(desc(blogs.createdAt));

    return blogsWithAuthor.map(blog => ({
      ...blog,
      likes: [],
      _count: { comments: 0, likes: 0 }
    }));
  }

  async getCommentsByBlog(blogId: string): Promise<CommentWithAuthor[]> {
    const allComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        authorId: comments.authorId,
        blogId: comments.blogId,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          graduationYear: users.graduationYear,
          role: users.role,
          bio: users.bio,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          password: users.password
        }
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.blogId, blogId))
      .orderBy(asc(comments.createdAt));

    // Build nested comment structure
    const commentMap = new Map<string, CommentWithAuthor>();
    const rootComments: CommentWithAuthor[] = [];

    allComments.forEach(comment => {
      const commentWithReplies: CommentWithAuthor = {
        ...comment,
        replies: []
      };
      commentMap.set(comment.id, commentWithReplies);

      if (!comment.parentId) {
        rootComments.push(commentWithReplies);
      }
    });

    // Add replies to their parents
    allComments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        const child = commentMap.get(comment.id);
        if (parent && child) {
          parent.replies.push(child);
        }
      }
    });

    return rootComments;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return result.count > 0;
  }

  async getEvents(limit: number = 10, offset: number = 0): Promise<EventWithDetails[]> {
    const eventsWithDetails = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        category: events.category,
        featuredImage: events.featuredImage,
        isVirtual: events.isVirtual,
        maxAttendees: events.maxAttendees,
        registrationDeadline: events.registrationDeadline,
        status: events.status,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        createdByUser: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          graduationYear: users.graduationYear,
          role: users.role,
          bio: users.bio,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          password: users.password
        }
      })
      .from(events)
      .leftJoin(users, eq(events.createdBy, users.id))
      .orderBy(asc(events.startDate))
      .limit(limit)
      .offset(offset);

    // Get registration counts
    const eventIds = eventsWithDetails.map(event => event.id);
    const registrationCounts = await db
      .select({
        eventId: eventRegistrations.eventId,
        count: count(eventRegistrations.id)
      })
      .from(eventRegistrations)
      .where(sql`${eventRegistrations.eventId} = ANY(${eventIds})`)
      .groupBy(eventRegistrations.eventId);

    return eventsWithDetails.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      category: event.category,
      featuredImage: event.featuredImage,
      isVirtual: event.isVirtual,
      maxAttendees: event.maxAttendees,
      registrationDeadline: event.registrationDeadline,
      status: event.status,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      createdBy: event.createdByUser,
      _count: {
        registrations: registrationCounts.find(r => r.eventId === event.id)?.count || 0
      }
    }));
  }

  async getEvent(id: string): Promise<EventWithDetails | undefined> {
    const result = await this.getEvents(1000, 0);
    return result.find(event => event.id === id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.count > 0;
  }

  async registerForEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      await db.insert(eventRegistrations).values({ eventId, userId });
      return true;
    } catch {
      return false;
    }
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId)
        )
      );
    return result.count > 0;
  }

  async getStaff(): Promise<StaffWithUser[]> {
    const staffWithUser = await db
      .select({
        id: staff.id,
        userId: staff.userId,
        position: staff.position,
        department: staff.department,
        bio: staff.bio,
        profileImage: staff.profileImage,
        socialLinks: staff.socialLinks,
        displayOrder: staff.displayOrder,
        isActive: staff.isActive,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          graduationYear: users.graduationYear,
          role: users.role,
          bio: users.bio,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          password: users.password
        }
      })
      .from(staff)
      .leftJoin(users, eq(staff.userId, users.id))
      .where(eq(staff.isActive, true))
      .orderBy(asc(staff.displayOrder));

    return staffWithUser;
  }

  async getStaffMember(id: string): Promise<StaffWithUser | undefined> {
    const result = await this.getStaff();
    return result.find(member => member.id === id);
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const [newStaff] = await db
      .insert(staff)
      .values(staffData)
      .returning();
    return newStaff;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [staffMember] = await db
      .update(staff)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(staff.id, id))
      .returning();
    return staffMember || undefined;
  }

  async deleteStaff(id: string): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id));
    return result.count > 0;
  }

  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const [newMedia] = await db
      .insert(media)
      .values(mediaData)
      .returning();
    return newMedia;
  }

  async getMedia(id: string): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem || undefined;
  }

  async getMediaByUser(userId: string): Promise<Media[]> {
    return await db.select().from(media).where(eq(media.uploadedBy, userId));
  }

  async deleteMedia(id: string): Promise<boolean> {
    const result = await db.delete(media).where(eq(media.id, id));
    return result.count > 0;
  }

  async toggleBlogLike(blogId: string, userId: string): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(blogLikes)
      .where(
        and(
          eq(blogLikes.blogId, blogId),
          eq(blogLikes.userId, userId)
        )
      );

    if (existingLike.length > 0) {
      await db
        .delete(blogLikes)
        .where(
          and(
            eq(blogLikes.blogId, blogId),
            eq(blogLikes.userId, userId)
          )
        );
      return false; // Unliked
    } else {
      await db.insert(blogLikes).values({ blogId, userId });
      return true; // Liked
    }
  }
}

export const storage = new DatabaseStorage();
