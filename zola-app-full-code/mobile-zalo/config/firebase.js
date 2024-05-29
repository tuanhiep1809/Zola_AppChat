// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey : "AIzaSyA-cVkjTmgn6fK3rhK53tIktm7egz2GzV8" , 
    authDomain : "zalo-78227.firebaseapp.com" , 
    projectId : "zalo-78227" , 
    storageBucket : "zalo-78227.appspot.com" , 
    messagingSenderId : "759071450300" , 
    appId : "1:759071450300:web:b5487d5e1bdac11922dcb9" , 
    measurementId : "G-0NY743HJ9H"
};
const app = firebase.initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

