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
    notes: string;
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
  auton_score_count: number;
  auton_score_total_cap: number;
  auton_score_avg_speed: number;
  auton_score_min_speed: number;
  auton_score_max_speed: number;
  auton_score_avg_accuracy: number;
  auton_score_min_accuracy: number;
  auton_score_max_accuracy: number;

  // Auton Climb
  auton_climb_level: number;

  // Teleop Scoring
  teleop_score_count: number;
  teleop_score_total_cap: number;
  teleop_score_avg_speed: number;
  teleop_score_min_speed: number;
  teleop_score_max_speed: number;
  teleop_score_avg_accuracy: number;
  teleop_score_min_accuracy: number;
  teleop_score_max_accuracy: number;

  // Teleop Passing
  teleop_pass_count: number;
  teleop_pass_total_cap: number;
  teleop_pass_avg_speed: number;
  teleop_pass_min_speed: number;
  teleop_pass_max_speed: number;
  teleop_pass_avg_accuracy: number;
  teleop_pass_min_accuracy: number;
  teleop_pass_max_accuracy: number;

  // Teleop Defense
  teleop_defense_count: number;
  teleop_defense_avg_effective: number;
  teleop_defense_min_effective: number;
  teleop_defense_max_effective: number;

  // Teleop Climb
  teleop_climb_level: number;

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
