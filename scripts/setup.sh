#!/bin/bash

# Alumni Community Platform - Local Development Setup Script

echo "🎓 Setting up Alumni Community Platform for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your actual environment variables:"
    echo "   - MONGODB_URL: Your MongoDB connection string"
    echo "   - CLOUDINARY_URL: Your Cloudinary credentials"
    echo "   - SESSION_SECRET: A secure random string"
    echo ""
fi

# Check MongoDB connection
echo "🔍 Checking if MongoDB is running..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" --quiet &> /dev/null; then
        echo "✅ MongoDB is running locally"
    else
        echo "⚠️  MongoDB is not running locally. You can:"
        echo "   1. Start local MongoDB service"
        echo "   2. Use MongoDB Atlas (cloud database)"
        echo "   3. Use Docker: docker run -d -p 27017:27017 mongo:7.0"
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.version()" --quiet &> /dev/null; then
        echo "✅ MongoDB is running locally"
    else
        echo "⚠️  MongoDB is not running locally. Please start MongoDB service."
    fi
else
    echo "⚠️  MongoDB is not installed locally. You can:"
    echo "   1. Install MongoDB Community Edition"
    echo "   2. Use MongoDB Atlas (cloud database)"
    echo "   3. Use Docker: docker run -d -p 27017:27017 mongo:7.0"
fi

echo ""
echo "🚀 Setup complete! To start the development server:"
echo "   npm run dev"
echo ""
echo "📖 The application will be available at: http://localhost:5000"
echo "🔑 Default super admin account:"
echo "   Email: superadmin@ikaram.edu"
echo "   Password: SuperAdmin123!"
echo ""
echo "📝 Don't forget to update your .env file with the correct values!"