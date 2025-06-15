import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../services/firebase"; // storage da import edildi
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";


export default function ProfileSettings() {
  const user = auth.currentUser;

  const [profile, setProfile] = useState({
    username: "",
    fullname: "",
    photoURL: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      setError("Lütfen giriş yapınız.");
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            username: data.username || "",
            fullname: data.fullname || "",
            photoURL: data.photoURL || "",
          });
        }
      } catch (err) {
        setError("Profil bilgileri alınamadı: " + err.message);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const handleFileChange = async (e) => {
    if (!user) {
      setError("Giriş yapmanız gerekiyor.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Firestore güncelle
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { photoURL });

      // state güncelle
      setProfile((prev) => ({ ...prev, photoURL }));

      setMessage("Profil fotoğrafı başarıyla yüklendi!");
    } catch (err) {
      setError("Fotoğraf yükleme hatası: " + err.message);
    }

    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!user) {
      setError("Giriş yapmanız gerekiyor.");
      return;
    }

    try {
      // Firestore güncelle
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        username: profile.username,
        fullname: profile.fullname,
      });

      // Şifre değişikliği
      if (newPassword.trim() !== "") {
        await updatePassword(user, newPassword);
      }

      setMessage("Profil başarıyla güncellendi!");
      setNewPassword("");
    } catch (err) {
      setError("Güncelleme hatası: " + err.message);
    }
  };

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4 text-center text-indigo-600 dark:text-indigo-400">
        Profil Ayarları
      </h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.photoURL || "/default.png"}
          alt="Profil Fotoğrafı"
          className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-indigo-600"
        />


        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm">
          Fotoğraf Seç
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {uploading && <p className="text-sm text-gray-500 mt-1">Yükleniyor...</p>}
      </div>


      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Kullanıcı Adı</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">İsim Soyisim</label>
          <input
            type="text"
            value={profile.fullname}
            onChange={(e) => setProfile({ ...profile, fullname: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Yeni Şifre</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            placeholder="Şifre değiştirmek için yeni şifre gir"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition"
        >
          Güncelle
        </button>
      </form>
      <div className="flex justify-center mt-4">
        <Link to="/">
          <button className="bg-green-600 hover:bg-green-900 text-white py-2 px-4 rounded">
            Ana Sayfa
          </button>
        </Link>
      </div>

    </div>
  );
}
