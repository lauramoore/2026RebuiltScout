// types.ts

export interface ScoutingData {
  team: string;
  match: string;
  scout: string;
  scout_uid: string;
  lastUpdated: string;
  auton?: {
    scoring?: ScoringCycle[];
    climb?: {
      level?: number;
      start?: number;
      dismount?: number;
    };
  };
  teleop?: {
    scoring?: ScoringCycle[];
    passing?: PassingCycle[];
    defense?: DefenseCycle[];
    climb?: { level: number };
  };
  penalties?: {
    fouls?: number;
    penalties?: number;
  };
  observations: {
    notes?: string;
    categories: string[];
  };
}

export interface FlattenedScoutingRow {
  // Metadata
  document_id: string;
  event_id: string;
  team: string;
  match_id: string;
  scout: string;
  scout_uid: string;
  last_updated: string;

  // Auton Scoring
  auto_score_cycles: number;
  auto_score_avg_cap: number;
  auto_score_max_cap: number;
  auto_score_min_cap: number;
  auto_score_avg_speed: number;
  auto_score_min_speed: number;
  auto_score_max_speed: number;
  auto_score_avg_accuracy: number;
  auto_score_min_accuracy: number;
  auto_score_max_accuracy: number;

  // Auton Climb
  auto_climb_level: number;
  auto_climb_speed: number;
  auto_dismount_speed: number;

  // Teleop Scoring
  tele_score_cycles: number;
  tele_score_avg_cap: number;
  tele_score_max_cap: number;
  tele_score_min_cap: number;
  tele_score_avg_speed: number;
  tele_score_min_speed: number;
  tele_score_max_speed: number;
  tele_score_avg_accuracy: number;
  tele_score_min_accuracy: number;
  tele_score_max_accuracy: number;

  // Teleop Passing
  tele_pass_cycles: number;
  tele_pass_avg_cap: number;
  tele_pass_max_cap: number;
  tele_pass_min_cap: number;
  tele_pass_avg_speed: number;
  tele_pass_min_speed: number;
  tele_pass_max_speed: number;
  tele_pass_avg_accuracy: number;
  tele_pass_min_accuracy: number;
  tele_pass_max_accuracy: number;

  // Teleop Defense
  tele_defense_cycles: number;
  tele_defense_avg_effective: number;
  tele_defense_min_effective: number;
  tele_defense_max_effective: number;

  // Teleop Climb
  tele_climb_level: number;

  // Penalties
  foul_count: number;
  penalty_count: number;

  // Observations
  notes: string;
  categories: string;
}

// Qualities Measured in Scoring
export interface ScoringCycle {
  fromLocation: string; //
  capacity: number;     //
  speed: number;        //
  accuracy: number;     //
}

// Qualities Measured in Passing/Collecting
export interface PassingCycle {
  fromLocation: string; //
  toLocation: string;   //
  capacity: number;     //
  speed: number;        //
  accuracy: number;     //
}

// Qualities Measured in Defense
export interface DefenseCycle {
  defenseLocation: string; //
  effective: number;     //
}
