// ШАГ 1: ВСТАВЬТЕ ВАШ firebaseConfig, СКОПИРОВАННЫЙ ИЗ FIREBASE CONSOLE
// Он должен выглядеть примерно так:
/*
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "...",
  appId: "1:..."
};
*/
const firebaseConfig = {
  apiKey: "ПОКА НЕ ВСТАВЛЕНО",
  authDomain: "ПОКА НЕ ВСТАВЛЕНО",
  projectId: "ПОКА НЕ ВСТАВЛЕНО",
  storageBucket: "ПОКА НЕ ВСТАВЛЕНО",
  messagingSenderId: "ПОКА НЕ ВСТАВЛЕНО",
  appId: "ПОКА НЕ ВСТАВЛЕНО"
};


import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспорт сервисов для использования в приложении
export const db = getFirestore(app);
export const auth = getAuth(app);

