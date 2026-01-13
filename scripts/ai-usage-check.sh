#!/bin/bash

# AI CLI Usage Monitor (ai-usage-check.sh)
# Checks usage limits for Claude Code and Cursor
# Works on macOS

set -e

# ANSI color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
WARNING_THRESHOLD=80  # Percentage at which to show warning
CRITICAL_THRESHOLD=95 # Percentage at which to show critical warning

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to print a progress bar
print_progress_bar() {
    local percentage=$1
    local width=40
    local filled=$((percentage * width / 100))
    local empty=$((width - filled))

    local color=$GREEN
    if [ "$percentage" -ge "$CRITICAL_THRESHOLD" ]; then
        color=$RED
    elif [ "$percentage" -ge "$WARNING_THRESHOLD" ]; then
        color=$YELLOW
    fi

    printf "${color}["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] %3d%%${NC}\n" "$percentage"
}

# Function to calculate time remaining
calculate_time_remaining() {
    local reset_time=$1

    if [ -z "$reset_time" ] || [ "$reset_time" = "null" ]; then
        echo "N/A"
        return
    fi

    # Convert ISO 8601 to epoch (macOS compatible)
    local reset_epoch
    reset_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${reset_time:0:19}" "+%s" 2>/dev/null || echo "0")

    if [ "$reset_epoch" = "0" ]; then
        # Try alternative parsing for macOS
        reset_epoch=$(python3 -c "from datetime import datetime; print(int(datetime.fromisoformat('${reset_time}'.replace('+00:00', '+0000').replace('Z', '+0000')[:25]).timestamp()))" 2>/dev/null || echo "0")
    fi

    local current_epoch
    current_epoch=$(date +%s)

    local diff=$((reset_epoch - current_epoch))

    if [ "$diff" -le 0 ]; then
        echo "Resetting now..."
        return
    fi

    local days=$((diff / 86400))
    local hours=$(((diff % 86400) / 3600))
    local minutes=$(((diff % 3600) / 60))

    if [ "$days" -gt 0 ]; then
        if [ "$days" -eq 1 ]; then
            printf "%d day, %dh %dm" "$days" "$hours" "$minutes"
        else
            printf "%d days, %dh %dm" "$days" "$hours" "$minutes"
        fi
    elif [ "$hours" -gt 0 ]; then
        printf "%dh %dm" "$hours" "$minutes"
    elif [ "$minutes" -gt 0 ]; then
        printf "%dm" "$minutes"
    else
        printf "Less than a minute"
    fi
}

# Function to format reset time for display (12-hour format)
format_reset_time() {
    local reset_time=$1

    if [ -z "$reset_time" ] || [ "$reset_time" = "null" ]; then
        echo "N/A"
        return
    fi

    # Convert to local time with 12-hour format
    python3 -c "
from datetime import datetime
try:
    dt = datetime.fromisoformat('${reset_time}'.replace('+00:00', '+0000').replace('Z', '+0000')[:25])
    print(dt.strftime('%b %d, %Y at %I:%M %p'))
except:
    print('${reset_time}')
" 2>/dev/null || echo "$reset_time"
}

# ═══════════════════════════════════════════════════════════════════════════════
# CLAUDE CODE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

# Function to get Claude credentials from macOS Keychain
get_claude_credentials() {
    local creds
    creds=$(security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null)

    if [ -z "$creds" ]; then
        return 1
    fi

    echo "$creds"
}

# Function to extract Claude access token from credentials JSON
extract_claude_token() {
    local creds=$1
    local token

    token=$(echo "$creds" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'claudeAiOauth' in data and 'accessToken' in data['claudeAiOauth']:
        print(data['claudeAiOauth']['accessToken'])
    elif 'accessToken' in data:
        print(data['accessToken'])
    else:
        print('')
except:
    print('')
" 2>/dev/null)

    if [ -z "$token" ]; then
        return 1
    fi

    echo "$token"
}

# Function to fetch Claude usage data from API
fetch_claude_usage() {
    local token=$1

    local response
    response=$(curl -s -X GET "https://api.anthropic.com/api/oauth/usage" \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${token}" \
        -H "anthropic-beta: oauth-2025-04-20" \
        2>/dev/null)

    if [ -z "$response" ]; then
        return 1
    fi

    # Check for error in response
    local error
    error=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error', {}).get('message', ''))" 2>/dev/null)

    if [ -n "$error" ] && [ "$error" != "" ]; then
        return 1
    fi

    echo "$response"
}

# Function to display Claude usage
display_claude_usage() {
    local usage_data=$1

    local parsed
    parsed=$(echo "$usage_data" | python3 -c "
import sys, json

data = json.load(sys.stdin)

five_hour = data.get('five_hour', {})
seven_day = data.get('seven_day', {})
opus = data.get('seven_day_opus', {})

print(f\"five_hour_util:{five_hour.get('utilization', 0)}\")
print(f\"five_hour_reset:{five_hour.get('resets_at', 'null')}\")
print(f\"seven_day_util:{seven_day.get('utilization', 0)}\")
print(f\"seven_day_reset:{seven_day.get('resets_at', 'null')}\")
print(f\"opus_util:{opus.get('utilization', 0) if opus else 0}\")
print(f\"opus_reset:{opus.get('resets_at', 'null') if opus else 'null'}\")
" 2>/dev/null)

    local five_hour_util=$(echo "$parsed" | grep "five_hour_util:" | cut -d: -f2)
    local five_hour_reset=$(echo "$parsed" | grep "five_hour_reset:" | cut -d: -f2-)
    local seven_day_util=$(echo "$parsed" | grep "seven_day_util:" | cut -d: -f2)
    local seven_day_reset=$(echo "$parsed" | grep "seven_day_reset:" | cut -d: -f2-)
    local opus_util=$(echo "$parsed" | grep "opus_util:" | cut -d: -f2)
    local opus_reset=$(echo "$parsed" | grep "opus_reset:" | cut -d: -f2-)

    local five_hour_int=${five_hour_util%.*}
    local seven_day_int=${seven_day_util%.*}

    echo ""
    print_color "$BOLD$CYAN" "╔══════════════════════════════════════════════════════╗"
    print_color "$BOLD$CYAN" "║           Claude Code Usage Status                   ║"
    print_color "$BOLD$CYAN" "╚══════════════════════════════════════════════════════╝"
    echo ""

    print_color "$BOLD" "📊 5-Hour Rolling Window"
    echo -n "   Usage: "
    print_progress_bar "${five_hour_int:-0}"
    echo "   Time until reset: $(calculate_time_remaining "$five_hour_reset")"
    echo "   Resets at: $(format_reset_time "$five_hour_reset") UTC"
    echo ""

    print_color "$BOLD" "📅 7-Day Rolling Window"
    echo -n "   Usage: "
    print_progress_bar "${seven_day_int:-0}"
    echo "   Time until reset: $(calculate_time_remaining "$seven_day_reset")"
    echo "   Resets at: $(format_reset_time "$seven_day_reset") UTC"
    echo ""

    if [ "$opus_util" != "0" ] && [ "$opus_util" != "0.0" ]; then
        print_color "$BOLD" "🎭 Opus Usage (7-Day)"
        echo -n "   Usage: "
        local opus_int=${opus_util%.*}
        print_progress_bar "${opus_int:-0}"
        echo "   Time until reset: $(calculate_time_remaining "$opus_reset")"
        echo ""
    fi

    echo ""
    print_color "$BOLD" "Status:"

    if [ "${five_hour_int:-0}" -ge "$CRITICAL_THRESHOLD" ]; then
        print_color "$RED" "   ⚠️  CRITICAL: 5-hour limit nearly exhausted! Claude Code may pause soon."
        print_color "$YELLOW" "   ⏰ Wait $(calculate_time_remaining "$five_hour_reset") for reset."
    elif [ "${five_hour_int:-0}" -ge "$WARNING_THRESHOLD" ]; then
        print_color "$YELLOW" "   ⚡ WARNING: Approaching 5-hour limit. Consider slowing down."
    else
        print_color "$GREEN" "   ✅ 5-hour usage is healthy."
    fi

    if [ "${seven_day_int:-0}" -ge "$CRITICAL_THRESHOLD" ]; then
        print_color "$RED" "   ⚠️  CRITICAL: Weekly limit nearly exhausted!"
        print_color "$YELLOW" "   ⏰ Wait $(calculate_time_remaining "$seven_day_reset") for reset."
    elif [ "${seven_day_int:-0}" -ge "$WARNING_THRESHOLD" ]; then
        print_color "$YELLOW" "   ⚡ WARNING: Approaching weekly limit."
    else
        print_color "$GREEN" "   ✅ Weekly usage is healthy."
    fi

    echo ""
    print_color "$BOLD" "───────────────────────────────────────────────────────"
    print_color "$BLUE" "5-Hour Window: ${NC}Limits short-term burst usage. Resets every 5 hours"
    print_color "$BLUE" "               ${NC}from your first request in that window."
    print_color "$BLUE" "7-Day Window:  ${NC}Your total weekly allocation. Rolling 7-day limit"
    print_color "$BLUE" "               ${NC}that caps sustained usage over time."
    echo ""
}

# Claude compact output
display_claude_compact() {
    local usage_data=$1

    local parsed
    parsed=$(echo "$usage_data" | python3 -c "
import sys, json
data = json.load(sys.stdin)
five = data.get('five_hour', {}).get('utilization', 0)
seven = data.get('seven_day', {}).get('utilization', 0)
print(f'{five:.0f}|{seven:.0f}')
" 2>/dev/null)

    local five_hour=$(echo "$parsed" | cut -d'|' -f1)
    local seven_day=$(echo "$parsed" | cut -d'|' -f2)

    local status_icon="✅"
    if [ "${five_hour:-0}" -ge "$CRITICAL_THRESHOLD" ] || [ "${seven_day:-0}" -ge "$CRITICAL_THRESHOLD" ]; then
        status_icon="🔴"
    elif [ "${five_hour:-0}" -ge "$WARNING_THRESHOLD" ] || [ "${seven_day:-0}" -ge "$WARNING_THRESHOLD" ]; then
        status_icon="🟡"
    fi

    echo "$status_icon Claude: 5h:${five_hour}% | 7d:${seven_day}%"
}

# ═══════════════════════════════════════════════════════════════════════════════
# CURSOR FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

# Function to get Cursor session token from SQLite database
get_cursor_token() {
    local sqlite_path="$HOME/Library/Application Support/Cursor/User/globalStorage/state.vscdb"

    if [ ! -f "$sqlite_path" ]; then
        return 1
    fi

    # Extract the JWT token and convert to session token format
    local session_token
    session_token=$(python3 << 'PYTHON_SCRIPT'
import sqlite3
import os
import json

sqlite_path = os.path.expanduser("~/Library/Application Support/Cursor/User/globalStorage/state.vscdb")

try:
    conn = sqlite3.connect(sqlite_path)
    cursor = conn.cursor()

    # Try to get the access token
    cursor.execute("SELECT value FROM ItemTable WHERE key = 'cursorAuth/accessToken'")
    result = cursor.fetchone()

    if result and result[0]:
        jwt_token = result[0]
        # Decode JWT to get user ID (without verification)
        import base64
        parts = jwt_token.split('.')
        if len(parts) >= 2:
            # Add padding if needed
            payload = parts[1]
            padding = 4 - len(payload) % 4
            if padding != 4:
                payload += '=' * padding
            decoded = json.loads(base64.urlsafe_b64decode(payload))
            sub = decoded.get('sub', '')
            user_id = sub.split('|')[1] if '|' in sub else sub
            # Create session token format
            session_token = f"{user_id}%3A%3A{jwt_token}"
            print(session_token)

    conn.close()
except Exception as e:
    pass
PYTHON_SCRIPT
2>/dev/null)

    if [ -z "$session_token" ]; then
        return 1
    fi

    echo "$session_token"
}

# Function to fetch Cursor usage data
fetch_cursor_usage() {
    local session_token=$1

    # Extract user ID from session token
    local user_id
    user_id=$(echo "$session_token" | python3 -c "import sys; print(sys.stdin.read().strip().split('%3A%3A')[0])" 2>/dev/null)

    if [ -z "$user_id" ]; then
        return 1
    fi

    local response
    response=$(curl -sL -X GET "https://cursor.com/api/usage?user=${user_id}" \
        -H "Cookie: WorkosCursorSessionToken=${session_token}" \
        -H "Content-Type: application/json" \
        -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
        2>/dev/null)

    if [ -z "$response" ]; then
        return 1
    fi

    # Check if response is valid JSON with expected fields
    local valid
    valid=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'gpt-4' in data or 'gpt-3.5-turbo' in data or 'numRequests' in str(data):
        print('valid')
    else:
        print('')
except:
    print('')
" 2>/dev/null)

    if [ "$valid" != "valid" ]; then
        return 1
    fi

    echo "$response"
}

# Function to calculate Cursor reset info
calculate_cursor_reset() {
    local start_of_month=$1

    if [ -z "$start_of_month" ] || [ "$start_of_month" = "null" ]; then
        echo "reset_date:N/A"
        echo "time_remaining:N/A"
        return
    fi

    python3 -c "
from datetime import datetime, timedelta
import sys

try:
    start_str = '${start_of_month}'.replace('Z', '+00:00')
    start = datetime.fromisoformat(start_str.replace('.000', ''))

    # Calculate next reset (1 month from start)
    if start.month == 12:
        reset = start.replace(year=start.year + 1, month=1)
    else:
        reset = start.replace(month=start.month + 1)

    now = datetime.now(reset.tzinfo) if reset.tzinfo else datetime.now()

    # Format reset date
    reset_formatted = reset.strftime('%b %d, %Y at %I:%M %p')
    print(f'reset_date:{reset_formatted}')

    # Calculate time remaining
    diff = reset - now
    if diff.total_seconds() <= 0:
        print('time_remaining:Resetting now...')
    else:
        days = diff.days
        hours = diff.seconds // 3600
        minutes = (diff.seconds % 3600) // 60

        if days > 0:
            if days == 1:
                print(f'time_remaining:{days} day, {hours}h {minutes}m')
            else:
                print(f'time_remaining:{days} days, {hours}h {minutes}m')
        elif hours > 0:
            print(f'time_remaining:{hours}h {minutes}m')
        elif minutes > 0:
            print(f'time_remaining:{minutes}m')
        else:
            print('time_remaining:Less than a minute')
except Exception as e:
    print('reset_date:N/A')
    print('time_remaining:N/A')
" 2>/dev/null
}

# Function to display Cursor usage
display_cursor_usage() {
    local usage_data=$1

    local parsed
    parsed=$(echo "$usage_data" | python3 -c "
import sys, json

data = json.load(sys.stdin)

# Handle different API response formats
gpt4 = data.get('gpt-4', {})
gpt35 = data.get('gpt-3.5-turbo', {})

premium_used = gpt4.get('numRequests', 0)
premium_max = gpt4.get('maxRequestUsage', 500)
basic_used = gpt35.get('numRequests', 0)
basic_max = gpt35.get('maxRequestUsage', 0)
start_of_month = data.get('startOfMonth', '')

# Calculate percentage
if premium_max and premium_max > 0:
    premium_pct = min(100, int((premium_used / premium_max) * 100))
else:
    premium_pct = 0

print(f'premium_used:{premium_used}')
print(f'premium_max:{premium_max}')
print(f'premium_pct:{premium_pct}')
print(f'basic_used:{basic_used}')
print(f'basic_max:{basic_max}')
print(f'start_of_month:{start_of_month}')
" 2>/dev/null)

    local premium_used=$(echo "$parsed" | grep "premium_used:" | cut -d: -f2)
    local premium_max=$(echo "$parsed" | grep "premium_max:" | cut -d: -f2)
    local premium_pct=$(echo "$parsed" | grep "premium_pct:" | cut -d: -f2)
    local basic_used=$(echo "$parsed" | grep "basic_used:" | cut -d: -f2)
    local basic_max=$(echo "$parsed" | grep "basic_max:" | cut -d: -f2)
    local start_of_month=$(echo "$parsed" | grep "start_of_month:" | cut -d: -f2-)

    # Calculate reset info
    local reset_info
    reset_info=$(calculate_cursor_reset "$start_of_month")
    local reset_date=$(echo "$reset_info" | grep "reset_date:" | cut -d: -f2-)
    local time_remaining=$(echo "$reset_info" | grep "time_remaining:" | cut -d: -f2-)

    echo ""
    print_color "$BOLD$MAGENTA" "╔══════════════════════════════════════════════════════╗"
    print_color "$BOLD$MAGENTA" "║             Cursor Usage Status                      ║"
    print_color "$BOLD$MAGENTA" "╚══════════════════════════════════════════════════════╝"
    echo ""

    print_color "$BOLD" "⚡ Fast Requests (GPT-4/Claude)"
    echo -n "   Usage: "
    print_progress_bar "${premium_pct:-0}"
    echo "   Requests: ${premium_used:-0} / ${premium_max:-500}"
    echo "   Time until reset: ${time_remaining}"
    echo "   Resets at: ${reset_date}"
    echo ""

    print_color "$BOLD" "🐢 Slow Requests"
    print_color "$GREEN" "   Unlimited ${NC}(available after fast requests exhausted)"
    echo ""

    echo ""
    print_color "$BOLD" "Status:"

    if [ "${premium_pct:-0}" -ge "$CRITICAL_THRESHOLD" ]; then
        print_color "$RED" "   ⚠️  CRITICAL: Fast requests exhausted!"
        print_color "$YELLOW" "   ⏰ Wait ${time_remaining} for reset."
        print_color "$GREEN" "   💡 Slow requests still available (may have delays)."
    elif [ "${premium_pct:-0}" -ge "$WARNING_THRESHOLD" ]; then
        print_color "$YELLOW" "   ⚡ WARNING: Approaching fast request limit."
    else
        print_color "$GREEN" "   ✅ Fast request usage is healthy."
    fi

    echo ""
    print_color "$BOLD" "───────────────────────────────────────────────────────"
    print_color "$MAGENTA" "Fast:    ${NC}Priority requests (500/month). Resets on billing cycle."
    print_color "$MAGENTA" "Slow:    ${NC}Unlimited after fast exhausted (lower priority, may delay)."
    echo ""
}

# Cursor compact output
display_cursor_compact() {
    local usage_data=$1

    local parsed
    parsed=$(echo "$usage_data" | python3 -c "
import sys, json
data = json.load(sys.stdin)
gpt4 = data.get('gpt-4', {})
used = gpt4.get('numRequests', 0)
max_req = gpt4.get('maxRequestUsage', 500)
pct = min(100, int((used / max_req) * 100)) if max_req > 0 else 0
print(f'{pct}|{used}|{max_req}')
" 2>/dev/null)

    local pct=$(echo "$parsed" | cut -d'|' -f1)
    local used=$(echo "$parsed" | cut -d'|' -f2)
    local max_req=$(echo "$parsed" | cut -d'|' -f3)

    local status_icon="✅"
    if [ "${pct:-0}" -ge "$CRITICAL_THRESHOLD" ]; then
        status_icon="🔴"
    elif [ "${pct:-0}" -ge "$WARNING_THRESHOLD" ]; then
        status_icon="🟡"
    fi

    echo "$status_icon Cursor: ${used}/${max_req} (${pct}%)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

# Check Claude Code
check_claude() {
    local creds
    creds=$(get_claude_credentials)
    if [ $? -ne 0 ] || [ -z "$creds" ]; then
        if [ "$PROVIDER" = "claude" ]; then
            print_color "$RED" "Error: Could not retrieve Claude Code credentials from Keychain."
            print_color "$YELLOW" "Make sure you're logged into Claude Code (run 'claude' and authenticate first)."
            exit 1
        fi
        return 1
    fi

    local token
    token=$(extract_claude_token "$creds")
    if [ $? -ne 0 ] || [ -z "$token" ]; then
        if [ "$PROVIDER" = "claude" ]; then
            print_color "$RED" "Error: Could not extract Claude Code access token."
            exit 1
        fi
        return 1
    fi

    local usage_data
    usage_data=$(fetch_claude_usage "$token")
    if [ $? -ne 0 ] || [ -z "$usage_data" ]; then
        if [ "$PROVIDER" = "claude" ]; then
            print_color "$RED" "Error: Failed to fetch Claude Code usage data."
            exit 1
        fi
        return 1
    fi

    case "$OUTPUT_FORMAT" in
        compact)
            display_claude_compact "$usage_data"
            ;;
        json)
            echo "$usage_data" | python3 -m json.tool 2>/dev/null || echo "$usage_data"
            ;;
        *)
            display_claude_usage "$usage_data"
            ;;
    esac

    return 0
}

# Check Cursor
check_cursor() {
    local token
    token=$(get_cursor_token)
    if [ $? -ne 0 ] || [ -z "$token" ]; then
        if [ "$PROVIDER" = "cursor" ]; then
            print_color "$RED" "Error: Could not retrieve Cursor session token."
            print_color "$YELLOW" "Make sure Cursor is installed and you're logged in."
            exit 1
        fi
        return 1
    fi

    local usage_data
    usage_data=$(fetch_cursor_usage "$token")
    if [ $? -ne 0 ] || [ -z "$usage_data" ]; then
        if [ "$PROVIDER" = "cursor" ]; then
            print_color "$RED" "Error: Failed to fetch Cursor usage data."
            print_color "$YELLOW" "The API may have changed or your session may have expired."
            exit 1
        fi
        return 1
    fi

    case "$OUTPUT_FORMAT" in
        compact)
            display_cursor_compact "$usage_data"
            ;;
        json)
            echo "$usage_data" | python3 -m json.tool 2>/dev/null || echo "$usage_data"
            ;;
        *)
            display_cursor_usage "$usage_data"
            ;;
    esac

    return 0
}

# Main check function
main_check() {
    local claude_success=false
    local cursor_success=false

    case "$PROVIDER" in
        claude)
            check_claude
            ;;
        cursor)
            check_cursor
            ;;
        all|"")
            # Check both, show what's available
            if check_claude 2>/dev/null; then
                claude_success=true
            fi

            if check_cursor 2>/dev/null; then
                cursor_success=true
            fi

            if [ "$claude_success" = false ] && [ "$cursor_success" = false ]; then
                print_color "$RED" "Error: Could not retrieve usage data from any provider."
                print_color "$YELLOW" "Make sure you're logged into Claude Code or Cursor."
                exit 1
            fi
            ;;
    esac
}

# Watch mode
watch_usage() {
    local interval=${1:-60}

    print_color "$CYAN" "Watching AI CLI usage (refresh every ${interval}s). Press Ctrl+C to stop."
    echo ""

    while true; do
        clear
        main_check
        echo ""
        print_color "$BLUE" "Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
        print_color "$BLUE" "Next refresh in ${interval}s... (Ctrl+C to stop)"
        sleep "$interval"
    done
}

# Help message
show_help() {
    echo "AI CLI Usage Monitor"
    echo ""
    echo "Supports: Claude Code, Cursor"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -c, --compact    Show compact one-line output"
    echo "  -j, --json       Output raw JSON"
    echo "  -w, --watch [N]  Watch mode: refresh every N seconds (default: 60)"
    echo "  --claude         Check only Claude Code"
    echo "  --cursor         Check only Cursor"
    echo "  --all            Check all available providers (default)"
    echo ""
    echo "Examples:"
    echo "  $0               Show all available usage stats"
    echo "  $0 --claude      Show only Claude Code usage"
    echo "  $0 --cursor      Show only Cursor usage"
    echo "  $0 -c            Show compact status for all"
    echo "  $0 -c --claude   Show compact Claude status only"
    echo "  $0 -w 30         Watch mode with 30-second refresh"
    echo ""
    echo "Exit codes:"
    echo "  0  - Success"
    echo "  1  - Error (credentials, API, etc.)"
}

# Parse arguments
OUTPUT_FORMAT="full"
WATCH_MODE=false
WATCH_INTERVAL=60
PROVIDER="all"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--compact)
            OUTPUT_FORMAT="compact"
            shift
            ;;
        -j|--json)
            OUTPUT_FORMAT="json"
            shift
            ;;
        -w|--watch)
            WATCH_MODE=true
            if [[ $2 =~ ^[0-9]+$ ]]; then
                WATCH_INTERVAL=$2
                shift
            fi
            shift
            ;;
        --claude)
            PROVIDER="claude"
            shift
            ;;
        --cursor)
            PROVIDER="cursor"
            shift
            ;;
        --all)
            PROVIDER="all"
            shift
            ;;
        *)
            print_color "$RED" "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run
if [ "$WATCH_MODE" = true ]; then
    watch_usage "$WATCH_INTERVAL"
else
    main_check
fi
