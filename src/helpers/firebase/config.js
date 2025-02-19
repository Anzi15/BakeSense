import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence  } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log("Multiple tabs open, persistence can only be enabled in one.");
    } else if (err.code == 'unimplemented') {
      console.log("This browser does not support offline persistence.");
    }
  });
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth Persistence Error:", error);
});

export { app, auth, db, storage };
