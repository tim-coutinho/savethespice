import firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyD7rWhYuPqTD57YN3m5eOl_Ajo-V3OTw4E",
    authDomain: "recipes-74822.firebaseapp.com",
    databaseURL: "https://recipes-74822.firebaseio.com",
    projectId: "recipes-74822",
    storageBucket: "recipes-74822.appspot.com",
    messagingSenderId: "625938140579",
    appId: "1:625938140579:web:1b7a1009c9d1e793c41e16"
};
firebase.initializeApp(firebaseConfig);
export default firebase;
