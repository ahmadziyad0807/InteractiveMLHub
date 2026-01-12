@echo off
REM Manual Deployment Script for ML Learning Hub (Windows)
REM This script builds and deploys your application manually

echo 🚀 Starting Manual Deployment for ML Learning Hub
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available

REM Install dependencies
echo 📦 Installing dependencies...
npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Run type checking
echo 🔍 Running type checking...
npm run type-check
if %errorlevel% neq 0 (
    echo ❌ Type checking failed
    pause
    exit /b 1
)

echo ✅ Type checking passed

REM Build the application
echo 🔨 Building application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully

REM Show build output
echo 📊 Build Output:
echo ================
dir dist
echo.

echo 🎉 Build completed successfully!
echo 📁 Your built application is in the 'dist' folder
echo.
echo 🚀 Deployment Options:
echo ======================
echo 1. Vercel: vercel --prod
echo 2. Netlify: netlify deploy --prod --dir=dist
echo 3. Firebase: firebase deploy --only hosting
echo 4. GitHub Pages: Upload dist/ contents to gh-pages branch
echo 5. Any static host: Upload dist/ folder contents
echo.
echo 🔗 Your mobile-optimized ML Learning Hub is ready for deployment!

REM Optional: Deploy to Vercel if CLI is available
vercel --version >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    set /p deploy="🤔 Deploy to Vercel now? (y/n): "
    if /i "%deploy%"=="y" (
        echo 🚀 Deploying to Vercel...
        vercel --prod
    )
) else (
    echo.
    echo 💡 Tip: Install Vercel CLI with 'npm i -g vercel' for easy deployment
)

echo.
echo ✨ Deployment script completed!
pause