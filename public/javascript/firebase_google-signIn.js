import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAD19RwVU18OBVHajQ4DJNu0OTIeMND8i0",
  authDomain: "craftoevent-a7f27.firebaseapp.com",
  projectId: "craftoevent-a7f27",
  storageBucket: "craftoevent-a7f27.appspot.com",
  messagingSenderId: "353987248488",
  appId: "1:353987248488:web:1a825f5eb3cb15c7da96dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const googleProvider = new GoogleAuthProvider;

// custom functions
let signingInUser = async function() {
  let user;
  let error;
  let googleAuthentication = await signInWithPopup(auth, googleProvider).
  then(userData => {
    user = userData;
  }).catch(err => {
    error = err;
  });
  
  if (user) {
    return { success: user }
  } else {
    return { error };
  }
};

let signingOutUser = async function() {
  signOut(auth).
  then(result => {
    console.log("User has been successfully logged out.");
  }).catch(err => {
    console.log("Couldn't logout the user successfully.");
  });
}

export { signingInUser, signingOutUser };