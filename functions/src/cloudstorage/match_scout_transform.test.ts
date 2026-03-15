import { describe, it, expect, vi } from "vitest";
import { Request } from "firebase-functions/v2/https";
import { Response } from "express";
import { transformScoutingData } from "./match_scout_transform.js";
import { ScoutingData, FlattenedScoutingRow } from "./scout_types.js";

describe("transformScoutingData", () => {
  it("should apply defaults correctly when scouting data is an empty object", async () => {
    // 1. Setup mock data and request
    // Using Partial<ScoutingData> to simulate an empty object from Firestore.
    const mockScoutingData: Partial<ScoutingData> = {};
    const mockResource =
      "projects/p/databases/(default)/documents/events/test-event/matches/test-match-doc-id";

    const mockRequest = {
      body: {
        data: mockScoutingData,
        context: {
          resource: mockResource,
        },
      },
    } as unknown as Request;

    // 2. Setup mock response object
    const mockSend = vi.fn();
    const mockStatus = vi.fn().mockReturnThis();
    const mockResponse = {
      status: mockStatus,
      send: mockSend,
    } as unknown as Response;

    // 3. Execute the function
    await transformScoutingData(mockRequest, mockResponse);

    // 4. Assertions
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockSend).toHaveBeenCalledTimes(1);

    const responseBody = mockSend.mock.calls[0][0] as FlattenedScoutingRow;

    const expected: FlattenedScoutingRow = {
      // Metadata
      document_id: "test-match-doc-id",
      event_id: "test-event",
      team: "",
      match_id: "",
      scout: "",
      scout_uid: "",
      last_updated: "",

      // Auton Scoring
      auto_score_cycles: 0,
      auto_score_avg_cap: 0,
      auto_score_max_cap: 0,
      auto_score_min_cap: 0,
      auto_score_avg_speed: 0,
      auto_score_min_speed: 0,
      auto_score_max_speed: 0,
      auto_score_avg_accuracy: 0,
      auto_score_min_accuracy: 0,
      auto_score_max_accuracy: 0,

      // Auton Climb
      auto_climb_level: 0,
      auto_climb_speed: 0,
      auto_dismount_speed: 0,

      // Teleop Scoring
      tele_score_cycles: 0,
      tele_score_avg_cap: 0,
      tele_score_max_cap: 0,
      tele_score_min_cap: 0,
      tele_score_avg_speed: 0,
      tele_score_min_speed: 0,
      tele_score_max_speed: 0,
      tele_score_avg_accuracy: 0,
      tele_score_min_accuracy: 0,
      tele_score_max_accuracy: 0,

      // Teleop Passing
      tele_pass_cycles: 0,
      tele_pass_avg_cap: 0,
      tele_pass_max_cap: 0,
      tele_pass_min_cap: 0,
      tele_pass_avg_speed: 0,
      tele_pass_min_speed: 0,
      tele_pass_max_speed: 0,
      tele_pass_avg_accuracy: 0,
      tele_pass_min_accuracy: 0,
      tele_pass_max_accuracy: 0,

      // Teleop Defense
      tele_defense_cycles: 0,
      tele_defense_avg_effective: 0,
      tele_defense_min_effective: 0,
      tele_defense_max_effective: 0,

      // Teleop Climb
      tele_climb_level: 0,

      // Penalties
      foul_count: 0,
      penalty_count: 0,

      // Observations
      notes: "",
      categories: "",
    };

    expect(responseBody).toEqual(expected);
  });

  it("should handle a completely empty request body by applying defaults", async () => {
    // 1. Setup mock request with a completely empty body.
    // This simulates a request where the payload is just `{}`.
    const mockRequest = {
      body: {},
    } as unknown as Request;

    // 2. Setup mock response object
    const mockSend = vi.fn();
    const mockStatus = vi.fn().mockReturnThis();
    const mockResponse = {
      status: mockStatus,
      send: mockSend,
    } as unknown as Response;

    // 3. Execute the function
    await transformScoutingData(mockRequest, mockResponse);

    // 4. Assertions
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockSend).toHaveBeenCalledTimes(1);

    const responseBody = mockSend.mock.calls[0][0] as FlattenedScoutingRow;

    // With an empty body, `data` and `context` are undefined.
    // The function should default gracefully.
    const expected: FlattenedScoutingRow = {
      // Metadata
      document_id: "", // From empty resource path
      event_id: "unknown", // From empty resource path
      team: "",
      match_id: "",
      scout: "",
      scout_uid: "",
      last_updated: "",

      // Auton Scoring
      auto_score_cycles: 0,
      auto_score_avg_cap: 0,
      auto_score_max_cap: 0,
      auto_score_min_cap: 0,
      auto_score_avg_speed: 0,
      auto_score_min_speed: 0,
      auto_score_max_speed: 0,
      auto_score_avg_accuracy: 0,
      auto_score_min_accuracy: 0,
      auto_score_max_accuracy: 0,

      // Auton Climb
      auto_climb_level: 0,
      auto_climb_speed: 0,
      auto_dismount_speed: 0,

      // Teleop Scoring
      tele_score_cycles: 0,
      tele_score_avg_cap: 0,
      tele_score_max_cap: 0,
      tele_score_min_cap: 0,
      tele_score_avg_speed: 0,
      tele_score_min_speed: 0,
      tele_score_max_speed: 0,
      tele_score_avg_accuracy: 0,
      tele_score_min_accuracy: 0,
      tele_score_max_accuracy: 0,

      // Teleop Passing
      tele_pass_cycles: 0,
      tele_pass_avg_cap: 0,
      tele_pass_max_cap: 0,
      tele_pass_min_cap: 0,
      tele_pass_avg_speed: 0,
      tele_pass_min_speed: 0,
      tele_pass_max_speed: 0,
      tele_pass_avg_accuracy: 0,
      tele_pass_min_accuracy: 0,
      tele_pass_max_accuracy: 0,

      // Teleop Defense
      tele_defense_cycles: 0,
      tele_defense_avg_effective: 0,
      tele_defense_min_effective: 0,
      tele_defense_max_effective: 0,

      // Teleop Climb
      tele_climb_level: 0,

      // Penalties
      foul_count: 0,
      penalty_count: 0,

      // Observations
      notes: "",
      categories: "",
    };

    expect(responseBody).toEqual(expected);
  });
});
