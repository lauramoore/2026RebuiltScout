#!/bin/bash

# Configuration
PROJECT="wrt-firebase-web-app"
LOCATION="us"
DATASET="wrtScoutingApp"
TABLE_PREFIX="match_scouting"

# Use ONLY the collection name here
COLLECTION_ID="scouting"

echo "🚀 Starting catch-up sync for all '$COLLECTION_ID' subcollections..."

npx @firebaseextensions/fs-bq-import-collection \
  --project=$PROJECT \
  --big-query-project=$PROJECT \
  --dataset-location=$LOCATION \
  --source-collection-path=$COLLECTION_ID \
  --dataset=$DATASET \
  --table-name-prefix=$TABLE_PREFIX \
  --batch-size=500 \
  --query-collection-group=true \
  --non-interactive