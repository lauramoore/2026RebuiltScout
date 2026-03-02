MERGE `wrt-firebase-web-app.wrtScoutingApp.team_scouting_data` T
USING (
  -- 1. De-duplicate source data inside the USING subquery
  SELECT * FROM (
    SELECT
      JSON_VALUE(t.path_params, '$.compId') AS event_key,
      JSON_VALUE(t.path_params, '$.matchid') AS match_key,
      SAFE_CAST(JSON_VALUE(t.data, '$.team') AS INT64) AS team_number,
      JSON_VALUE(t.data, '$.scout') AS scout_email,
      -- Complex Struct Mapping
      STRUCT(
        JSON_VALUE(t.data, '$.auton.startAt') AS starting_position,
        ARRAY(
          SELECT AS STRUCT
            JSON_VALUE(scoring_item, '$.fromLocation') AS from_location,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.capacity') AS INT64) AS capacity,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.speed') AS INT64) AS speed,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.accuracy') AS INT64) AS accuracy
          FROM UNNEST(JSON_QUERY_ARRAY(t.data, '$.auton.scoring')) AS scoring_item
        ) AS scoring,
        STRUCT(
          SAFE_CAST(JSON_VALUE(t.data, '$.auton.climb.level') AS INT64) AS level,
          SAFE_CAST(JSON_VALUE(t.data, '$.auton.climb.start') AS INT64) AS start_time_sec,
          SAFE_CAST(JSON_VALUE(t.data, '$.auton.climb.dismount') AS INT64) AS dismount_time_sec
        ) AS climb
      ) AS auton,
      STRUCT(
        ARRAY(
          SELECT AS STRUCT
            JSON_VALUE(scoring_item, '$.from') AS from_location,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.capacity') AS INT64) AS capacity,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.speed') AS INT64) AS speed,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.accuracy') AS INT64) AS accuracy
          FROM UNNEST(JSON_QUERY_ARRAY(t.data, '$.teleop.scoring')) AS scoring_item
        ) AS scoring,
        ARRAY(
          SELECT AS STRUCT
            JSON_VALUE(defense_item, '$.defenseLocation') AS defense_location,
            SAFE_CAST(JSON_VALUE(defense_item, '$.effective') AS INT64) AS effectiveness_rating
          FROM UNNEST(JSON_QUERY_ARRAY(t.data, '$.teleop.defense')) AS defense_item
        ) AS defense,
        ARRAY(
          SELECT AS STRUCT
            JSON_VALUE(passing_item, '$.fromLocation') AS from_location,
            JSON_VALUE(passing_item, '$.toLocation') AS to_location,
            SAFE_CAST(JSON_VALUE(passing_item, '$.capacity') AS INT64) AS capacity,
            SAFE_CAST(JSON_VALUE(passing_item, '$.speed') AS INT64) AS speed,
            SAFE_CAST(JSON_VALUE(passing_item, '$.accuracy') AS INT64) AS accuracy
          FROM UNNEST(JSON_QUERY_ARRAY(t.data, '$.teleop.passing')) AS passing_item
        ) AS passing,
        STRUCT(
          SAFE_CAST(JSON_VALUE(t.data, '$.teleop.climb.level') AS INT64) AS level,
          SAFE_CAST(JSON_VALUE(t.data, '$.teleop.climb.start') AS INT64) AS start_time_sec
        ) AS climb
      ) AS teleop,
      STRUCT(
        SAFE_CAST(JSON_VALUE(t.data, '$.penalties.penalties') AS INT64) AS penalty_count,
        SAFE_CAST(JSON_VALUE(t.data, '$.penalties.fouls') AS INT64) AS foul_count
      ) AS penalties,
      JSON_VALUE(t.data, '$.observations.notes') AS notes,
      ARRAY(
        SELECT category_item
        FROM UNNEST(JSON_QUERY_ARRAY(t.data, '$.observations.categories')) AS category_item
      ) AS categories,
      t.timestamp AS last_updated
    FROM `wrt-firebase-web-app.wrtScoutingApp.match_scouting_raw_latest` AS t
    -- Filter raw source to only look at recent data for performance
    WHERE t.timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  )
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY event_key, match_key, team_number, scout_email
    ORDER BY last_updated DESC
  ) = 1
) S
ON T.event_key = S.event_key
  AND T.match_key = S.match_key
  AND T.team_number = S.team_number
  AND T.scout_email = S.scout_email
  -- 2. FIX: Pruning the target table partitions
  -- Ensure T.last_updated is the partition column
  AND T.last_updated >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 180 DAY)

-- 3. Update existing records only if the source is newer
WHEN MATCHED AND S.last_updated > T.last_updated THEN
  UPDATE SET
    auton = S.auton,
    teleop = S.teleop,
    penalties = S.penalties,
    notes = S.notes,
    categories = S.categories,
    last_updated = S.last_updated

-- 4. Insert new records
WHEN NOT MATCHED BY TARGET THEN
  INSERT (event_key, match_key, team_number, scout_email, auton, teleop, penalties, notes, categories, last_updated)
  VALUES (S.event_key, S.match_key, S.team_number, S.scout_email, S.auton, S.teleop, S.penalties, S.notes, S.categories, S.last_updated);