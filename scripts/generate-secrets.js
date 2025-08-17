#!/usr/bin/env node

import crypto from 'crypto';

/**
 * Generate various secrets for the Alumni Community Platform
 */

console.log('🔐 Alumni Community Platform - Secret Generator\n');

// Generate SESSION_SECRET
const sessionSecret = crypto.randomBytes(64).toString('hex');
console.log('SESSION_SECRET (for .env file):');
console.log(`SESSION_SECRET=${sessionSecret}\n`);

// Generate additional secrets that might be useful
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET (if implementing JWT tokens):');
console.log(`JWT_SECRET=${jwtSecret}\n`);

const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY (for data encryption):');
console.log(`ENCRYPTION_KEY=${encryptionKey}\n`);

const apiSecret = crypto.randomBytes(24).toString('hex');
console.log('API_SECRET (for API authentication):');
console.log(`API_SECRET=${apiSecret}\n`);

console.log('📋 Copy the SESSION_SECRET line to your .env file');
console.log('⚠️  Keep these secrets secure and never commit them to version control!');