// src/pages/NewDiary.jsx
import { useForm } from "react-hook-form";
import { getFirebaseDB, getFirebaseAuth } from "../services/firebase"
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {  getFirebaseFunctions } from "../services/firebase";

import { httpsCallable } from "firebase/functions";




export default function NewDiary() {



  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const auth = getFirebaseAuth();
  const db = getFirebaseDB();

  const user = auth?.currentUser;
  const functions = getFirebaseFunctions();


  const createDiary = httpsCallable(functions, "createDiary");

  const onSubmit = async (data) => {
    const user = auth.currentUser;
    if (!user) return;

    // Sunucuya gönder
    const result = await createDiary({
      content: data.content,
      status: data.status,
    });

    if (result.data?.success) {
      navigate("/");
    } else {
      alert("Bir hata oluştu.");
    }
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
        <select
          {...register("status", { required: true, defaultValue: "private" })}

          className="w-full p-2 mt-4 border border-gray-300 rounded text-black dark:bg-gray-900 dark:text-white"
        >
          <option value="public">Herkese Açık</option>
          <option value="private" selected>Sadece Ben</option>
          <option value="onlyFollowers">Sadece Takipçiler</option>
        </select>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white mt-4 py-2 px-4 rounded w-full "
        >
          Kaydet
        </button>
        <div className="flex justify-center mt-4">
          <Link to="/Dashboard">
            <button className="bg-blue-600 hover:bg-blue-900 text-white py-2 px-4 rounded">
              Ana Sayfa
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
