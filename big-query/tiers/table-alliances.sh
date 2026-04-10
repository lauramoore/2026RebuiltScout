#!/bin/bash
# 1. Create the table once
#bq mk --table wrt-firebase-web-app:wrtScoutingApp.2026_alliances event_key:STRING,alliance_data:JSON

# 2. Now your load script never needs a schema again
# Just map your TBA data into those two columns.



# --- CONFIGURATION ---
TBA_KEY="rHkaQaWQanaSxLEffJGxcJLLyUkUROmR3eEzKsYZQyCdvahNAIBIhGY1BNBKkUrT"
PROJECT_ID="wrt-firebase-web-app"
DATASET_ID="wrtScoutingApp"
TABLE_NAME="2026_alliances"
YEAR="2026"
# Add your event codes here. For example: ("gaatl" "gacmp" "gaalb")
EVENT_CODES=("gadal" "gagwi" "gacol" "gaalb" "gagai")

if [ ${#EVENT_CODES[@]} -eq 0 ]; then
    echo "Please add event codes to the EVENT_CODES array in the script."
    exit 1
fi

# --- IMPROVED SCRIPT ---
# Create a temp file for the JSONL data
TMP_FILE=$(mktemp)

for code in "${EVENT_CODES[@]}"; do
    EVENT_KEY="${YEAR}${code}"
    API_URL="https://www.thebluealliance.com/api/v3/event/${EVENT_KEY}/alliances"

    echo "Fetching alliances for $EVENT_KEY..."

    # 1. Fetch and check if the API actually returned a valid JSON array
    RESPONSE=$(curl -s -H "X-TBA-Auth-Key: $TBA_KEY" "$API_URL")

    HTTP_STATUS="${RESPONSE: -3}"
    BODY="${RESPONSE:0:${#RESPONSE}-3}"

# 1. Check HTTP Status first
if [[ "$HTTP_STATUS" -ne 200 ]]; then
    echo "Error: API returned status $HTTP_STATUS for $EVENT_KEY"
    continue
fi

# 2. Check if it's a valid JSON array
if ! echo "$BODY" | jq -e 'type == "array"' > /dev/null; then
    echo "Warning: API did not return an array for $EVENT_KEY. Body: $BODY"
    continue
fi

    # 2. Transform and write to the temp file
    echo "$BODY" | jq -c --arg event "$EVENT_KEY" '.[] | {event_key: $event, alliance_data: .}' > "$TMP_FILE"

    # 3. Only run bq load if file is not empty
    if [ -s "$TMP_FILE" ]; then
        bq load \
            --project_id="$PROJECT_ID" \
            --autodetect \
            --source_format=NEWLINE_DELIMITED_JSON \
            "$DATASET_ID.$TABLE_NAME" \
            "$TMP_FILE"

        if [ $? -eq 0 ]; then
            echo "Successfully uploaded $EVENT_KEY"
        else
            echo "Error: BigQuery load failed for $EVENT_KEY"
        fi
    else
        echo "No alliance data for $EVENT_KEY. Skipping."
    fi
done

# Clean up
rm "$TMP_FILE"
