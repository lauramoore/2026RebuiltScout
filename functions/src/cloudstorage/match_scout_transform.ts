import { onRequest } from "firebase-functions/v2/https";

// Interfaces based on scouting-schema.json
interface Cycle {
  capacity: number;
  speed: number;
  accuracy: number;
}

interface DefenseCycle {
  effective: number;
}

export const transformScoutingData = onRequest((req, res) => {
  const payload = req.body;
  const data = payload.data;
  const resource = payload.context.resource;

  // 1. Extract Identifiers
  const pathParts = resource.split('/');
  const documentId = pathParts[pathParts.length - 1];
  // Example path: projects/.../databases/(default)/documents/events/{eventId}/matches/{matchId}
  const eventId = pathParts[pathParts.indexOf('events') + 1] || 'unknown';

  // 2. Helper for cycle math
  const summarizeCycles = (cycles: Cycle[] = []) => {
    if (!cycles.length) {
      return {
        count: 0,
        total_cap: 0,
        avg_speed: 0, min_speed: 0, max_speed: 0,
        avg_acc: 0, min_acc: 0, max_acc: 0,
      };
    }

    const totals = cycles.reduce((acc, c) => ({
      speed: acc.speed + (c.speed || 0),
      accuracy: acc.accuracy + (c.accuracy || 0),
      capacity: acc.capacity + (c.capacity || 0)
    }), { speed: 0, accuracy: 0, capacity: 0 });

    const speeds = cycles.map(c => c.speed || 0);
    const accuracies = cycles.map(c => c.accuracy || 0);

    return {
      count: cycles.length,
      total_cap: totals.capacity,
      avg_speed: Number((totals.speed / cycles.length).toFixed(2)),
      min_speed: Math.min(...speeds),
      max_speed: Math.max(...speeds),
      avg_acc: Number((totals.accuracy / cycles.length).toFixed(2)),
      min_acc: Math.min(...accuracies),
      max_acc: Math.max(...accuracies),
    };
  };

  const summarizeDefense = (cycles: DefenseCycle[] = []) => {
    if (!cycles.length) {
      return {
        count: 0,
        avg_effectiveness: 0,
        min_effectiveness: 0,
        max_effectiveness: 0,
      };
    }
    const effectiveness_scores = cycles.map(c => c.effective || 0);
    const totalEffect = effectiveness_scores.reduce((acc, e) => acc + e, 0);
    return {
      count: cycles.length,
      avg_effectiveness: Number((totalEffect / cycles.length).toFixed(2)),
      min_effectiveness: Math.min(...effectiveness_scores),
      max_effectiveness: Math.max(...effectiveness_scores),
    };
  };

  // 3. Perform Calculations
  const autonScoreStats = summarizeCycles(data.auton?.scoring);
  const teleopScoreStats = summarizeCycles(data.teleop?.scoring);
  const passingStats = summarizeCycles(data.teleop?.passing);
  const defenseStats = summarizeDefense(data.teleop?.defense);

  // 4. Construct Final Flat Object
  const flattened = {
    // Metadata
    document_id: documentId,
    event_id: eventId,
    team: data.team,
    match_id: data.match,
    scout: data.scout,
    scout_uid: data.scout_uid,
    last_updated: data.lastUpdated,

    // Auton
    auton_score_count: autonScoreStats.count,
    auton_score_total_cap: autonScoreStats.total_cap,
    auton_score_avg_speed: autonScoreStats.avg_speed,
    auton_score_min_speed: autonScoreStats.min_speed,
    auton_score_max_speed: autonScoreStats.max_speed,
    auton_score_avg_accuracy: autonScoreStats.avg_acc,
    auton_score_min_accuracy: autonScoreStats.min_acc,
    auton_score_max_accuracy: autonScoreStats.max_acc,
    auton_climb_level: data.auton?.climb?.level || 0,

    // Teleop Scoring
    teleop_score_count: teleopScoreStats.count,
    teleop_score_total_cap: teleopScoreStats.total_cap,
    teleop_score_avg_speed: teleopScoreStats.avg_speed,
    teleop_score_min_speed: teleopScoreStats.min_speed,
    teleop_score_max_speed: teleopScoreStats.max_speed,
    teleop_score_avg_accuracy: teleopScoreStats.avg_acc,
    teleop_score_min_accuracy: teleopScoreStats.min_acc,
    teleop_score_max_accuracy: teleopScoreStats.max_acc,

    // Passing & Defense
    teleop_pass_count: passingStats.count,
    teleop_pass_total_cap: passingStats.total_cap,
    teleop_pass_avg_speed: passingStats.avg_speed,
    teleop_pass_min_speed: passingStats.min_speed,
    teleop_pass_max_speed: passingStats.max_speed,
    teleop_pass_avg_accuracy: passingStats.avg_acc,
    teleop_pass_min_accuracy: passingStats.min_acc,
    teleop_pass_max_accuracy: passingStats.max_acc,

    // Teleop Defense
    teleop_defense_count: defenseStats.count,
    teleop_defense_avg_effective: defenseStats.avg_effectiveness,
    teleop_defense_min_effective: defenseStats.min_effectiveness,
    teleop_defense_max_effective: defenseStats.max_effectiveness,

    // Teleop Climb
    teleop_climb_level: data.teleop?.climb?.level || 0,

    // Observations
    notes: data.observations?.notes || "",
    categories: data.observations?.categories?.join(", ") || "",
    cat_broken: data.observations?.categories?.includes("broken") || false,
    cat_noshow: data.observations?.categories?.includes("no-show") || false,

    // Penalties
    foul_count: data.penalties?.fouls || 0,
    penalty_count: data.penalties?.penalties || 0,
  };

  res.status(200).send(flattened);
});
