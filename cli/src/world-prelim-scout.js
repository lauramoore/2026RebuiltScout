// Import necessary modules
const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Log the firebase-admin version
// The direct require('firebase-admin/package.json') fails with ERR_PACKAGE_PATH_NOT_EXPORTED
// in newer Node.js versions due to the "exports" field in firebase-admin's package.json.
// This is a workaround to get the version by resolving the main package entry point
// and then finding the package.json from there.
const adminPackagePath = path.join(path.dirname(require.resolve('firebase-admin')), '..', 'package.json');
console.log(`Using firebase-admin version: ${require(adminPackagePath).version}`);

// --- CONFIGURATION ---

// Initialize the Firebase Admin SDK
// If FIRESTORE_EMULATOR_HOST is set, connect to the emulator.
// Otherwise, connect to production using a service account.
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log(`Connecting to Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}...`);
  admin.initializeApp({
    // When using the emulator, you can use a dummy project ID.
    projectId: 'wrt-firebase-web-app'
  });
} else {
  console.log('Connecting to production Firestore...');
  try {
    // The script automatically looks for a 'serviceAccountKey.json' file in the same directory.
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Error: serviceAccountKey.json not found or invalid. This file is required to connect to production Firestore.', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

// --- SCRIPT LOGIC ---

/**
 * Uploads a competition schedule from a CSV file to Firestore.
 * @param {string} csvFilePath Path to the CSV file.
 * @param {string} eventId A unique ID for the event/competition (e.g., '2024txhou').
 */
async function uploadSchedule(csvFilePath, eventId) {
  if (!csvFilePath || !eventId) {
    throw new Error('Please provide a path to the CSV file and a competition/event ID.\nUsage: node world-prelim-scout.js <path-to-csv-file> <event-id>');
  }

  // Sanitize eventId for BigQuery compatibility by replacing spaces and other disallowed characters.
  const sanitizedEventId = eventId.replace(/[^a-zA-Z0-9_]/g, '_');
  if (sanitizedEventId !== eventId) {
    console.log(`Event ID sanitized for BigQuery compatibility: "${eventId}" -> "${sanitizedEventId}"`);
    // Use the sanitized version for all subsequent operations.
    eventId = sanitizedEventId;
  }

  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`File not found at ${csvFilePath}`);
  }

  console.log(`Starting schedule upload for event: ${eventId} from ${csvFilePath}`);

  const matches = [];
  // Per the user's request, this function is being adapted to handle a specific
  // team data CSV format. The headers have duplicates and spaces, so we define them manually.
  const csvHeaders = ['number', 'district', 'mostRecentComp', 'highMatch1', 'highMatch2', 'highMatch3', 'ranking', 'awards'];

  // Use a modern for-await-of loop to process the stream. This simplifies async control flow.
  const stream = fs.createReadStream(csvFilePath)
    .pipe(csv({ headers: csvHeaders, skipLines: 1 }));

  for await (const row of stream) {
    try {
      // The 'number' from CSV is used for the document ID. It might not be a plain number.
      const docIdSource = row.number;

      // Validate data: skip rows where the number (used for doc ID) is missing.
      if (!docIdSource || !docIdSource.trim()) {
        console.warn(`Skipping invalid row (empty 'Number' column): ${JSON.stringify(row)}`);
        continue;
      }

      // Mapping user's request to the schedule data structure:
      // "the number will be match number" -> row.number is used as matchNumber
      // "red 1,2,3 will each be one of the high scoring match" -> highMatch1,2,3
      // "blue1 will be district (abbreviate)" -> row.district
      // "blue3 will be Most recent comp" -> row.mostRecentComp
      const matchData = {
        matchNumber: docIdSource, // Keep original value from CSV
        red: [
          row.highMatch1 ? row.highMatch1.trim() : null,
          row.highMatch2 ? row.highMatch2.trim() : null,
          row.highMatch3 ? row.highMatch3.trim() : null
        ],
        blue: [
          row.district ? row.district.trim() : null,
          null, // blue2 is unspecified
          row.mostRecentComp ? row.mostRecentComp.trim() : null
        ],
      };

      matches.push(matchData);
    } catch (error) {
      console.warn(`Skipping row due to parsing error: ${JSON.stringify(row)}`, error);
    }
  }

  // Now that the stream is fully read, we can proceed with the database operations.
  console.log(`CSV file successfully processed. Found ${matches.length} matches.`);
  if (matches.length === 0) {
    console.log('No matches to upload.');
    return;
  }

  // Firestore allows a maximum of 500 operations in a single batch.
  // We'll chunk our uploads to stay within this limit.
  const batchSize = 499;
  for (let i = 0; i < matches.length; i += batchSize) {
    const chunk = matches.slice(i, i + batchSize);
    const batch = db.batch();

    console.log(`Processing chunk ${Math.floor(i / batchSize) + 1}...`);

    chunk.forEach((match) => {
      // Sanitize the document ID for BigQuery compatibility.
      // Replace spaces and other characters not allowed with underscores.
      // The source for the ID is the 'number' column from the CSV.
      const matchId = String(match.matchNumber).trim().replace(/[^a-zA-Z0-9_]/g, '_');
      const matchRef = db.collection('competitions').doc(eventId).collection('schedule').doc(matchId);
      batch.set(matchRef, match);
      console.log(`Added match with doc ID: "${matchId}"`);
    });

    console.log("begin batch commit")
    try {
      if (process.env.FIRESTORE_EMULATOR_HOST) {
        // When using the emulator, don't use a timeout as local operations can be slower.
        await batch.commit();
      } else {
        // Race the batch commit against a timeout for production to prevent hanging.
        const commitPromise = batch.commit();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => {
            reject(new Error('Firestore batch commit timed out after 30 seconds.'));
          }, 30000) // 30 seconds
        );
        await Promise.race([commitPromise, timeoutPromise]);
      }
      console.log(`Successfully uploaded a batch of ${chunk.length} matches.`);
    } catch (error) {
      console.error('Error committing batch to Firestore:', error);
      throw error; // Re-throw the error to be caught by the main function
    }
  }

  console.log('-----------------------------------------');
  console.log('✅ Schedule upload complete!');
  console.log(`Data uploaded to Firestore collection: /competitions/${eventId}/schedule`);
  console.log('-----------------------------------------');
}

// --- SCRIPT EXECUTION ---

async function main() {
    // This script now only handles uploading schedules.
    // It expects two arguments: the path to the CSV file and the event ID.
    const [,, csvFilePath, eventId] = process.argv;
    try {
      await uploadSchedule(csvFilePath, eventId);
      // The Admin SDK maintains open connections, preventing the script from exiting
      // on its own. We explicitly exit with a success code.
      console.log('\nScript finished successfully. Exiting.');
      process.exit(0);
    } catch (error) {
      console.error('\nScript finished with an error:', error.message);
      process.exit(1);
    }
}

main();
