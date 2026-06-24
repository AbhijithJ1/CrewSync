/**
 * CrewSync Event Operations Platform
 * Centralized Firebase Service Client (Production Mock Setup)
 * 
 * Replace the localStorage mock adapter hooks inside context/AppContext.jsx 
 * with calls to these Firestore functions to sync with a live backend database.
 */

// Import the functions you need from the SDKs you need (uncomment in production)
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCrewSyncFakeApiKeyMockValuesForTesting",
  authDomain: "crewsync-eventops.firebaseapp.com",
  projectId: "crewsync-eventops",
  storageBucket: "crewsync-eventops.appspot.com",
  messagingSenderId: "987654321012",
  appId: "1:987654321012:web:fakeappidcrewsync"
};

// Initialize Firebase (Stub)
export const firebaseApp = null; 
export const db = null;
export const auth = null;

// ================= COLLECTION HELPERS (PRODUCTION SCHEMA TEMPLATE) =================

/**
 * collection("users") {
 *   id: string (auth uid),
 *   name: string,
 *   email: string,
 *   role: "organizer" | "volunteer",
 *   available: boolean,
 *   skills: string[],
 *   location: string
 * }
 */

/**
 * collection("tasks") {
 *   id: string,
 *   title: string,
 *   description: string,
 *   priority: "low" | "medium" | "high" | "critical",
 *   location: string,
 *   requiredSkill: string,
 *   status: "pending" | "accepted" | "completed" | "expired" | "cancelled",
 *   acceptedBy: string[] (volunteer ids),
 *   declinedBy: string[] (volunteer ids),
 *   volunteersNeeded: number,
 *   durationLimit: number,
 *   deadline: string,
 *   completionNote?: string,
 *   createdAt: timestamp,
 *   completedAt?: timestamp
 * }
 */

/**
 * collection("activity_logs") {
 *   id: string,
 *   message: string,
 *   type: "info" | "success" | "warning",
 *   timestamp: number
 * }
 */

console.log("CrewSync Firebase Services Client initialized in mock/standalone mode.");
