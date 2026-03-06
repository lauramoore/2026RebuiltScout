// In your Firebase Functions index.ts file

import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import axios, { isAxiosError } from "axios";

// An interface for the schedule query parameters
interface ScheduleQuery {
    year: string;
    eventCode: string;
    tournamentLevel: string;
}

// Interface for a team in a match from the FRC API
interface FrcTeam {
    teamNumber: number;
    station: string;
    surrogate: boolean;
}

// Interface for a single match from the FRC API
interface FrcMatch {
    description: string;
    matchNumber: number;
    startTime: string;
    teams: FrcTeam[];
    // Allow other properties from the API
    [key: string]: any;
}

// Interface for the schedule API response
interface FrcScheduleResponse {
    Schedule: FrcMatch[];
}

/**
 * Core logic to fetch a schedule from the FRC API and store it in Firestore.
 * This function is designed to be called by other cloud functions.
 * @param {ScheduleQuery} query The parameters for the API query.
 * @return {Promise<{success: boolean, message: string, matchesSaved: number}>}
 * A promise that resolves with the result of the import operation.
 */
async function updateAndStoreSchedule(query: ScheduleQuery): Promise<{
    success: boolean;
    message: string;
    matchesSaved: number;
}> {
    // Lazily initialize Firestore to ensure the Firebase app is initialized.
    const db = getFirestore();

    const { year, eventCode, tournamentLevel } = query;

    // 1. Securely get credentials and prepare the API call
    const username = process.env.FRC_USERNAME;
    const apiKey = process.env.FRC_API_KEY;

    if (!username || !apiKey) {
        console.error("FRC API credentials are not configured in Firebase environment.");
        // This will be caught by the calling function
        throw new Error("Server is missing API credentials.");
    }

    // Get the last-modified header from Firestore to use for caching
    const eventDocRef = db.doc(`competitions/${eventCode}`);
    const eventDoc = await eventDocRef.get();
    const lastModified = eventDoc.data()?.scheduleLastModified as string | undefined;

    const headers: { [key: string]: string } = {
        "Authorization": `Basic ${Buffer.from(`${username}:${apiKey}`).toString("base64")}`,
        "Accept": "application/json",
    };
    if (lastModified) {
        headers["If-Modified-Since"] = lastModified;
    }

    // 2. Fetch the schedule from the FRC API, handling caching
    let apiResponse;
    try {
        const apiUrl = `https://frc-api.firstinspires.org/v3.0/${year}/schedule/${eventCode}?tournamentLevel=${tournamentLevel}`;
        apiResponse = await axios.get<FrcScheduleResponse>(apiUrl, { headers });
    } catch (error) {
        // If the API returns 304, it means the data has not been modified.
        if (isAxiosError(error) && error.response?.status === 304) {
            const message = `Schedule for ${eventCode} has not changed (304 Not Modified). No import needed.`;
            console.log(message);
            return {
                success: true,
                message: message,
                matchesSaved: 0,
            };
        }
        // Re-throw other errors to be handled by the calling function
        throw error;
    }

    const scheduleData = apiResponse.data;
    const newLastModified = apiResponse.headers["last-modified"] as string;

    if (!scheduleData || !Array.isArray(scheduleData.Schedule)) {
        throw new Error("Schedule data not found or in an unexpected format from FRC API.");
    }

    if (scheduleData.Schedule.length === 0) {
        const message = `The FRC API returned an empty schedule for ${eventCode}. No matches to import.`;
        console.log(message);
        return {
            success: true,
            message: message,
            matchesSaved: 0,
        };
    }

    // 3. Prepare a Firestore batch write
    const batch = db.batch();

    let matchesProcessed = 0;
    for (const match of scheduleData.Schedule) {
        if (match && match.description && Array.isArray(match.teams)) {
            const docId = String(match.matchNumber);
            const matchDocRef = eventDocRef.collection("schedule").doc(docId);

            const redAlliance = match.teams
                .filter((team) => team.station.startsWith("Red"))
                .map((team) => team.teamNumber);

            const blueAlliance = match.teams
                .filter((team) => team.station.startsWith("Blue"))
                .map((team) => team.teamNumber);

            const firestoreRecord = {
                matchNumber: match.matchNumber,
                red: redAlliance,
                blue: blueAlliance,
            };

            batch.set(matchDocRef, firestoreRecord);
            matchesProcessed++;
        }
    }

    // Also update the parent event doc with the new last-modified header
    if (newLastModified) {
        batch.set(eventDocRef, { scheduleLastModified: newLastModified }, { merge: true });
    }

    // 4. Commit the batch to Firestore
    await batch.commit();

    const message = `Successfully imported ${matchesProcessed} matches for ${eventCode} into Firestore.`;
    return { success: true, message, matchesSaved: matchesProcessed };
}

export const importFrcSchedule = onCall(
    { secrets: ["FRC_USERNAME", "FRC_API_KEY"] },
    async (request) => {
        // 1. Authenticate the request
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "The function must be called while authenticated."
            );
        }

        const { year, eventCode, tournamentLevel } = request.data as ScheduleQuery;

        if (!year || !eventCode || !tournamentLevel) {
            throw new HttpsError(
                "invalid-argument",
                "The function must be called with `year`, `eventCode`, and `tournamentLevel`."
            );
        }

        try {
            // 2. Call the core logic function
            const result = await updateAndStoreSchedule({ year, eventCode, tournamentLevel });
            console.log(result.message);
            return result;
        } catch (error) {
            // Enhanced error handling
            if (isAxiosError(error)) {
                console.error(`FRC API Error: ${error.message}`, error.response?.data);
                throw new HttpsError(
                    "unavailable",
                    "Failed to fetch schedule from the FRC API.",
                    error.response?.data
                );
            }

            console.error("Error importing FRC schedule:", error);
            throw new HttpsError(
                "internal",
                "An internal error occurred while importing the schedule."
            );
        }
    }
);

/**
 * A scheduled function that runs automatically to import the FRC schedule.
 * This example is set to run every 60 minutes.
 *
 * TODO: Make the query parameters dynamic. You could read a list of active
 * events from a "config" collection in Firestore to decide which schedules to update.
 export const scheduledFrcScheduleImport = onSchedule(
    {
        schedule: "every 60 minutes",
        secrets: ["FRC_USERNAME", "FRC_API_KEY"],
    },
    async (event) => {
        console.log("Running scheduled FRC schedule import...");

        // Example: Update the playoff schedule for a specific event
        const query: ScheduleQuery = {
            year: "2026", // Consider making this dynamic, e.g., new Date().getFullYear().toString()
            eventCode: "gadal", // Example event code
            tournamentLevel: "Qualification",
        };

        try {
            const result = await updateAndStoreSchedule(query);
            console.log(`Scheduled run success: ${result.message}`);
        } catch (error) {
            console.error(`Scheduled import for ${query.eventCode} failed:`, error);
        }
    }

);
*/
