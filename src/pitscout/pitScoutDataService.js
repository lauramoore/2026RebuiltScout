import imageCompression from 'browser-image-compression';
import { storage} from '../firebase.js';
import { ref, getBlob, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Fetches the pit scouting form template from GCS using the Firebase SDK.
 * @returns {Promise<Object>} The form template JSON.
 */
export async function getFormTemplate() {
    const templateRef = ref(storage, 'pitscout-template.json');
    try {
        const blob = await getBlob(templateRef);
        const text = await blob.text();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error fetching form template from Firebase Storage:", error);
        // Re-throw a more user-friendly error
        throw new Error('Failed to load form template.');
    }
}

/**
 * Compresses, uploads a robot photo, and returns its GCS object path.
 * This now uses the Firebase Storage SDK directly for uploads.
 * @param {string} eventCode - The event code.
 * @param {string} teamNumber - The team number.
 * @param {File} photoFile - The original photo file.
 * @returns {Promise<string>} The GCS object path of the uploaded photo.
 */
export async function uploadRobotPhoto(eventCode, teamNumber, photoFile) {
  const compressedFile = await imageCompression(photoFile, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const fileName = `pitscout/photos/${teamNumber}_${Date.now()}.jpg`;
  const photoRef = ref(storage, fileName);

  const metadata = {
    contentType: 'image/jpeg',
    customMetadata: {
      eventCode: eventCode,
      teamNumber: String(teamNumber)
    }
  };

  await uploadBytes(photoRef, compressedFile, metadata);
  // The fileName is the full path in the bucket, which is what we need.
  return fileName;
}

export async function loadExistingData(teamNumber) {
  try {
    // Data is stored in a standardized JSON file.
    const dataPath =  `pitscout/data/${teamNumber}.json`;
    const dataFileRef = ref(storage, dataPath);

    const blob = await getBlob(dataFileRef);
    const data = JSON.parse(await blob.text());
    return data;
  } catch (e) {
    if (e.code === 'storage/object-not-found') {
      console.log('No existing pit scout data found. Starting fresh.');
      return {};
    } else {
      console.error('Error loading existing data:', e);
      throw e;
    }
  }
}

/**
 * Gets a public download URL for a file in Firebase Storage.
 * @param {string} gcsPath - The full path to the file in the bucket.
 * @returns {Promise<string>} The public download URL.
 */
export async function getFileUrl(gcsPath) {
    const fileRef = ref(storage, gcsPath);
    return await getDownloadURL(fileRef);
}

/**
 * Uploads the final scout data as a JSON file to GCS using the Firebase SDK.
 * @param {string} eventCode - The event code.
 * @param {string} teamNumber - The team number.
 * @param {object} scoutData - The scout data object.
 */
export async function uploadScoutData(eventCode, teamNumber, scoutData) {
    const fileName = `pitscout/data/${teamNumber}.json`;
    const fileContent = new Blob([JSON.stringify(scoutData, null, 2)], {
        type: 'application/json',
    });

    const dataRef = ref(storage, fileName);
    const metadata = {
      customMetadata: {
        eventCode: eventCode,
        teamNumber: String(teamNumber)
      }
    };
    await uploadBytes(dataRef, fileContent, metadata);
}
