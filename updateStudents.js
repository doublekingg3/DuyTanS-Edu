import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0237302277",
  appId: "1:14049971656:web:12e834dfabcc9794fac4fd",
  apiKey: "AIzaSyAdSqjjyetCSTq1VOBx7bEo58qDsQPGKW0",
  authDomain: "gen-lang-client-0237302277.firebaseapp.com",
  storageBucket: "gen-lang-client-0237302277.firebasestorage.app",
  messagingSenderId: "14049971656",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-edumanagepro-3db4613f-477a-4cf6-a5e6-2823c184867b");

async function update() {
  const snapshot = await getDocs(collection(db, "students"));
  for (const document of snapshot.docs) {
    const data = document.data();
    if (!data.classId) {
      await updateDoc(doc(db, "students", document.id), {
        classId: 'c1' // Assign default class
      });
      console.log(`Updated ${document.id}`);
    }
  }
  console.log("Done");
}

update();
