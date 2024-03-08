// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore'; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnndPKiT-7VMo_pH_DI2IDCuHd5wMaB_Q",
  authDomain: "nutritrack-e65f0.firebaseapp.com",
  projectId: "nutritrack-e65f0",
  storageBucket: "nutritrack-e65f0.appspot.com",
  messagingSenderId: "302725610984",
  appId: "1:302725610984:web:fa62385d30fdea77ea385d",
  measurementId: "G-TPH4XTMKL2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);