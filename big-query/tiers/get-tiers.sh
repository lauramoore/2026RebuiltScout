-- This query joins team rankings with their alliance selection data.
-- It provides a consolidated view of a team's rank, which alliance they were on,
-- and their pick order within that alliance for each event.

WITH alliance_picks AS (
  -- First, create a CTE to flatten the alliance data.
  -- For each event, this unnests the alliance members to get one row per team pick.
  SELECT 
    event_key,
    -- The alliance name is stored in the JSON data, e.g., "Alliance 1"
    alliance_data.name AS alliance_name, 
    -- Unnest the array of team keys in the 'picks' field
    team_key,
    -- The pick_index is the 0-based index in the 'picks' array (0=captain, 1=1st pick, etc.)
    pick_index
  FROM `wrt-firebase-web-app.wrtScoutingApp.2026_alliances`,
  UNNEST(alliance_data.picks) AS team_key WITH OFFSET AS pick_index
)
SELECT 
  -- The team_key and rank come from the rankings table
  r.ranking_data.team_key,
  r.event_key,
  r.ranking_data.rank,
  -- Extract the alliance number from the name (e.g., "Alliance 7" -> 7).
  -- If a team was not picked (i.e., no match in the LEFT JOIN), this will be NULL. We coalesce it to 0.
  COALESCE(CAST(REGEXP_EXTRACT(a.alliance_name, r'\d+') AS INT64), 0) AS alliance,
  -- The pick_index (0 for captain, 1 for 1st pick, etc.).
  -- If a team was not picked, this will be NULL. We coalesce it to -1.
  COALESCE(a.pick_index, -1) AS pick_index
FROM `wrt-firebase-web-app.wrtScoutingApp.2026_rankings` AS r
LEFT JOIN alliance_picks AS a 
  ON r.ranking_data.team_key = a.team_key AND r.event_key = a.event_key
ORDER BY r.ranking_data.rank, pick_index;