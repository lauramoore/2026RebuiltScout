import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// these are local dev only - do not use in production
const firebaseConfig = {
    apiKey: 'fake-api-key',
    authDomain: 'localhost',
    projectId: '2974-rebuilt-scout',
    storageBucket: '2974-rebuilt-scout.appspot.com',
    messagingSenderId: '1234567890',
    appId: '1:1234567890:web:abcdef123456'
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const functions = getFunctions(firebaseApp);
const db = getFirestore(firebaseApp);


const authProvider = new GoogleAuthProvider();
authProvider.setCustomParameters({
  hd: "waltonrobotics.org" //ensure everybody uses the correct domain
});

if (window.location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectFirestoreEmulator(db, 'localhost', 8080 )
}



 async function refreshSchedule() {
    const response = await fetch('/api/getEventSchedule');
    if (!response.ok) {
      // Handle API errors more gracefully if needed
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    // httpsCallable automatically unwraps a 'data' property.
    // With fetch, you get the raw body, so you parse it as JSON.
    return response.status
  }


// Re-export what's needed in other parts of the app
export {
  auth,
  functions,
  db,
  authProvider,
  onAuthStateChanged,
  GoogleAuthProvider,
  refreshSchedule
};
