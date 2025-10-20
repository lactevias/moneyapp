// ШАГ 1: ВСТАВЬТЕ ВАШ firebaseConfig, СКОПИРОВАННЫЙ ИЗ FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "ВАШ_КЛЮЧ_API",
  authDomain: "ВАШ_ДОМЕН_AUTH",
  projectId: "ВАШ_ID_ПРОЕКТА",
  storageBucket: "ВАШ_STORAGE_BUCKET",
  messagingSenderId: "ВАШ_MESSAGING_SENDER_ID",
  appId: "ВАШ_APP_ID"
};

// --- Не изменяйте код ниже ---
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

