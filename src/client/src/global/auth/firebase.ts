import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
  NextFn,
} from "firebase/auth";
import { FirebaseError } from "@firebase/util";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPhUcM2-cwT10bprbtd3qgLTlwgb7zDgM",
  authDomain: "resource-app-8140b.firebaseapp.com",
  projectId: "resource-app-8140b",
  storageBucket: "resource-app-8140b.appspot.com",
  messagingSenderId: "383478522839",
  appId: "1:383478522839:web:73d7f2ecc852ec1943a192",
  measurementId: "G-MFFYZY8X8C",
};

// Initialize Firebase
const fb = initializeApp(firebaseConfig);
const analytics = getAnalytics(fb);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(fb);

// Exposed functions for the client app

export const createUser = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    let message = "There was an error in the submission.";
    if (error instanceof FirebaseError) {
      message = error.message;
      switch (error.code) {
        case "auth/invalid-email":
          message = "The email address is invalid.";
          break;
        case "auth/email-already-in-use":
          message = "This email address is already in use.";
          break;
        case "auth/weak-password":
          message = "A stronger password is required.";
          break;
      }
    }
    console.error(message);
    return new Error(message);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    let message = "Authentication error.";
    if (error instanceof FirebaseError) {
      message = error.message;
      switch (error.code) {
        case "auth/invalid-email":
          message = "The email address is invalid.";
          break;
        case "auth/wrong-password":
          message = "The password is incorrect.";
          break;
        case "auth/user-not-found":
          message = "No user found with this email.";
          break;
        case "auth/user-disable":
          message = "This account has been disabled.";
          break;
      }
    }
    console.error(message);
    return new Error(message);
  }
};

export const signOut = async () => {
  try {
    return await fbSignOut(auth);
  } catch (error) {
    console.error(error);
  }
};

export const onAuthChange = (cb: NextFn<User | null>) => {
  return onAuthStateChanged(auth, cb);
};
