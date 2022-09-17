import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, onValue, set, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCFlrZ0h3IpsXF83HCKZfami3fb-zq5qNk",
  authDomain: "kls-translate.firebaseapp.com",
  databaseURL: "https://kls-translate-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kls-translate",
  storageBucket: "kls-translate.appspot.com",
  messagingSenderId: "638570416606",
  appId: "1:638570416606:web:2d807bb647c79746b3f54f",
  measurementId: "G-M1NNWPC0EL",
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

export const getData = new Promise((res, rej) => {
  get(dbRef(db, "/"))
    .then((snapshot) => res(snapshot.val()))
    .catch((e) => rej(e));
});

export const setData = (data) => {
  return set(dbRef(db, "/"), data);
};
