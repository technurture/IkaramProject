import { User } from "@shared/mongodb-schema";
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

    console.log('✅ Super admin created successfully!');
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