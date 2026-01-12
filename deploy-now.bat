@echo off
echo ========================================
echo   ML Learning Hub - Manual Deployment
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [3/3] Build completed successfully!
echo.
echo ========================================
echo   DEPLOYMENT OPTIONS
echo ========================================
echo.
echo Your ML Learning Hub is ready in the 'dist' folder!
echo.
echo OPTION 1 - GitHub Pages (Recommended):
echo   1. Go to Repository Settings ^> Pages
echo   2. Source: Select "GitHub Actions"
echo   3. Push to main branch
echo   4. Site will be live at: https://[username].github.io/[repo-name]
echo.
echo OPTION 2 - Manual Upload:
echo   1. Upload the 'dist' folder contents to any web hosting
echo   2. Examples: Netlify Drop, Surge.sh, Firebase Hosting
echo.
echo OPTION 3 - Local Preview:
echo   Run: npm run preview
echo   Then open: http://localhost:4173
echo.
echo ========================================
echo   BUILD SUMMARY
echo ========================================
dir dist /s
echo.
echo Your Interactive ML Learning Hub includes:
echo   - 5 ML Algorithms (XGBoost, k-NN, SVM, etc.)
echo   - Mobile-optimized responsive design
echo   - Security features and content protection
echo   - Interactive parameter tuning
echo   - Python code examples
echo.
echo Press any key to exit...
pause >nul