import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBvJyixm5QHY8mqHfcLASfbeBZ3MxqUc1I",
  authDomain: "content-management-syste-db495.firebaseapp.com",
  databaseURL: "https://content-management-syste-db495-default-rtdb.firebaseio.com/",
  projectId: "content-management-syste-db495",
  storageBucket: "content-management-syste-db495.firebasestorage.app",
  messagingSenderId: "813865134610",
  appId: "1:813865134610:web:79f75681e70fd37c2446cb"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
