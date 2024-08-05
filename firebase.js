// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAW5Trs0rmmdlHrMUUaGmou-j8PJAMBPBU",
	authDomain: "inventory-management-app-42b4c.firebaseapp.com",
	projectId: "inventory-management-app-42b4c",
	storageBucket: "inventory-management-app-42b4c.appspot.com",
	messagingSenderId: "58981239785",
	appId: "1:58981239785:web:249c36050fd88e03665978",
	measurementId: "G-B2Z8SSXF3T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
if (typeof window !== "undefined") {
	const analytics = getAnalytics(app);
}
export const firestore = getFirestore(app);
