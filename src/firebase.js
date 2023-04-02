// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyxaFuR2b_h_AbR467puvLwPlpBs5GaE8",
  authDomain: "chat-app-51378.firebaseapp.com",
  projectId: "chat-app-51378",
  storageBucket: "chat-app-51378.appspot.com",
  messagingSenderId: "502154435304",
  appId: "1:502154435304:web:2615c1abbcb4bf3075075d",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
