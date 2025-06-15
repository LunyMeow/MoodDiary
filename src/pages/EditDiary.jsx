// src/pages/EditDiary.jsx
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { db, auth } from "../services/firebase";
import { useEffect } from "react";

export default function EditDiary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    const loadDiary = async () => {
      const ref = doc(db, "diaries", id);
      const snapshot = await getDoc(ref);

      if (!snapshot.exists() || snapshot.data().userId !== auth.currentUser?.uid) {
        return navigate("/");
      }

      setValue("content", snapshot.data().content);
    };

    loadDiary();
  }, [id, navigate, setValue]);

  const onSubmit = async (data) => {
    const ref = doc(db, "diaries", id);
    await updateDoc(ref, {
      content: data.content,
    });

    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 to-blue-900 dark:from-black dark:to-gray-700">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-xl dark:bg-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-700 dark:text-blue-700">Günlüğü Düzenle</h2>
        <textarea
          {...register("content", { required: true })}
          className="w-full p-4 border border-gray-300 dark:bg-gray-600 rounded h-64 resize-none text-black : dark:text-white"
        ></textarea>
        <button
          type="submit"
          className="bg-yellow-600 hover:bg-yellow-700 text-white mt-4 py-2 px-4 rounded w-full dark:bg-green-500 dark:hover:bg-green-900"
        >
          Güncelle
        </button>
      </form>
    </div>
  );
}
