# Contributing to Alumni Community Platform

Thank you for your interest in contributing to the Alumni Community Platform! This guide will help you get started with development and contribution.

## Development Environment Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas)
- Git

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd alumni-platform
   ```

2. **Run the setup script:**
   ```bash
   npm run setup
   # or manually: bash scripts/setup.sh
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── index.css       # Global styles
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication middleware
│   ├── routes.ts          # API routes
│   ├── mongodb-storage.ts # Database operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── mongodb-schema.ts  # Database schemas
└── scripts/               # Development scripts
```

## Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **Prettier**: Code formatting is handled automatically
- **ESLint**: Follow linting rules for code quality
- **Naming**: Use camelCase for variables, PascalCase for components

### Component Development

- **UI Components**: Use Radix UI primitives with shadcn/ui styling
- **State Management**: Use React Query for server state, useState for local state
- **Styling**: Use Tailwind CSS with mobile-first responsive design
- **Forms**: Use React Hook Form with Zod validation

### API Development

- **RESTful Design**: Follow REST conventions for API endpoints
- **Validation**: Use Zod schemas for request validation
- **Error Handling**: Provide clear error messages and appropriate status codes
- **Authentication**: Use passport.js session-based authentication

### Database

- **MongoDB**: Use Mongoose ODM for database operations
- **Schemas**: Define schemas in `/shared/mongodb-schema.ts`
- **Migrations**: Use Mongoose for schema changes
- **Indexing**: Add appropriate indexes for performance

## Contributing Workflow

### 1. Issue Creation

- Search existing issues before creating new ones
- Use issue templates when available
- Provide clear descriptions and reproduction steps for bugs
- Include mockups or detailed descriptions for feature requests

### 2. Branch Management

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Work on your feature
git add .
git commit -m "feat: add user profile management"

# Push and create pull request
git push origin feature/your-feature-name
```

### 3. Pull Request Process

- **Title**: Use conventional commit format (feat:, fix:, docs:, etc.)
- **Description**: Provide clear description of changes
- **Testing**: Ensure all existing tests pass
- **Screenshots**: Include screenshots for UI changes
- **Review**: Address all review comments before merging

## Testing

### Manual Testing

1. **Authentication Flow:**
   - User registration and login
   - Admin approval process
   - Password change functionality

2. **Content Management:**
   - Blog creation, editing, and publishing
   - Event creation and management
   - Staff profile management

3. **Mobile Responsiveness:**
   - Test on various screen sizes
   - Verify touch interactions work properly
   - Check mobile navigation functionality

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Guidelines

### Frontend Performance

- **Code Splitting**: Use dynamic imports for large components
- **Image Optimization**: Use Cloudinary transformations
- **Bundle Size**: Monitor bundle size and avoid unnecessary dependencies
- **Lazy Loading**: Implement lazy loading for images and components

### Backend Performance

- **Database Queries**: Use appropriate indexes and limit query results
- **Caching**: Implement caching for frequently accessed data
- **File Uploads**: Use Cloudinary for optimized media delivery
- **Session Management**: Use MongoDB for session storage in production

## Security Guidelines

### Authentication & Authorization

- **Password Security**: Use strong password hashing (scrypt)
- **Session Management**: Secure session configuration
- **Role-Based Access**: Implement proper authorization checks
- **Input Validation**: Validate all user inputs

### Data Protection

- **Environment Variables**: Never commit secrets to repository
- **HTTPS**: Use HTTPS in production
- **CORS**: Configure CORS appropriately
- **Rate Limiting**: Implement rate limiting for API endpoints

## Deployment

### Staging Environment

- **Testing**: All features must be tested in staging
- **Database**: Use staging database with production-like data
- **Environment**: Mirror production environment configuration

### Production Deployment

- **CI/CD**: Use automated deployment pipelines
- **Monitoring**: Set up application monitoring
- **Backups**: Ensure regular database backups
- **Rollback**: Have rollback strategy in place

## Common Issues and Solutions

### Development Issues

1. **MongoDB Connection:**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **Node Modules Issues:**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors:**
   ```bash
   # Check types
   npm run check
   ```

### Deployment Issues

1. **Environment Variables:**
   - Verify all required environment variables are set
   - Check variable names match exactly

2. **Database Connection:**
   - Verify MongoDB connection string format
   - Check network access and authentication

3. **Build Errors:**
   - Check for TypeScript compilation errors
   - Verify all dependencies are installed

## Resources

### Documentation

- [React Documentation](https://reactjs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### Tools

- [Postman](https://www.postman.com/) for API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) for database management
- [React Developer Tools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html)

## Getting Help

- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check existing documentation first
- **Code Review**: Ask for code review on complex changes

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Code of Conduct

Please read our Code of Conduct to understand the standards of behavior expected in our community.

Thank you for contributing to the Alumni Community Platform!