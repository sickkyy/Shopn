// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTWXAV8VisO2ni_wFFsrf8oUbIVzqd2jU",
  authDomain: "work-2579a.firebaseapp.com",
  projectId: "work-2579a",
  storageBucket: "work-2579a.firebasestorage.app",
  messagingSenderId: "960450337906",
  appId: "1:960450337906:web:bd831662f88b61774bb6eb",
  measurementId: "G-5KVWHLKYSF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
