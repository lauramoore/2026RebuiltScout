import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Firestore } from "firebase-admin/firestore";
import { SecretParam, IntParam } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";

/**
 * Fetches the event schedule from the FIRST API and saves it to Firestore.
 * API Docs: https://frc-api-docs.firstinspires.org/#908fb31f-6294-4616-954b-b6e4de3ee1c7
 */
export const getEventSchedule = (
  db: Firestore,
  apiToken: SecretParam,
  season: IntParam
) => onCall(
  {
    secrets: [apiToken],
    enforceAppCheck: true
  },
  async (request) => {
  // Ensure user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

 const apiKey = apiToken.value();
 if (!apiKey) {
    logger.error("FIRST_API_TOKEN secret not provided.");
    throw new HttpsError("failed-precondition", "Server configuration error.");
  }

  const { eventCode } = request.data;

  if (!eventCode) {
    throw new HttpsError("invalid-argument", "The function must be called with 'eventCode'.");
  }

  try {
    const response = await fetch(
      `https://frc-api.firstinspires.org/v3.0/${season.value()}/schedule/${eventCode}?tournamentLevel=Qual`,
      {
        headers: {
          "Authorization": `Basic ${apiKey}`,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`FIRST API Error: ${response.status}`, errorText);
      throw new HttpsError("unavailable", "Failed to fetch data from FIRST API.");
    }

    const data = await response.json();
    const schedule = data.Schedule || [];

    const batch = db.batch();
    const eventRef = db.collection("events").doc(eventCode.toString());
    const scheduleRef = eventRef.collection("schedule");


    for (const match of schedule) {
      const { matchNumber, startTime, teams } = match;
      batch.set(scheduleRef.doc(matchNumber.toString()), {
        matchNumber,
        startTime,
        teams,
      });
    }

    await batch.commit();
    return { success: true, count: schedule.length };

  } catch (error) {
    logger.error("Error fetching event schedule:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Unable to fetch event schedule.", error);
  }
});
