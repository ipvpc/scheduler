@echo off
echo Running status column migration...

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not available. Please install Python or check your PATH.
    exit /b 1
)

REM Run the migration script
echo Executing migration script...
python scripts/fix-status-column.py

if %errorlevel% equ 0 (
    echo.
    echo Migration completed successfully!
    echo The status column issue has been fixed.
) else (
    echo.
    echo Migration failed. Please check the error messages above.
    exit /b 1
)

echo.
echo You can now restart the scheduler service to test the fix.
pause
