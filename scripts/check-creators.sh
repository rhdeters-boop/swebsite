#!/bin/bash

# Script to check creators in the database via API
# This script calls the backend API to get creator data and formats it nicely

API_BASE="http://localhost:5001/api"
OUTPUT_FILE="creators_list.txt"

echo "🔍 Checking VOID of DESIRE Database for Creators..."
echo "=================================================="
echo ""

# Function to format JSON output nicely
format_creators() {
    local response="$1"
    echo "$response" | jq -r '
        if .success == true and (.creators | length) > 0 then
            "✅ Found \(.creators | length) creators:\n" +
            (.creators[] | 
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "📛 Creator: \(.displayName // "Unknown")\n" +
                "🆔 ID: \(.id)\n" +
                "👤 Username: \(.user.username // "N/A")\n" +
                "📧 Email: \(.user.email // "N/A")\n" +
                "📝 Bio: \(.bio // "No bio available")\n" +
                "💰 Subscription: $\((.subscriptionPrice // 0) / 100 | tostring)\n" +
                "👥 Followers: \(.followerCount // 0)\n" +
                "📊 Subscribers: \(.subscriberCount // 0)\n" +
                "❤️  Likes: \(.likeCount // 0)\n" +
                "� Dislikes: \(.dislikeCount // 0)\n" +
                "🏷️  Categories: \(.categories // [] | join(", "))\n" +
                "🌐 Social Links: \(
                    if .socialLinks then
                        [
                            (if .socialLinks.instagram then "Instagram: \(.socialLinks.instagram)" else empty end),
                            (if .socialLinks.twitter then "Twitter: \(.socialLinks.twitter)" else empty end),
                            (if .socialLinks.tiktok then "TikTok: \(.socialLinks.tiktok)" else empty end)
                        ] | join(", ")
                    else
                        "None"
                    end
                )\n" +
                "📅 Created: \(.createdAt // "Unknown")\n" +
                "🔄 Status: \(if .isActive then "Active" else "Inactive" end)\n" +
                "✅ Verified: \(if .isVerified then "Yes" else "No" end)\n"
            )
        elif .success == true and (.creators | length) == 0 then
            "❌ No creators found in the database"
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

# Function to get all creators
get_all_creators() {
    echo "📋 Fetching all creators..."
    
    local response=$(curl -s "$API_BASE/creators" 2>/dev/null)
    local curl_exit_code=$?
    
    if [[ $curl_exit_code -ne 0 ]]; then
        echo "❌ Failed to connect to API"
        return 1
    fi
    
    echo "Raw API Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    echo "Formatted Creator List:"
    format_creators "$response"
}

# Function to get creator statistics
get_creator_stats() {
    echo ""
    echo "📊 Creator Statistics"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local response=$(curl -s "$API_BASE/creators" 2>/dev/null)
    
    echo "$response" | jq -r '
        if .success == true and .creators then
            "📈 Total Creators: \(.creators | length)\n" +
            "💰 Average Subscription Price: $\(
                if (.creators | length) > 0 then
                    ((.creators | map(.subscriptionPrice // 0) | add) / (.creators | length) / 100 | floor)
                else
                    0
                end
            )\n" +
            "👥 Total Followers: \(.creators | map(.followerCount // 0) | add)\n" +
            "📊 Total Subscribers: \(.creators | map(.subscriberCount // 0) | add)\n" +
            "❤️  Total Likes: \(.creators | map(.likeCount // 0) | add)\n" +
            "👎 Total Dislikes: \(.creators | map(.dislikeCount // 0) | add)\n" +
            "🔄 Active Creators: \(.creators | map(select(.isActive == true)) | length)\n" +
            "✅ Verified Creators: \(.creators | map(select(.isVerified == true)) | length)"
        else
            "No data available for statistics"
        end
    ' 2>/dev/null || echo "❌ Failed to calculate statistics"
}

# Function to test username routing
test_username_routing() {
    echo ""
    echo "🔗 Testing Username-Based Routing"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Get first creator's username
    local response=$(curl -s "$API_BASE/creators" 2>/dev/null)
    local username=$(echo "$response" | jq -r '.creators[0].user.username // empty' 2>/dev/null)
    
    if [[ -n "$username" ]]; then
        echo "🧪 Testing username route for: @$username"
        local test_response=$(curl -s "$API_BASE/creators/username/$username" 2>/dev/null)
        local test_success=$(echo "$test_response" | jq -r '.success // false' 2>/dev/null)
        
        if [[ "$test_success" == "true" ]]; then
            echo "✅ Username routing works!"
            echo "🌐 Frontend URL: http://localhost:5173/creator/$username"
            echo "🔗 API URL: $API_BASE/creators/username/$username"
        else
            echo "❌ Username routing failed"
            echo "Response: $test_response"
        fi
    else
        echo "⚠️  No username found to test"
    fi
}

# Function to save output to file
save_to_file() {
    echo ""
    echo "💾 Saving results to $OUTPUT_FILE..."
    {
        echo "VOID of DESIRE - Creator Database Report"
        echo "Generated on: $(date)"
        echo "========================================"
        echo ""
        get_all_creators
        get_creator_stats
    } > "$OUTPUT_FILE"
    echo "✅ Results saved to $OUTPUT_FILE"
}

# Main execution
main() {
    # Check dependencies
    check_jq
    
    # Check if server is running
    check_server
    
    # Get creator data
    get_all_creators
    
    # Get statistics
    get_creator_stats
    
    # Test username routing
    test_username_routing
    
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
    echo ""
    echo "This script fetches creator data from the VOID of DESIRE API"
    echo "and formats it in a readable way."
    exit 0
fi

# Handle different options
if [[ "$1" == "--stats-only" ]]; then
    check_jq
    check_server
    get_creator_stats
elif [[ "$1" == "--save" ]]; then
    check_jq
    check_server
    save_to_file
else
    main
fi
