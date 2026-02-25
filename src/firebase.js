import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, initializeFirestore, persistentLocalCache, getFirestore} from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAnalytics } from "firebase/analytics";


// these are local dev only - do not use in production
// The configuration is loaded from environment variables for security and flexibility.
// In a Vite project, these are exposed via `import.meta.env`.
// Create a .env.local file in your project root to define these.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: import.meta.env.VITE_FIREBASE_APP_MEASURE_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);

const db = setupFirestore(firebaseApp);

const auth = getAuth(firebaseApp);
const functions = getFunctions(firebaseApp);


const authProvider = new GoogleAuthProvider();
authProvider.setCustomParameters({
  hd: "waltonrobotics.org", //ensure everybody uses the correct domain
});

if (window.location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectFirestoreEmulator(db, 'localhost', 8080 )
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

 getAnalytics(firebaseApp);

 initializeAppCheck(firebaseApp, {
   provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
   isTokenAutoRefreshEnabled: true
 });

function setupFirestore(firebaseApp) {

try {
  // Initialize Firestore with persistent cache
  const db = initializeFirestore(firebaseApp, {
    localCache: persistentLocalCache({ })
  });
  return db;
} catch (err) {
  if (err.code === 'failed-precondition') {
    // This error happens if persistence is enabled in multiple tabs.
    console.warn('Firestore persistence failed: multiple tabs open. Falling back to memory cache.');
  } else if (err.code === 'unimplemented') {
    // This error happens if the browser doesn't support IndexedDB.
    console.warn('Firestore persistence failed: browser does not support it. Falling back to memory cache.');
  } else {
    console.error('An unexpected error occurred during Firestore initialization:', err);
  }
  // If persistence fails, fallback to in-memory persistence.
  return getFirestore(firebaseApp);
}
}


// Re-export what's needed in other parts of the app
export {
  auth,
  functions,
  db,
  authProvider,
  onAuthStateChanged,
  GoogleAuthProvider
};
