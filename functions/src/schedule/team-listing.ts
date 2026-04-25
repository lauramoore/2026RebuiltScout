// In your Firebase Functions index.ts file

import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import axios, { isAxiosError } from "axios";

// An interface for the schedule query parameters
interface EventQuery {
    year: string;
    eventCode: string;
}

// Interface for a team object from the FRC API
interface FrcApiTeam {
    teamNumber: number;
    nameShort: string;
    robotName: string;
    country: string;
    // Allow other properties from the API
    [key: string]: any;
}

// Interface for the team data we will store in Firestore
interface StoredTeam {
    teamNumber: number;
    nameShort: string;
    robotName: string;
    country: string;
}

// Interface for the schedule API response
interface FrcEventResponse {
    teams: FrcApiTeam[];
    teamCountTotal: number;
    teamCountPage: number;
    pageCurrent: number;
    pageTotal: number;
}

/**
 * Core logic to fetch a team list from the FRC API and store it in Firestore.
 * This function is designed to be called by other cloud functions and handles pagination.
 * @param {EventQuery} query The parameters for the API query.
 * @return {Promise<{success: boolean, message: string, saved: number}>}
 * A promise that resolves with the result of the import operation.
 */
async function updateAndStoreTeams(query: EventQuery): Promise<{
    success: boolean;
    message: string;
    saved: number;
}> {
    // Lazily initialize Firestore to ensure the Firebase app is initialized.
    const db = getFirestore();
    const { year, eventCode} = query;

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
    const lastModified = eventDoc.data()?.teamListLastModified as string | undefined;

    const headers: { [key: string]: string } = {
        "Authorization": `Basic ${Buffer.from(`${username}:${apiKey}`).toString("base64")}`,
        "Accept": "application/json",
    };
    if (lastModified) {
        headers["If-Modified-Since"] = lastModified;
    }

    // 2. Fetch the teams from the FRC API, handling pagination and caching
    const allTeams: StoredTeam[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let newLastModified: string | undefined;

    do {
        let apiResponse;
        try {
            const apiUrl = `https://frc-api.firstinspires.org/v3.0/${year}/teams?eventCode=${eventCode}&page=${currentPage}`;
            apiResponse = await axios.get<FrcEventResponse>(apiUrl, { headers });

            if (currentPage === 1) {
                totalPages = apiResponse.data.pageTotal;
                newLastModified = apiResponse.headers["last-modified"] as string;
                // After the first request, we should not send If-Modified-Since for subsequent pages
                // because we've already determined we need to fetch new data.
                delete headers["If-Modified-Since"];
            }

            if (apiResponse.data?.teams) {
                const extractedTeams = apiResponse.data.teams.map((team) => ({
                    teamNumber: team.teamNumber,
                    nameShort: team.nameShort,
                    robotName: team.robotName,
                    country: team.country,
                }));
                allTeams.push(...extractedTeams);
            }
        } catch (error) {
            // If the API returns 304 on the first page, it means the data has not been modified.
            if (isAxiosError(error) && error.response?.status === 304 && currentPage === 1) {
                const message = `TeamList for ${eventCode} has not changed (304 Not Modified). No import needed.`;
                console.log(message);
                return {
                    success: true,
                    message: message,
                    saved: 0,
                };
            }
            // Re-throw other errors to be handled by the calling function
            throw error;
        }
        currentPage++;
    } while (currentPage <= totalPages);

    if (allTeams.length === 0) {
        const message = `The FRC API returned an empty event for ${query.eventCode}. No teams to import.`;
        console.log(message);
        return {
            success: true,
            message: message,
            saved: 0,
        };
    }

    // 3. Prepare a Firestore batch write
    const batch = db.batch();

    const processed = allTeams.length;
    const firestoreRecord = {
      teams: allTeams,
      teamListLastModified: newLastModified,
    };
    batch.set(eventDocRef, firestoreRecord, { merge: true });

    // 4. Commit the batch to Firestore
    await batch.commit();

    const message = `Successfully imported ${processed} teams for ${eventCode} into Firestore.`;
    return { success: true, message, saved: processed };
}

export const importFrcTeams = onCall(
    { secrets: ["FRC_USERNAME", "FRC_API_KEY"] },
    async (request) => {
        // 1. Authenticate the request
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "The function must be called while authenticated."
            );
        }

        const { year, eventCode } = request.data as EventQuery;

        if (!year || !eventCode ) {
            throw new HttpsError(
                "invalid-argument",
                "The function must be called with `year` and `eventCode`."
            );
        }

        try {
            // 2. Call the core logic function
            const result = await updateAndStoreTeams({ year, eventCode });
            console.log(result.message);
            return result;
        } catch (error) {
            // Enhanced error handling
            if (isAxiosError(error)) {
                console.error(`FRC API Error: ${error.message}`, error.response?.data);
                throw new HttpsError(
                    "unavailable",
                    "Failed to fetch team list from the FRC API.",
                    error.response?.data
                );
            }

            console.error("Error importing FRC team list:", error);
            throw new HttpsError(
                "internal",
                "An internal error occurred while importing the team list."
            );
        }
    }
);
