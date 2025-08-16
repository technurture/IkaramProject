import { User, Staff } from "@shared/mongodb-schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64) as Buffer;
  return `${salt}.${hash.toString('hex')}`;
}

export async function seedSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:', existingSuperAdmin.email);
      
      // Check if staff profile exists for super admin
      const existingStaff = await Staff.findOne({ userId: existingSuperAdmin._id });
      if (!existingStaff) {
        // Create staff profile for existing super admin
        const staffData = {
          userId: existingSuperAdmin._id,
          position: "System Administrator",
          department: "Information Technology",
          bio: "System administrator with full access to manage the platform and approve other administrators.",
          phoneNumber: "+1-555-0100",
          officeLocation: "Admin Building, Room 101"
        };
        
        const staff = new Staff(staffData);
        await staff.save();
        console.log('✅ Staff profile created for existing super admin');
      }
      
      return existingSuperAdmin;
    }

    // Create super admin
    const superAdminData = {
      username: 'superadmin',
      email: 'superadmin@ikaram.edu',
      password: await hashPassword('SuperAdmin123!'), // Default password - should be changed
      firstName: 'Super',
      lastName: 'Administrator',
      role: 'super_admin' as const,
      isActive: true,
      isApproved: true,
      bio: 'System administrator with full access to manage the platform and approve other administrators.'
    };

    const superAdmin = new User(superAdminData);
    await superAdmin.save();

    // Create staff profile for super admin
    const staffData = {
      userId: superAdmin._id,
      position: "System Administrator",
      department: "Information Technology",
      bio: "System administrator with full access to manage the platform and approve other administrators.",
      phoneNumber: "+1-555-0100",
      officeLocation: "Admin Building, Room 101"
    };
    
    const staff = new Staff(staffData);
    await staff.save();

    console.log('✅ Super admin created successfully!');
    console.log('✅ Staff profile created for super admin');
    console.log('📧 Email: superadmin@ikaram.edu');
    console.log('🔑 Password: SuperAdmin123!');
    console.log('⚠️  Please change the default password after first login!');

    return superAdmin;
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  }
}

// Function to create additional super admins if needed
export async function createSuperAdmin(userData: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    const superAdmin = new User({
      ...userData,
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      isApproved: true
    });

    await superAdmin.save();
    console.log('✅ New super admin created:', userData.email);
    return superAdmin;
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  }
}

// Function to approve/reject admins (for super admin use)
export async function updateAdminApproval(adminId: string, isApproved: boolean, actionBy: string) {
  try {
    const admin = await User.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    if (admin.role !== 'admin') {
      throw new Error('User is not an admin');
    }

    admin.isApproved = isApproved;
    admin.updatedAt = new Date();
    await admin.save();

    console.log(`✅ Admin ${admin.email} ${isApproved ? 'approved' : 'rejected'} by ${actionBy}`);
    return admin;
  } catch (error) {
    console.error('❌ Error updating admin approval:', error);
    throw error;
  }
}

// Function to list all pending admin approvals
export async function getPendingAdmins() {
  try {
    const pendingAdmins = await User.find({ 
      role: 'admin', 
      isApproved: false 
    }).select('-password');

    return pendingAdmins;
  } catch (error) {
    console.error('❌ Error fetching pending admins:', error);
    throw error;
  }
}