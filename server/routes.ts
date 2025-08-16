import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { upload, uploadToCloudinary, deleteFromCloudinary } from "./cloudinary";
import { insertBlogSchema, insertCommentSchema, insertEventSchema, insertStaffSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Helper function to require authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Helper function to require admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Blog routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;

      let blogs;
      if (search) {
        blogs = await storage.searchBlogs(search);
      } else {
        blogs = await storage.getBlogs(limit, offset);
      }
      
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog" });
    }
  });

  app.post("/api/blogs", requireAuth, async (req, res) => {
    try {
      const blogData = insertBlogSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      
      const blog = await storage.createBlog(blogData);
      res.status(201).json(blog);
    } catch (error) {
      res.status(400).json({ message: "Invalid blog data" });
    }
  });

  app.put("/api/blogs/:id", requireAuth, async (req, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // Only allow author or admin to update
      if (blog.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this blog" });
      }

      const updates = insertBlogSchema.partial().parse(req.body);
      const updatedBlog = await storage.updateBlog(req.params.id, updates);
      
      res.json(updatedBlog);
    } catch (error) {
      res.status(400).json({ message: "Failed to update blog" });
    }
  });

  app.delete("/api/blogs/:id", requireAuth, async (req, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // Only allow author or admin to delete
      if (blog.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this blog" });
      }

      const deleted = await storage.deleteBlog(req.params.id);
      if (deleted) {
        res.json({ message: "Blog deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete blog" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog" });
    }
  });

  // Blog likes
  app.post("/api/blogs/:id/like", requireAuth, async (req, res) => {
    try {
      const liked = await storage.toggleBlogLike(req.params.id, req.user.id);
      res.json({ liked });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Comment routes
  app.get("/api/blogs/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByBlog(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/blogs/:id/comments", requireAuth, async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        authorId: req.user.id,
        blogId: req.params.id
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      // In a real app, you'd check if user owns the comment or is admin
      const deleted = await storage.deleteComment(req.params.id);
      if (deleted) {
        res.json({ message: "Comment deleted successfully" });
      } else {
        res.status(404).json({ message: "Comment not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const events = await storage.getEvents(limit, offset);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", requireAdmin, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.put("/api/events/:id", requireAdmin, async (req, res) => {
    try {
      const updates = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(req.params.id, updates);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      res.status(400).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (deleted) {
        res.json({ message: "Event deleted successfully" });
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Event registration
  app.post("/api/events/:id/register", requireAuth, async (req, res) => {
    try {
      const registered = await storage.registerForEvent(req.params.id, req.user.id);
      if (registered) {
        res.json({ message: "Successfully registered for event" });
      } else {
        res.status(400).json({ message: "Registration failed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.delete("/api/events/:id/register", requireAuth, async (req, res) => {
    try {
      const unregistered = await storage.unregisterFromEvent(req.params.id, req.user.id);
      if (unregistered) {
        res.json({ message: "Successfully unregistered from event" });
      } else {
        res.status(400).json({ message: "Unregistration failed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Unregistration failed" });
    }
  });

  // Staff routes
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const staffMember = await storage.getStaffMember(req.params.id);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  app.post("/api/staff", requireAdmin, async (req, res) => {
    try {
      const staffData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      res.status(400).json({ message: "Invalid staff data" });
    }
  });

  app.put("/api/staff/:id", requireAdmin, async (req, res) => {
    try {
      const updates = insertStaffSchema.partial().parse(req.body);
      const updatedStaff = await storage.updateStaff(req.params.id, updates);
      
      if (!updatedStaff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(updatedStaff);
    } catch (error) {
      res.status(400).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/staff/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteStaff(req.params.id);
      if (deleted) {
        res.json({ message: "Staff member deleted successfully" });
      } else {
        res.status(404).json({ message: "Staff member not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Media upload routes
  app.post("/api/upload", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const cloudinaryResult = await uploadToCloudinary(
        req.file.buffer,
        `${Date.now()}-${req.file.originalname}`,
        'alumni-platform'
      );

      const media = await storage.createMedia({
        filename: cloudinaryResult.public_id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        cloudinaryPublicId: cloudinaryResult.public_id,
        cloudinaryUrl: cloudinaryResult.secure_url,
        uploadedBy: req.user.id,
        isDownloadable: req.body.isDownloadable === 'true'
      });

      res.status(201).json({
        id: media.id,
        url: media.cloudinaryUrl,
        publicId: media.cloudinaryPublicId,
        originalName: media.originalName
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const media = await storage.getMedia(req.params.id);
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.delete("/api/media/:id", requireAuth, async (req, res) => {
    try {
      const media = await storage.getMedia(req.params.id);
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      // Only allow uploader or admin to delete
      if (media.uploadedBy !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this media" });
      }

      // Delete from Cloudinary
      await deleteFromCloudinary(media.cloudinaryPublicId);
      
      // Delete from database
      const deleted = await storage.deleteMedia(req.params.id);
      
      if (deleted) {
        res.json({ message: "Media deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete media" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // User profile routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
