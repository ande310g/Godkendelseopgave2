import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';  // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB8inhRDpI1MyZvZnieMANYhqifiEo9ryo",
    authDomain: "godkendelsesopgave2-9d6c6.firebaseapp.com",
    databaseURL: "https://godkendelsesopgave2-9d6c6-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "godkendelsesopgave2-9d6c6",
    storageBucket: "godkendelsesopgave2-9d6c6.appspot.com",
    messagingSenderId: "176085368317",
    appId: "1:176085368317:web:2c84676dc1e5cbcee7ad94"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);  // Initialize Firebase Storage

export { auth, database, storage };
