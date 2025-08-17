// MongoDB initialization script for Docker setup
// This script creates the initial database structure and users

db = db.getSiblingDB('alumni-platform');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'firstName', 'lastName', 'passwordHash', 'role'],
      properties: {
        username: { bsonType: 'string' },
        email: { bsonType: 'string' },
        firstName: { bsonType: 'string' },
        lastName: { bsonType: 'string' },
        passwordHash: { bsonType: 'string' },
        role: { 
          bsonType: 'string',
          enum: ['user', 'admin', 'super_admin']
        },
        isActive: { bsonType: 'bool' },
        profileImage: { bsonType: 'string' },
        bio: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('blogs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'createdBy', 'status'],
      properties: {
        title: { bsonType: 'string' },
        content: { bsonType: 'string' },
        excerpt: { bsonType: 'string' },
        category: { bsonType: 'string' },
        status: {
          bsonType: 'string',
          enum: ['draft', 'published', 'archived']
        },
        tags: { bsonType: 'array' },
        featuredImage: { bsonType: 'string' },
        attachments: { bsonType: 'array' },
        likes: { bsonType: 'array' },
        viewCount: { bsonType: 'number' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('events', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'startDate', 'createdBy', 'status'],
      properties: {
        title: { bsonType: 'string' },
        description: { bsonType: 'string' },
        startDate: { bsonType: 'date' },
        endDate: { bsonType: 'date' },
        location: { bsonType: 'string' },
        category: { bsonType: 'string' },
        isVirtual: { bsonType: 'bool' },
        status: {
          bsonType: 'string',
          enum: ['upcoming', 'ongoing', 'completed', 'cancelled']
        },
        featuredImage: { bsonType: 'string' },
        attachments: { bsonType: 'array' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('staff', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'position'],
      properties: {
        position: { bsonType: 'string' },
        department: { bsonType: 'string' },
        bio: { bsonType: 'string' },
        phoneNumber: { bsonType: 'string' },
        officeLocation: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('comments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['content', 'createdBy', 'blogId'],
      properties: {
        content: { bsonType: 'string' },
        parentId: { bsonType: 'objectId' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

db.blogs.createIndex({ createdBy: 1 });
db.blogs.createIndex({ status: 1 });
db.blogs.createIndex({ category: 1 });
db.blogs.createIndex({ tags: 1 });
db.blogs.createIndex({ createdAt: -1 });

db.events.createIndex({ createdBy: 1 });
db.events.createIndex({ status: 1 });
db.events.createIndex({ startDate: 1 });
db.events.createIndex({ category: 1 });

db.staff.createIndex({ userId: 1 }, { unique: true });
db.staff.createIndex({ department: 1 });

db.comments.createIndex({ blogId: 1 });
db.comments.createIndex({ createdBy: 1 });
db.comments.createIndex({ parentId: 1 });
db.comments.createIndex({ createdAt: -1 });

print('✅ Alumni Platform database initialized successfully!');
print('📊 Collections created with validation schemas');
print('🔍 Indexes created for optimal performance');
print('🎓 Ready for Alumni Community Platform!');