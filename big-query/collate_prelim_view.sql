CREATE OR REPLACE VIEW `wrt-firebase-web-app.wrtScoutingApp.worlds_prelim_v`
AS
WITH
  raw_data AS (
    SELECT
      JSON_VALUE(t.path_params, '$.compId') AS event_key,
      JSON_VALUE(t.data, '$.team') AS match_key,
      SAFE_CAST(JSON_VALUE(t.data, '$.match') AS INT64) AS team_number,
      JSON_VALUE(t.data, '$.scout') AS scout_email,
      JSON_VALUE(t.data, '$.teleop.driverSkill') AS driver_skill,
      STRUCT(
        JSON_VALUE(t.data, '$.auton.startAt') AS starting_position,
        ARRAY(
          SELECT AS STRUCT
            JSON_VALUE(scori ng_item, '$.fromLocation') AS from_location,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.capacity') AS INT64)
              AS capacity,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.speed') AS INT64) AS speed,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.accuracy') AS INT64)
              AS accuracy
          FROM
            UNNEST(JSON_QUERY_ARRAY(t.data, '$.auton.scoring')) AS scoring_item
        ) AS scoring,
        STRUCT(
          SAFE_CAST(JSON_VALUE(t.data, '$.auton.climb.level') AS INT64)
            AS level,
          SAFE_CAST(JSON_VALUE(t.data, '$.auton.climb.start') AS INT64)
            AS start_time_sec,
          SAFE_CAST(JSON_VALUE(t.data, '$.auton.climb.dismount') AS INT64)
            AS dismount_time_sec)
          AS climb)
        AS auton,
      STRUCT(
        ARRAY(
          SELECT AS STRUCT
            JSON_VALUE(scoring_item, '$.from') AS from_location,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.capacity') AS INT64)
              AS capacity,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.speed') AS INT64) AS speed,
            SAFE_CAST(JSON_VALUE(scoring_item, '$.accuracy') AS INT64)
              AS accuracy
          FROM
            UNNEST(JSON_QUERY_ARRAY(t.data, '$.teleop.scoring')) AS scoring_item
        ) AS scoring,
        ARRAY(
          SELECT AS STRUCT
            JSON_VALUE(defense_item, '$.defenseLocation') AS defense_location,
            SAFE_CAST(JSON_VALUE(defense_item, '$.effective') AS INT64)
              AS effectiveness_rating
          FROM
            UNNEST(JSON_QUERY_ARRAY(t.data, '$.teleop.defense')) AS defense_item
        ) AS defense,
        ARRAY(
          SELECT AS STRUCT
            JSON_VALUE(passing_item, '$.fromLocation') AS from_location,
            SAFE_CAST(JSON_VALUE(passing_item, '$.capacity') AS INT64)
              AS capacity,
            SAFE_CAST(JSON_VALUE(passing_item, '$.passing') AS INT64) AS pass_effectivness,
            SAFE_CAST(JSON_VALUE(passing_item, '$.bulldozing') AS INT64) bulldoze_effectiveness 
              AS accuracy
          FROM
            UNNEST(JSON_QUERY_ARRAY(t.data, '$.teleop.passing')) AS passing_item
        ) AS passing,
        STRUCT(
          SAFE_CAST(JSON_VALUE(t.data, '$.teleop.climb.level') AS INT64)
            AS level,
          SAFE_CAST(JSON_VALUE(t.data, '$.teleop.climb.start') AS INT64)
            AS start_time_sec)
          AS climb)
        AS teleop,
      STRUCT(
        SAFE_CAST(JSON_VALUE(t.data, '$.penalties.penalties') AS INT64)
          AS penalty_count,
        SAFE_CAST(JSON_VALUE(t.data, '$.penalties.fouls') AS INT64)
          AS foul_count)
        AS penalties,
      JSON_VALUE(t.data, '$.observations.notes') AS notes,
      ARRAY(
        SELECT JSON_VALUE(category_item)
        FROM
          UNNEST(JSON_QUERY_ARRAY(t.data, '$.observations.categories'))
            AS category_item
      ) AS categories,
      t.timestamp AS last_updated
    FROM `wrt-firebase-web-app.wrtScoutingApp.match_scouting_raw_changelog` AS t
  )
SELECT *
FROM raw_data
QUALIFY
  ROW_NUMBER()
    OVER (
      PARTITION BY event_key, match_key, team_number, scout_email
      ORDER BY last_updated DESC
    )
  = 1;

