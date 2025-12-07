
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyCctHL63S-ABZhi5aMGZMG1luFCDZTmADw",
    authDomain: "xpense-e5c7b.firebaseapp.com",
    projectId: "xpense-e5c7b",
    storageBucket: "xpense-e5c7b.firebasestorage.app",
    messagingSenderId: "221117051522",
    appId: "1:221117051522:android:99679b90ac62707bd83a9bD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
