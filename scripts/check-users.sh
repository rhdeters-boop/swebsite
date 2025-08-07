#!/bin/bash

# Script to check registered users in the database via API
# This script calls the backend API to get user data and formats it nicely

API_BASE="http://localhost:5001/api"
OUTPUT_FILE="users_list.txt"

echo "👥 Checking VOID of DESIRE Database for Registered Users..."
echo "=========================================================="
echo ""

# Function to format JSON output nicely
format_users() {
    local response="$1"
    echo "$response" | jq -r '
        if .success == true and (.users | length) > 0 then
            "✅ Found \(.users | length) registered users:\n" +
            (.users[] | 
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "👤 User: \(.displayName // .username // "Unknown")\n" +
                "🆔 ID: \(.id)\n" +
                "📧 Email: \(.email)\n" +
                "🏷️  Username: \(.username // "N/A")\n" +
                "🖼️  Profile Picture: \(if .profilePicture then "Yes" else "None" end)\n" +
                "📧 Email Verified: \(if .isEmailVerified then "✅ Yes" else "❌ No" end)\n" +
                "🔄 Status: \(if .isActive then "Active" else "Inactive" end)\n" +
                "🔐 Auth0 ID: \(.auth0Id // "N/A")\n" +
                "📅 Created: \(.createdAt)\n" +
                "🕐 Last Login: \(.lastLoginAt // "Never")\n" +
                "📝 Updated: \(.updatedAt)\n"
            )
        elif .success == true and (.users | length) == 0 then
            "❌ No users found in the database"
        else
            "⚠️  Error: \(.message // "Unknown error occurred")"
        end
    '
}

# Function to check if jq is available
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo "❌ jq is required but not installed."
        echo "💡 Install it with:"
        echo "   macOS: brew install jq"
        echo "   Ubuntu: sudo apt install jq"
        echo "   CentOS: sudo yum install jq"
        exit 1
    fi
}

# Function to check if the server is running
check_server() {
    echo "🔌 Checking if backend server is running..."
    
    local health_response=$(curl -s -w "%{http_code}" "$API_BASE/health" -o /tmp/health_check.json 2>/dev/null)
    local http_code="${health_response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        echo "✅ Backend server is running"
        return 0
    else
        echo "❌ Backend server is not responding (HTTP: $http_code)"
        echo "💡 Please start the development server:"
        echo "   npm run dev"
        exit 1
    fi
}

# Function to get all users (we'll need to create this endpoint)
get_all_users() {
    echo "📋 Fetching all registered users..."
    
    # For now, we'll try the users endpoint - we may need to create this
    local response=$(curl -s "$API_BASE/users" 2>/dev/null)
    local curl_exit_code=$?
    
    if [[ $curl_exit_code -ne 0 ]]; then
        echo "❌ Failed to connect to API"
        return 1
    fi
    
    # Check if we get a 404 or other error
    local error_check=$(echo "$response" | jq -r '.message // empty' 2>/dev/null)
    if [[ "$error_check" == *"not found"* ]] || [[ "$error_check" == *"Cannot"* ]]; then
        echo "⚠️  Users endpoint not available. Raw response:"
        echo "$response"
        echo ""
        echo "💡 This endpoint may need to be created in the backend."
        return 1
    fi
    
    echo "Raw API Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    echo "Formatted User List:"
    format_users "$response"
}

# Function to get user statistics
get_user_stats() {
    echo ""
    echo "📊 User Statistics"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local response=$(curl -s "$API_BASE/users" 2>/dev/null)
    
    echo "$response" | jq -r '
        if .success == true and .users then
            "👥 Total Users: \(.users | length)\n" +
            "📧 Email Verified Users: \(.users | map(select(.isEmailVerified == true)) | length)\n" +
            "🔄 Active Users: \(.users | map(select(.isActive == true)) | length)\n" +
            "🔐 Auth0 Users: \(.users | map(select(.auth0Id != null)) | length)\n" +
            "🖼️  Users with Profile Pictures: \(.users | map(select(.profilePicture != null)) | length)\n" +
            "🕐 Users who have logged in: \(.users | map(select(.lastLoginAt != null)) | length)\n" +
            "📅 Newest User: \(.users | sort_by(.createdAt) | reverse | first.email // "N/A")\n" +
            "📅 Most Recent Login: \(.users | map(select(.lastLoginAt != null)) | sort_by(.lastLoginAt) | reverse | first.email // "N/A")"
        else
            "No data available for statistics"
        end
    ' 2>/dev/null || echo "❌ Failed to calculate statistics"
}

# Function to test database query directly (fallback)
test_database_direct() {
    echo ""
    echo "🔍 Testing Direct Database Query (Fallback)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # This would be a fallback if the API endpoint doesn't exist
    echo "💡 If the users API endpoint doesn't exist, you can:"
    echo "   1. Add it to the backend routes"
    echo "   2. Use psql directly: psql -d swebsite_dev -c 'SELECT id, email, username, display_name, created_at, last_login_at, is_active, is_email_verified FROM users;'"
    echo "   3. Create a database script in backend/scripts/"
}

# Function to save output to file
save_to_file() {
    echo ""
    echo "💾 Saving results to $OUTPUT_FILE..."
    {
        echo "VOID of DESIRE - User Database Report"
        echo "Generated on: $(date)"
        echo "===================================="
        echo ""
        get_all_users
        get_user_stats
    } > "$OUTPUT_FILE"
    echo "✅ Results saved to $OUTPUT_FILE"
}

# Main execution
main() {
    # Check dependencies
    check_jq
    
    # Check if server is running
    check_server
    
    # Get user data
    if ! get_all_users; then
        echo ""
        echo "⚠️  API endpoint not available. Let's check what we can do..."
        test_database_direct
        
        echo ""
        echo "🛠️  Would you like me to create the missing API endpoint?"
        echo "   The endpoint should be: GET /api/users"
        return 1
    fi
    
    # Get statistics
    get_user_stats
    
    # Ask if user wants to save to file
    echo ""
    read -p "💾 Save results to file? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        save_to_file
    fi
    
    echo ""
    echo "🎉 Done!"
}

# Show usage if requested
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --stats-only   Show only statistics"
    echo "  --save         Automatically save to file"
    echo "  --db-direct    Show database query examples"
    echo ""
    echo "This script fetches user data from the VOID of DESIRE API"
    echo "and formats it in a readable way."
    exit 0
fi

# Handle different options
if [[ "$1" == "--stats-only" ]]; then
    check_jq
    check_server
    get_user_stats
elif [[ "$1" == "--save" ]]; then
    check_jq
    check_server
    if get_all_users; then
        save_to_file
    fi
elif [[ "$1" == "--db-direct" ]]; then
    test_database_direct
else
    main
fi
