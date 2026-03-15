import { onRequest } from "firebase-functions/v2/https";
import {
  ScoutingData,
  FlattenedScoutingRow,
  DefenseCycle
} from "./scout_types.js";

// The payload structure for the HTTP request body.
interface FirestoreEventPayload {
  data: ScoutingData;
  context: {
    resource: string;
  };
}

// A cycle that can be summarized by summarizeCycles
interface SummarizableCycle {
  capacity: number;
  speed: number;
  accuracy: number;
}

export const transformScoutingData = onRequest(async (req, res) => {
  const payload = req.body as FirestoreEventPayload;
  const data = payload.data || {};
  const resource = payload.context?.resource || "";

  // 1. Extract Identifiers
  const pathParts = resource.split('/');
  const documentId = pathParts[pathParts.length - 1];
  // Example path: projects/.../databases/(default)/documents/events/{eventId}/matches/{matchId}
  const eventId = pathParts[pathParts.indexOf('events') + 1] || 'unknown';

  // 2. Helper for cycle math
  const summarizeCycles = (cycles: SummarizableCycle[] = []) => {
    if (!cycles.length) {
      return {
        count: 0,
        avg_cap: 0, min_cap: 0, max_cap: 0,
        avg_speed: 0, min_speed: 0, max_speed: 0,
        avg_accuracy: 0, min_accuracy: 0, max_accuracy: 0,
      };
    }

    const totals = cycles.reduce((acc, c) => ({
      speed: acc.speed + (c.speed || 0),
      accuracy: acc.accuracy + (c.accuracy || 0),
      capacity: acc.capacity + (c.capacity || 0)
    }), { speed: 0, accuracy: 0, capacity: 0 });

    const speeds = cycles.map(c => c.speed || 0);
    const accuracies = cycles.map(c => c.accuracy || 0);
    const capacities = cycles.map(c => c.capacity || 0);

    return {
      count: cycles.length,
      avg_cap: Number((totals.capacity / cycles.length).toFixed(2)),
      max_cap: Math.max(... capacities),
      min_cap: Math.min(... capacities),
      avg_speed: Number((totals.speed / cycles.length).toFixed(2)),
      min_speed: Math.min(...speeds),
      max_speed: Math.max(...speeds),
      avg_accuracy: Number((totals.accuracy / cycles.length).toFixed(2)),
      min_accuracy: Math.min(...accuracies),
      max_accuracy: Math.max(...accuracies),
    };
  };

  const summarizeDefense = (cycles: DefenseCycle[] = []) => {
    if (!cycles.length) {
      return {
        count: 0,
        avg_effective: 0,
        min_effective: 0,
        max_effective: 0,
      };
    }
    const effectiveness_scores = cycles.map(c => c.effective || 0);
    const totalEffect = effectiveness_scores.reduce((acc, e) => acc + e, 0);
    return {
      count: cycles.length,
      avg_effective: Number((totalEffect / cycles.length).toFixed(2)),
      min_effective: Math.min(...effectiveness_scores),
      max_effective: Math.max(...effectiveness_scores),
    };
  };

  // 3. Perform Calculations
  const autonScoreStats = summarizeCycles(data.auton?.scoring);
  const teleopScoreStats = summarizeCycles(data.teleop?.scoring);
  const passingStats = summarizeCycles(data.teleop?.passing);
  const defenseStats = summarizeDefense(data.teleop?.defense);

  // 4. Construct Final Flat Object
  const flattened: FlattenedScoutingRow = {
    // Metadata
    document_id: documentId,
    event_id: eventId,
    team: data.team || "",
    match_id: data.match || "",
    scout: data.scout || "",
    scout_uid: data.scout_uid || "",
    last_updated: data.lastUpdated || "",

    // Auton
    auto_score_cycles: autonScoreStats.count,
    auto_score_avg_cap: autonScoreStats.avg_cap,
    auto_score_max_cap: autonScoreStats.max_cap,
    auto_score_min_cap: autonScoreStats.min_cap,
    auto_score_avg_speed: autonScoreStats.avg_speed,
    auto_score_min_speed: autonScoreStats.min_speed,
    auto_score_max_speed: autonScoreStats.max_speed,
    auto_score_avg_accuracy: autonScoreStats.avg_accuracy,
    auto_score_min_accuracy: autonScoreStats.min_accuracy,
    auto_score_max_accuracy: autonScoreStats.max_accuracy,
    auto_climb_level: data.auton?.climb?.level || 0,
    auto_climb_speed: data.auton?.climb?.start || 0,
    auto_dismount_speed: data.auton?.climb?.dismount || 0,

    // Teleop Scoring
    tele_score_cycles: teleopScoreStats.count,
    tele_score_avg_cap: teleopScoreStats.avg_cap,
    tele_score_min_cap: teleopScoreStats.min_cap,
    tele_score_max_cap: teleopScoreStats.max_cap,
    tele_score_avg_speed: teleopScoreStats.avg_speed,
    tele_score_min_speed: teleopScoreStats.min_speed,
    tele_score_max_speed: teleopScoreStats.max_speed,
    tele_score_avg_accuracy: teleopScoreStats.avg_accuracy,
    tele_score_min_accuracy: teleopScoreStats.min_accuracy,
    tele_score_max_accuracy: teleopScoreStats.max_accuracy,

    // Passing & Defense
    tele_pass_cycles: passingStats.count,
    tele_pass_avg_cap: passingStats.avg_cap,
    tele_pass_max_cap: passingStats.max_cap,
    tele_pass_min_cap: passingStats.min_cap,
    tele_pass_avg_speed: passingStats.avg_speed,
    tele_pass_min_speed: passingStats.min_speed,
    tele_pass_max_speed: passingStats.max_speed,
    tele_pass_avg_accuracy: passingStats.avg_accuracy,
    tele_pass_min_accuracy: passingStats.min_accuracy,
    tele_pass_max_accuracy: passingStats.max_accuracy,

    // Teleop Defense
    tele_defense_cycles: defenseStats.count,
    tele_defense_avg_effective: defenseStats.avg_effective,
    tele_defense_min_effective: defenseStats.min_effective,
    tele_defense_max_effective: defenseStats.max_effective,

    // Teleop Climb
    tele_climb_level: data.teleop?.climb?.level || 0,

    // Observations
    notes: data.observations?.notes || "",
    categories: data.observations?.categories?.join(", ") || "",

    // Penalties
    foul_count: data.penalties?.fouls || 0,
    penalty_count: data.penalties?.penalties || 0,
  };

  res.status(200).send(flattened);
});
