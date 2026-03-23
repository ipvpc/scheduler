#!/bin/bash

echo "Running status column migration..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "Python is not available. Please install Python or check your PATH."
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Run the migration script
echo "Executing migration script..."
$PYTHON_CMD scripts/fix-status-column.py

if [ $? -eq 0 ]; then
    echo ""
    echo "Migration completed successfully!"
    echo "The status column issue has been fixed."
else
    echo ""
    echo "Migration failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "You can now restart the scheduler service to test the fix."
