#!/bin/bash

# Manual Deployment Script for ML Learning Hub
# This script builds and deploys your application manually

echo "🚀 Starting Manual Deployment for ML Learning Hub"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ Type checking failed"
    exit 1
fi

echo "✅ Type checking passed"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Show build output
echo "📊 Build Output:"
echo "================"
du -sh dist/
echo ""
echo "Files in dist/:"
ls -la dist/

echo ""
echo "🎉 Build completed successfully!"
echo "📁 Your built application is in the 'dist' folder"
echo ""
echo "🚀 Deployment Options:"
echo "======================"
echo "1. Vercel: vercel --prod"
echo "2. Netlify: netlify deploy --prod --dir=dist"
echo "3. Firebase: firebase deploy --only hosting"
echo "4. GitHub Pages: Upload dist/ contents to gh-pages branch"
echo "5. Any static host: Upload dist/ folder contents"
echo ""
echo "🔗 Your mobile-optimized ML Learning Hub is ready for deployment!"

# Optional: Deploy to Vercel if CLI is available
if command -v vercel &> /dev/null; then
    echo ""
    read -p "🤔 Deploy to Vercel now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Deploying to Vercel..."
        vercel --prod
    fi
else
    echo ""
    echo "💡 Tip: Install Vercel CLI with 'npm i -g vercel' for easy deployment"
fi

echo ""
echo "✨ Deployment script completed!"