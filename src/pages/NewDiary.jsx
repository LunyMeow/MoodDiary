// src/pages/NewDiary.jsx
import { useForm } from "react-hook-form";
import { collection, addDoc, serverTimestamp, doc,getDoc } from "firebase/firestore";
import { getFirebaseDB, getFirebaseAuth } from "../services/firebase"
import { useNavigate } from "react-router-dom";
import { encrypt } from "../utils/crypto";
import { Link } from "react-router-dom";
import { useState } from "react";




export default function NewDiary() {

  const [aesPass, setAesPass] = useState("");

  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const auth = getFirebaseAuth();
  const db = getFirebaseDB();

  const user = auth?.currentUser;

  const fetchKey = async () => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    const data = docSnap.data();
    setAesPass(data.aesPass || "default")

  };

  fetchKey();
  const onSubmit = async (data) => {
    const user = auth.currentUser;
    if (!user) return;

    const encryptedContent = encrypt(data.content,aesPass);

    await addDoc(collection(db, "diaries"), {
      userId: user.uid,
      content: encryptedContent,
      createdAt: serverTimestamp(),
    });

    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 dark:from-gray-800 dark:to-black">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-xl dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700 dark:text-yellow-500">
          Yeni Günlük Ekle
        </h2>
        <textarea
          {...register("content", { required: true })}
          className="w-full p-4 border border-gray-300 rounded h-64 resize-none text-black dark:bg-gray-900 dark:text-white"
          placeholder="Bugün neler hissettin?"
        ></textarea>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white mt-4 py-2 px-4 rounded w-full "
        >
          Kaydet
        </button>
        <div className="flex justify-center mt-4">
          <Link to="/">
            <button className="bg-blue-600 hover:bg-blue-900 text-white py-2 px-4 rounded">
              Ana Sayfa
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
