#!/bin/bash
# 1. Create the table once
bq mk --table wrt-firebase-web-app:wrtScoutingApp.2026_rankings event_key:STRING,ranking_data:RECORD

# 2. Now your load script never needs a schema again
#The --autodetect flag will infer the schema for the nested fields within the 'ranking_data' RECORD.

# --- CONFIGURATION ---
TBA_KEY="rHkaQaWQanaSxLEffJGxcJLLyUkUROmR3eEzKsYZQyCdvahNAIBIhGY1BNBKkUrT"
PROJECT_ID="wrt-firebase-web-app"
DATASET_ID="wrtScoutingApp"
TABLE_NAME="2026_rankings"
YEAR="2026"
# Add your event codes here. For example: ("gaatl" "gacmp" "gaalb")
EVENT_CODES=("gadal" "gagwi" "gacol" "gaalb" "gagai")

if [ ${#EVENT_CODES[@]} -eq 0 ]; then
    echo "Please add event codes to the EVENT_CODES array in the script."
    exit 1
fi

# --- SCRIPT ---
# Create a temp file for the JSONL data
TMP_FILE=$(mktemp)
# Ensure cleanup on exit
trap 'rm -f "$TMP_FILE"' EXIT

for code in "${EVENT_CODES[@]}"; do
    EVENT_KEY="${YEAR}${code}"
    API_URL="https://www.thebluealliance.com/api/v3/event/${EVENT_KEY}/rankings"

    echo "Fetching rankings for $EVENT_KEY..."

    BODY_FILE=$(mktemp)
    HTTP_STATUS=$(curl -s -w "%{http_code}" -o "$BODY_FILE" -H "X-TBA-Auth-Key: $TBA_KEY" "$API_URL")
    RESPONSE=$(<"$BODY_FILE")
    rm "$BODY_FILE"

    if [[ "$HTTP_STATUS" -ne 200 ]]; then
        echo "Error: API returned status $HTTP_STATUS for $EVENT_KEY"
        continue
    fi

    # Check if the response has a 'rankings' key which is a non-empty array
    if echo "$RESPONSE" | jq -e '.rankings | (type == "array" and length > 0)' > /dev/null; then
        # Write to temp file (Overwrite for this specific event)
        # We extract each element from the .rankings array
        echo "$RESPONSE" | jq -c --arg event "$EVENT_KEY" '.rankings[] | {event_key: $event, ranking_data: .}' > "$TMP_FILE"

        # Load to BQ
        bq load \
            --project_id="$PROJECT_ID" \
            --autodetect \
            --source_format=NEWLINE_DELIMITED_JSON \
            "$DATASET_ID.$TABLE_NAME" "$TMP_FILE"

        if [ $? -eq 0 ]; then
            echo "Successfully uploaded rankings for $EVENT_KEY"
        else
            echo "Error: BigQuery load failed for $EVENT_KEY"
        fi
    else
        echo "No valid ranking data found for $EVENT_KEY (or event hasn't happened yet)."
    fi
done