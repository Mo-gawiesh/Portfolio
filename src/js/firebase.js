import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMrvzyjzXiO-ORqCYRt4j65I0yMOvx0yw",
  authDomain: "portfolio-c66a4.firebaseapp.com",
  projectId: "portfolio-c66a4",
  storageBucket: "portfolio-c66a4.firebasestorage.app",
  messagingSenderId: "36096939089",
  appId: "1:36096939089:web:5c7849464f215d70b8d470",
  measurementId: "G-CW0XND639Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
