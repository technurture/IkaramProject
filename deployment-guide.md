# Alumni Community Platform - Deployment Guide

This guide covers different deployment options for the Alumni Community Platform.

## Quick Deployment Options

### 1. Replit Deployment (Recommended for Beginners)

**Advantages:**
- One-click deployment
- Automatic scaling
- Built-in database hosting
- SSL certificates included
- Zero configuration required

**Steps:**
1. Ensure your project is working in Replit
2. Set up environment variables in Replit Secrets:
   - `MONGODB_URL` (if using external MongoDB)
   - `CLOUDINARY_URL`
   - `SESSION_SECRET`
3. Click the "Deploy" button in your Replit workspace
4. Choose your deployment settings
5. Your app will be live at `your-project-name.replit.app`

### 2. Railway Deployment

**Advantages:**
- Free tier available
- Automatic GitHub integration
- Built-in PostgreSQL and MongoDB
- Easy environment variable management

**Steps:**
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on git push
4. Custom domain support available

### 3. Render Deployment

**Advantages:**
- Free tier with automatic SSL
- PostgreSQL and Redis add-ons
- GitHub integration
- Docker support

**Steps:**
1. Connect GitHub repository
2. Create new Web Service
3. Set build command: `npm ci && npm run build`
4. Set start command: `npm start`
5. Add environment variables

### 4. Heroku Deployment

**Steps:**
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Add MongoDB add-on: `heroku addons:create mongolab:sandbox`
4. Set environment variables: `heroku config:set VARIABLE=value`
5. Deploy: `git push heroku main`

## Environment Variables Required

For all deployment platforms, set these environment variables:

```bash
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/alumni-platform

# File Upload
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Security
SESSION_SECRET=your-super-secret-session-key-here

# Environment
NODE_ENV=production
PORT=5000
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone and build:**
   ```bash
   git clone <your-repo>
   cd alumni-platform
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Access your application:**
   - App: http://localhost:5000
   - MongoDB: localhost:27017

### Manual Docker Build

1. **Build the image:**
   ```bash
   docker build -t alumni-platform .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     -p 5000:5000 \
     -e MONGODB_URL="your_mongodb_url" \
     -e CLOUDINARY_URL="your_cloudinary_url" \
     -e SESSION_SECRET="your_session_secret" \
     --name alumni-app \
     alumni-platform
   ```

## Cloud Platform Specific Guides

### AWS Deployment

**Option 1: Elastic Beanstalk**
1. Install EB CLI: `pip install awsebcli`
2. Initialize: `eb init`
3. Create environment: `eb create production`
4. Set environment variables in EB console
5. Deploy: `eb deploy`

**Option 2: ECS with Fargate**
1. Push image to ECR
2. Create ECS cluster
3. Create task definition
4. Create service
5. Configure load balancer

### Google Cloud Platform

**Option 1: App Engine**
1. Create `app.yaml`:
   ```yaml
   runtime: nodejs18
   env_variables:
     MONGODB_URL: "your_mongodb_url"
     CLOUDINARY_URL: "your_cloudinary_url"
     SESSION_SECRET: "your_session_secret"
   ```
2. Deploy: `gcloud app deploy`

**Option 2: Cloud Run**
1. Build and push to Container Registry
2. Deploy to Cloud Run
3. Set environment variables
4. Configure custom domain

### Microsoft Azure

**Option 1: App Service**
1. Create App Service in Azure Portal
2. Configure deployment from GitHub
3. Set application settings (environment variables)
4. Enable custom domain and SSL

## Database Setup

### MongoDB Atlas (Recommended)

1. Create account at mongodb.com
2. Create new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for cloud deployments)
5. Get connection string
6. Update MONGODB_URL environment variable

### Self-Hosted MongoDB

For production self-hosted MongoDB:

1. **Install MongoDB:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # CentOS/RHEL
   sudo yum install mongodb
   ```

2. **Configure security:**
   ```bash
   # Enable authentication
   sudo nano /etc/mongod.conf
   # Add: security.authorization: enabled
   ```

3. **Create admin user:**
   ```javascript
   use admin
   db.createUser({
     user: "admin",
     pwd: "secure_password",
     roles: ["root"]
   })
   ```

## SSL/HTTPS Setup

### Free SSL with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Performance Optimization

### Production Checklist

- [ ] Enable compression (gzip)
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize images through Cloudinary
- [ ] Set up monitoring (New Relic, DataDog)
- [ ] Configure log rotation
- [ ] Set up database indexing
- [ ] Enable database connection pooling

### Scaling Considerations

1. **Load Balancing:** Use multiple app instances
2. **Database Scaling:** MongoDB replica sets
3. **Session Storage:** Use Redis for sessions in production
4. **File Storage:** Ensure Cloudinary limits are appropriate
5. **CDN:** CloudFlare or AWS CloudFront for global delivery

## Monitoring and Maintenance

### Health Checks

Add health check endpoint:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Logging

Use structured logging in production:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Backup Strategy

1. **Database Backups:**
   - MongoDB Atlas: Automatic backups included
   - Self-hosted: Daily `mongodump` with rotation

2. **File Backups:**
   - Cloudinary: Built-in redundancy
   - Regular export of important assets

## Troubleshooting

### Common Issues

1. **Memory Issues:**
   - Increase container/instance memory
   - Check for memory leaks
   - Optimize database queries

2. **Database Connection Issues:**
   - Check connection string format
   - Verify network access
   - Monitor connection pool

3. **File Upload Issues:**
   - Verify Cloudinary credentials
   - Check file size limits
   - Monitor upload quotas

### Support Resources

- MongoDB Documentation: docs.mongodb.com
- Cloudinary Documentation: cloudinary.com/documentation
- Express.js Documentation: expressjs.com
- React Documentation: reactjs.org

For deployment-specific issues, consult your cloud provider's documentation.