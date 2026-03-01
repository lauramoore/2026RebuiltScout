CREATE TABLE IF NOT EXISTS `wrt-firebase-web-app.wrtScoutingApp.team_scouting_data`(
  event_key STRING OPTIONS (description = "FRC event key, e.g., '2024casj'"),
  match_key STRING OPTIONS (description = "FRC match number, e.g., '1'"),
  team_number INT64 OPTIONS (description = "FRC team number, e.g., 2974"),
  scout_email STRING OPTIONS (description = "Email of the scout who collected the data"),
  auton STRUCT<
    starting_position STRING,
    scoring ARRAY<
      STRUCT<from_location STRING, capacity INT64, speed INT64, accuracy INT64>
    >,
    climb STRUCT<level INT64, start_time_sec INT64, dismount_time_sec INT64>
  >,
  teleop STRUCT<
    scoring ARRAY<
      STRUCT<from_location STRING, capacity INT64, speed INT64, accuracy INT64>
    >,
    defense ARRAY<STRUCT<defense_location STRING, effectiveness_rating INT64>>,
    passing ARRAY<
      STRUCT<
        from_location STRING,
        to_location STRING,
        capacity INT64,
        speed INT64,
        accuracy INT64
      >
    >,
    climb STRUCT<level INT64, start_time_sec INT64>
  >,
  penalties STRUCT<penalty_count INT64, foul_count INT64>,
  notes STRING OPTIONS (
    description = "General notes about the team's performance in the match"
  ),
  categories ARRAY<STRING> OPTIONS (
    description = "Qualitative tags, e.g., 'No Show', 'FAST_CYCLE'"
  ),
  last_updated TIMESTAMP OPTIONS (
    description = "Timestamp of when the record was last updated"
  )
)
PARTITION BY DATE(last_updated) 
CLUSTER BY event_key, team_number
OPTIONS (
    description = "latest scouting for a specific team in a specific match by scouter.",
    partition_expiration_days = 180,
    require_partition_filter = true
);git

