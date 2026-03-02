CREATE OR REPLACE TABLE `wrt-firebase-web-app.wrtScoutingApp.team_performance_summary`
CLUSTER BY event_key, team_number
OPTIONS(
  description="Aggregated performance metrics for each team across all events. Provides min, max, and average for scoring, passing, and defense actions, plus average cycle counts. This table is intended to be updated via a scheduled query."
)
AS
WITH
base_teams AS (
  -- Establish a base list of all teams that have been scouted for an event
  SELECT DISTINCT event_key, team_number
  FROM `wrt-firebase-web-app.wrtScoutingApp.team_scouting_data`
  -- The base table requires a partition filter.
  -- Since this is for a scheduled query, we can use CURRENT_DATE.
  -- The base table also expires partitions after 180 days, so this filter is safe.
  WHERE DATE(last_updated) >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
),
auton_scoring_agg AS (
  -- Aggregate autonomous scoring stats across all matches for a team at an event
  SELECT
    event_key,
    team_number,
    MIN(s.capacity) AS min_capacity,
    MAX(s.capacity) AS max_capacity,
    AVG(s.capacity) AS avg_capacity,
    MIN(s.speed) AS min_speed,
    MAX(s.speed) AS max_speed,
    AVG(s.speed) AS avg_speed,
    MIN(s.accuracy) AS min_accuracy,
    MAX(s.accuracy) AS max_accuracy,
    AVG(s.accuracy) AS avg_accuracy
  FROM `wrt-firebase-web-app.wrtScoutingApp.team_scouting_data`, UNNEST(auton.scoring) AS s
  WHERE DATE(last_updated) >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
  GROUP BY event_key, team_number
),
teleop_scoring_agg AS (
  -- Aggregate teleop scoring stats across all matches for a team at an event
  SELECT
    event_key,
    team_number,
    MIN(s.capacity) AS min_capacity,
    MAX(s.capacity) AS max_capacity,
    AVG(s.capacity) AS avg_capacity,
    MIN(s.speed) AS min_speed,
    MAX(s.speed) AS max_speed,
    AVG(s.speed) AS avg_speed,
    MIN(s.accuracy) AS min_accuracy,
    MAX(s.accuracy) AS max_accuracy,
    AVG(s.accuracy) AS avg_accuracy
  FROM `wrt-firebase-web-app.wrtScoutingApp.team_scouting_data`, UNNEST(teleop.scoring) AS s
  WHERE DATE(last_updated) >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
  GROUP BY event_key, team_number
),
teleop_passing_agg AS (
  -- Aggregate teleop passing stats across all matches for a team at an event
  SELECT
    event_key,
    team_number,
    MIN(p.capacity) AS min_capacity,
    MAX(p.capacity) AS max_capacity,
    AVG(p.capacity) AS avg_capacity,
    MIN(p.speed) AS min_speed,
    MAX(p.speed) AS max_speed,
    AVG(p.speed) AS avg_speed,
    MIN(p.accuracy) AS min_accuracy,
    MAX(p.accuracy) AS max_accuracy,
    AVG(p.accuracy) AS avg_accuracy
  FROM `wrt-firebase-web-app.wrtScoutingApp.team_scouting_data`, UNNEST(teleop.passing) AS p
  WHERE DATE(last_updated) >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
  GROUP BY event_key, team_number
),
teleop_defense_agg AS (
  -- Aggregate teleop defense stats across all matches for a team at an event
  SELECT
    event_key,
    team_number,
    MIN(d.effectiveness_rating) AS min_rating,
    MAX(d.effectiveness_rating) AS max_rating,
    AVG(d.effectiveness_rating) AS avg_rating
  FROM `wrt-firebase-web-app.wrtScoutingApp.team_scouting_data`, UNNEST(teleop.defense) AS d
  WHERE DATE(last_updated) >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
  GROUP BY event_key, team_number
),
match_cycles AS (
  -- Calculate the cycles for each match by type, averaging if multiple scouts covered the same match
  SELECT
    event_key,
    team_number,
    match_key,
    AVG(ARRAY_LENGTH(auton.scoring)) AS avg_auton_cycles,
    AVG(ARRAY_LENGTH(teleop.scoring)) AS avg_teleop_cycles,
    AVG(ARRAY_LENGTH(auton.scoring) + ARRAY_LENGTH(teleop.scoring)) AS avg_total_cycles
  FROM `wrt-firebase-web-app.wrtScoutingApp.team_scouting_data`
  WHERE DATE(last_updated) >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
  GROUP BY event_key, team_number, match_key
),
avg_cycles_per_team AS (
  -- Calculate the average cycles per match for a team across an entire event, broken down by type
  SELECT
    event_key,
    team_number,
    AVG(avg_auton_cycles) AS avg_auton_cycles_per_match,
    AVG(avg_teleop_cycles) AS avg_teleop_cycles_per_match,
    AVG(avg_total_cycles) AS avg_total_cycles_per_match
  FROM match_cycles
  GROUP BY event_key, team_number
)
-- Join all the aggregated data together
SELECT
  bt.event_key,
  bt.team_number,
  (SELECT AS STRUCT auton.* EXCEPT(event_key, team_number)) AS auton_scoring_stats,
  (SELECT AS STRUCT teleop.* EXCEPT(event_key, team_number)) AS teleop_scoring_stats,
  (SELECT AS STRUCT pass.* EXCEPT(event_key, team_number)) AS teleop_passing_stats,
  (SELECT AS STRUCT defense.* EXCEPT(event_key, team_number)) AS teleop_defense_stats,
  STRUCT(
    cycles.avg_auton_cycles_per_match,
    cycles.avg_teleop_cycles_per_match,
    cycles.avg_total_cycles_per_match
  ) AS cycle_stats
FROM base_teams AS bt
LEFT JOIN auton_scoring_agg AS auton ON bt.event_key = auton.event_key AND bt.team_number = auton.team_number
LEFT JOIN teleop_scoring_agg AS teleop ON bt.event_key = teleop.event_key AND bt.team_number = teleop.team_number
LEFT JOIN teleop_passing_agg AS pass ON bt.event_key = pass.event_key AND bt.team_number = pass.team_number
LEFT JOIN teleop_defense_agg AS defense ON bt.event_key = defense.event_key AND bt.team_number = defense.team_number
LEFT JOIN avg_cycles_per_team AS cycles ON bt.event_key = cycles.event_key AND bt.team_number = cycles.team_number;
