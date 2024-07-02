// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLORheJtsdvCPimQ8rKh5D1Fiu7APzOq4",
  authDomain: "lifexp-394c0.firebaseapp.com",
  projectId: "lifexp-394c0",
  storageBucket: "lifexp-394c0.appspot.com",
  messagingSenderId: "817414577385",
  appId: "1:817414577385:web:a4512ed1b46d73a747e478",
  measurementId: "G-D4X788E162"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);