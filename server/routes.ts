import type { Express } from "express";
import { createServer, type Server } from "http";
import type { IMongoStorage } from "./mongodb-storage";
import { setupAuth } from "./auth";
import { upload, uploadToCloudinary, deleteFromCloudinary } from "./cloudinary-config";
import { User, insertBlogSchema, insertCommentSchema, insertEventSchema, insertStaffSchema } from "@shared/mongodb-schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}.${buf.toString("hex")}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [salt, hashed] = stored.split(".");
    if (!salt || !hashed) {
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    if (hashedBuf.length !== suppliedBuf.length) {
      return false;
    }
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

export async function registerRoutes(app: Express, storage: IMongoStorage): Promise<Server> {
  // Setup authentication routes with storage
  setupAuth(app, storage);

  // Helper function to require authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if user is approved
    if (!req.user.isApproved) {
      return res.status(403).json({ message: "Account pending approval by super admin" });
    }
    
    next();
  };

  // Helper function to require admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Helper function to require super admin role
  const requireSuperAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ message: "Super admin access required" });
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
      console.log('Received blog data:', req.body);
      
      // Filter out extra fields and prepare data for validation
      const { startDate, attachments, ...filteredData } = req.body;
      
      const blogData = insertBlogSchema.parse({
        ...filteredData,
        authorId: req.user!._id.toString(),
        attachments: attachments || []
      });
      
      console.log('Validated blog data:', blogData);
      
      const blog = await storage.createBlog(blogData);
      res.status(201).json(blog);
    } catch (error) {
      console.error('Blog creation error:', error);
      res.status(400).json({ message: "Invalid blog data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/blogs/:id", requireAuth, async (req, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // Only allow author or admin to update
      if (blog.authorId !== req.user!._id && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
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
      if (blog.authorId !== req.user!._id && req.user!.role !== 'admin') {
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
  app.post("/api/blogs/:id/like", async (req, res) => {
    try {
      // For anonymous liking, we'll use IP address as identifier or just increment count
      const userId = req.user?._id || req.ip || 'anonymous';
      const liked = await storage.toggleBlogLike(req.params.id, userId);
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

  app.post("/api/blogs/:id/comments", async (req, res) => {
    try {
      // Allow anonymous commenting
      const commentData = insertCommentSchema.parse({
        ...req.body,
        authorId: req.user?._id || undefined, // Optional for anonymous comments
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
        createdBy: String(req.user!._id)
      });
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error('Event creation error:', error);
      res.status(400).json({ message: "Invalid event data", details: error });
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
      const registered = await storage.registerForEvent(req.params.id, req.user!._id);
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
      const unregistered = await storage.unregisterFromEvent(req.params.id, req.user!._id);
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
      const staffData = req.body;
      let userId = staffData.existingUserId;
      
      // If no existing user selected, create a new user first
      if (!userId && staffData.firstName && staffData.lastName && staffData.email && staffData.username) {
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(staffData.email);
        if (existingUser) {
          return res.status(400).json({ message: "User with this email already exists" });
        }

        // Generate a default password for staff accounts
        const defaultPassword = `Staff${Math.random().toString(36).slice(-8)}!`;
        const hashedPassword = await hashPassword(defaultPassword);
        
        // Create user with admin role if makeAdmin is true
        const userRole = staffData.makeAdmin ? 'admin' : 'user';
        const newUser = await storage.createUser({
          firstName: staffData.firstName,
          lastName: staffData.lastName,
          email: staffData.email,
          username: staffData.username,
          password: hashedPassword,
          role: userRole,
          isActive: true,
          isApproved: true
        });
        
        userId = newUser._id.toString();
        
        // Store the default password to return to admin
        req.body.defaultPassword = defaultPassword;
      }
      
      if (!userId) {
        return res.status(400).json({ message: "Either select an existing user or provide new user details" });
      }
      
      const staff = await storage.createStaff({
        userId,
        position: staffData.position,
        department: staffData.department,
        bio: staffData.bio,
        phoneNumber: staffData.phoneNumber,
        officeLocation: staffData.officeLocation,
        isActive: true
      });
      
      // Include default password in response if a new user was created
      const response = {
        staff,
        ...(req.body.defaultPassword && { 
          defaultPassword: req.body.defaultPassword,
          message: `Staff member created successfully. Default password: ${req.body.defaultPassword}` 
        })
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Staff creation error:", error);
      res.status(500).json({ message: "Failed to create staff member" });
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

  // Single media upload route
  app.post("/api/media/upload", requireAuth, upload.single('file'), async (req, res) => {
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
        uploadedBy: req.user!._id,
        path: cloudinaryResult.secure_url
      });

      res.status(201).json({
        id: media._id,
        url: cloudinaryResult.secure_url,
        secure_url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Multiple media upload route
  app.post("/api/media/upload-multiple", requireAuth, upload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }

      const uploadResults = [];
      
      for (const file of files) {
        try {
          const cloudinaryResult = await uploadToCloudinary(
            file.buffer,
            `${Date.now()}-${file.originalname}`,
            'alumni-platform'
          );

          const media = await storage.createMedia({
            filename: cloudinaryResult.public_id,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            cloudinaryPublicId: cloudinaryResult.public_id,
            cloudinaryUrl: cloudinaryResult.secure_url,
            uploadedBy: req.user!._id,
            path: cloudinaryResult.secure_url
          });

          uploadResults.push({
            id: media._id,
            url: cloudinaryResult.secure_url,
            secure_url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id,
            filename: file.originalname,
            size: file.size,
            type: file.mimetype,
            success: true
          });
        } catch (fileError) {
          console.error(`Upload error for file ${file.originalname}:`, fileError);
          uploadResults.push({
            filename: file.originalname,
            error: 'Upload failed',
            success: false
          });
        }
      }

      res.status(201).json({
        message: `Uploaded ${uploadResults.filter(r => r.success).length} of ${files.length} files successfully`,
        results: uploadResults,
        successful: uploadResults.filter(r => r.success),
        failed: uploadResults.filter(r => !r.success)
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ message: "Multiple upload failed" });
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
        uploadedBy: req.user!._id,
        path: cloudinaryResult.secure_url
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
      if (media.uploadedBy !== req.user!._id && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
        return res.status(403).json({ message: "Not authorized to delete this media" });
      }

      // Delete from Cloudinary
      if (media.cloudinaryPublicId) {
        await deleteFromCloudinary(media.cloudinaryPublicId);
      }
      
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

  // Admin stats endpoint
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get total counts and recent additions in parallel
      const [
        totalUsers,
        newUsersThisMonth,
        totalBlogs,
        newBlogsThisWeek,
        totalEvents,
        upcomingEvents,
        pendingAdmins
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
        storage.getBlogs().then(blogs => blogs.length),
        storage.getBlogs().then(blogs => blogs.filter(blog => new Date(blog.createdAt) >= oneWeekAgo).length),
        storage.getEvents().then(events => events.length),
        storage.getEvents().then(events => events.filter(event => new Date(event.startDate) > now).length),
        storage.getAllAdmins().then(admins => admins.filter(admin => !admin.isApproved).length)
      ]);

      res.json({
        totalUsers,
        newUsersThisMonth,
        totalBlogs,
        newBlogsThisWeek,
        totalEvents,
        upcomingEvents,
        pendingApprovals: pendingAdmins
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Super Admin routes for managing admin approvals
  app.get("/api/admin/pending", requireSuperAdmin, async (req, res) => {
    try {
      const pendingAdmins = await storage.getPendingAdmins();
      
      // Convert to plain objects and remove passwords
      const adminsWithoutPasswords = pendingAdmins.map(admin => {
        const plainAdmin = admin.toObject();
        const { password, ...adminWithoutPassword } = plainAdmin;
        return adminWithoutPassword;
      });
      res.json(adminsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending admins" });
    }
  });

  app.get("/api/admin/all", requireAdmin, async (req, res) => {
    try {
      const allAdmins = await storage.getAllAdmins();
      
      // Convert to plain objects and remove passwords
      const adminsWithoutPasswords = allAdmins.map(admin => {
        const plainAdmin = admin.toObject();
        const { password, ...adminWithoutPassword } = plainAdmin;
        return adminWithoutPassword;
      });
      res.json(adminsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  app.get("/api/users/all", requireSuperAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Convert to plain objects and remove passwords
      const usersWithoutPasswords = allUsers.map(user => {
        const plainUser = user.toObject();
        const { password, ...userWithoutPassword } = plainUser;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/:id/approve", requireSuperAdmin, async (req, res) => {
    try {
      const { isApproved } = req.body;
      
      if (!req.params.id || req.params.id === 'undefined') {
        return res.status(400).json({ message: "Invalid admin ID" });
      }
      
      const updatedAdmin = await storage.updateUserApproval(req.params.id, isApproved);
      
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const { password, ...adminWithoutPassword } = updatedAdmin.toObject();
      res.json({ 
        message: `Admin ${isApproved ? 'approved' : 'rejected'} successfully`,
        admin: adminWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update admin approval" });
    }
  });

  app.put("/api/admin/:id/reactivate", requireSuperAdmin, async (req, res) => {
    try {
      const updatedAdmin = await storage.updateUser(req.params.id, { 
        isActive: true, 
        isApproved: true 
      });
      
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const { password, ...adminWithoutPassword } = updatedAdmin.toObject();
      res.json({ 
        message: "Admin reactivated successfully",
        admin: adminWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to reactivate admin" });
    }
  });

  app.delete("/api/admin/:id", requireSuperAdmin, async (req, res) => {
    try {
      if (!req.params.id || req.params.id === 'undefined') {
        return res.status(400).json({ message: "Invalid admin ID" });
      }
      
      const deleted = await storage.deleteUser(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Admin not found" });
      }

      res.json({ message: "Admin deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete admin" });
    }
  });

  // Password change endpoint
  app.put("/api/user/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!._id;

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await comparePasswords(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await storage.updateUser(userId, { password: hashedNewPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
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

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      // Only allow users to update their own profile or admins to update any profile
      if (req.user!._id !== req.params.id && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      const updates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        bio: req.body.bio,
        graduationYear: req.body.graduationYear,
        profileImage: req.body.profileImage,
        position: req.body.position,
        department: req.body.department,
        phoneNumber: req.body.phoneNumber,
        officeLocation: req.body.officeLocation,
      };

      const updatedUser = await storage.updateUser(req.params.id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user profile" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
