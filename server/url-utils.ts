import { Request } from 'express';

/**
 * Get the base URL for the application
 * Priority: WEB_URL env var > Request headers > Default
 */
export function getBaseUrl(req?: Request): string {
  // First check environment variable
  if (process.env.WEB_URL) {
    return process.env.WEB_URL.replace(/\/$/, ''); // Remove trailing slash
  }

  // If request is available, try to construct from headers
  if (req) {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:5000';
    return `${protocol}://${host}`;
  }

  // Fallback based on environment
  const port = process.env.PORT || '5000';
  return process.env.NODE_ENV === 'production' 
    ? `https://localhost:${port}` 
    : `http://localhost:${port}`;
}

/**
 * Generate full URL for a path
 */
export function generateUrl(path: string, req?: Request): string {
  const baseUrl = getBaseUrl(req);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate event-specific URLs
 */
export function generateEventUrls(eventId: string, req?: Request) {
  const baseUrl = getBaseUrl(req);
  return {
    viewUrl: `${baseUrl}/events/${eventId}`,
    editUrl: `${baseUrl}/admin/events/${eventId}/edit`,
    registrationUrl: `${baseUrl}/events/${eventId}/register`,
    shareUrl: `${baseUrl}/events/${eventId}`
  };
}

/**
 * Generate blog-specific URLs
 */
export function generateBlogUrls(blogId: string, req?: Request) {
  const baseUrl = getBaseUrl(req);
  return {
    viewUrl: `${baseUrl}/blogs/${blogId}`,
    editUrl: `${baseUrl}/admin/blogs/${blogId}/edit`,
    shareUrl: `${baseUrl}/blogs/${blogId}`
  };
}

/**
 * Generate staff profile URLs
 */
export function generateStaffUrls(staffId: string, req?: Request) {
  const baseUrl = getBaseUrl(req);
  return {
    profileUrl: `${baseUrl}/staff/${staffId}`,
    editUrl: `${baseUrl}/admin/staff/${staffId}/edit`
  };
}