import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAEtL_kAtz9CNkwZFczzA0NqCZvqOrRmU0",
    authDomain: "smart-helper-website.firebaseapp.com",
    databaseURL: "https://smart-helper-website-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-helper-website",
    storageBucket: "smart-helper-website.firebasestorage.app",
    messagingSenderId: "579877211922",
    appId: "1:579877211922:web:1c64679bdf4d700011adcb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
