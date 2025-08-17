import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a secure session secret for environment variables
 * This should be called once and the result stored in your .env file
 */
export function generateSessionSecret(): string {
  // Generate a 64-byte (512-bit) random secret
  return randomBytes(64).toString('hex');
}

/**
 * Generate a session token with expiration
 */
export function generateSessionToken(): {
  token: string;
  expiresAt: Date;
  hashedToken: string;
} {
  const token = generateSecureToken(32);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration
  
  // Hash the token for storage (never store plain tokens)
  const hashedToken = createHash('sha256').update(token).digest('hex');
  
  return {
    token,
    expiresAt,
    hashedToken
  };
}

/**
 * Generate an API token for external integrations
 */
export function generateApiToken(userId: string): {
  token: string;
  tokenId: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const tokenId = generateSecureToken(16);
  const token = `alu_${tokenId}_${generateSecureToken(32)}`;
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiration
  
  // Hash the token for storage
  const hashedToken = createHash('sha256').update(token).digest('hex');
  
  return {
    token,
    tokenId,
    hashedToken,
    expiresAt
  };
}

/**
 * Verify a token against its hash
 */
export function verifyToken(token: string, hashedToken: string): boolean {
  try {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const storedHash = Buffer.from(hashedToken, 'hex');
    const providedHash = Buffer.from(tokenHash, 'hex');
    
    if (storedHash.length !== providedHash.length) {
      return false;
    }
    
    return timingSafeEqual(storedHash, providedHash);
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Generate a password reset token
 */
export function generatePasswordResetToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateSecureToken(24);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration
  
  const hashedToken = createHash('sha256').update(token).digest('hex');
  
  return {
    token,
    hashedToken,
    expiresAt
  };
}

/**
 * Generate an email verification token
 */
export function generateEmailVerificationToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateSecureToken(20);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiration
  
  const hashedToken = createHash('sha256').update(token).digest('hex');
  
  return {
    token,
    hashedToken,
    expiresAt
  };
}

/**
 * Generate a one-time access token for file downloads
 */
export function generateFileAccessToken(fileId: string, userId: string): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = generateSecureToken(16);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minute expiration
  
  // Include file and user info in hash for extra security
  const tokenData = `${token}:${fileId}:${userId}`;
  const hashedToken = createHash('sha256').update(tokenData).digest('hex');
  
  return {
    token,
    hashedToken,
    expiresAt
  };
}