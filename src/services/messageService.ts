import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: Date;
}

export const saveMessage = async (
  userId: string,
  userName: string,
  userEmail: string,
  content: string
): Promise<string> => {
  const docRef = await addDoc(collection(db, "messages"), {
    userId,
    userName,
    userEmail,
    content,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getMessages = async (): Promise<Message[]> => {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      content: data.content,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    };
  });
};