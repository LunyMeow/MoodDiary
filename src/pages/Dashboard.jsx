import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { getDoc } from "firebase/firestore";  // import ekle


import { useNavigate } from "react-router-dom";
import { deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";






export default function Home() {
    const [diaries, setDiaries] = useState([]);

    const [fullname, setUsername] = useState("");

    const [photoURL, setPhotoURL] = useState("");


    const navigate = useNavigate();

    const user = auth.currentUser;

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchDiaries = async () => {
            const q = query(
                collection(db, "diaries"),
                where("userId", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setDiaries(data);
        };



        const fetchUsername = async () => {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setUsername(data.fullname);
                setPhotoURL(data.photoURL || "/default.png");
            } else {
                setUsername(user.email);
                setPhotoURL("/default.png");
            }
        };



        fetchUsername();

        fetchDiaries();
    }, [user, navigate]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 p-6 dark:from-gray-900 dark:to-black p-6">

            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg dark:bg-gray-800">
                <div className="flex justify-between items-center mb-6 gap-3">




                    <h1 className="text-3xl font-bold text-indigo-700">
                        Hoş geldin, {fullname}
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white py-2  px-4 rounded"
                    >
                        Çıkış
                    </button>
                    <Link to="/Profile">
                        <button class="rounded">Profilim</button>
                    </Link>





                    <img
                        src={photoURL}
                        alt="Profil Fotoğrafı"
                        className="w-24 h-17 rounded-full object-cover"
                    />
                </div>

                <h2 className="text-xl font-semibold mb-4">Günlüklerin</h2>

                {diaries.length === 0 ? (
                    <p>Henüz günlük yazmadın.</p>
                ) : (
                    <ul className="space-y-4">
                        {diaries.map((diary) => (
                            <li
                                key={diary.id}
                                className="border p-4 rounded shadow hover:shadow-md transition"
                            >
                                <p className="text-black dark:text-white">{diary.content}</p>
                                <small className="text-gray-500">
                                    {new Date(diary.createdAt?.seconds * 1000).toLocaleString()}
                                </small>
                                <br />
                                <button
                                    onClick={() => navigate(`/edit/${diary.id}`)}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white mt-2 px-4 py-1 rounded mr-2"
                                >
                                    Düzenle
                                </button>

                                <button
                                    onClick={async () => {
                                        if (window.confirm("Bu günlük silinsin mi?")) {
                                            try {
                                                await deleteDoc(doc(db, "diaries", diary.id));
                                                setDiaries((prev) => prev.filter((d) => d.id !== diary.id));
                                            } catch (error) {
                                                alert("Silme işlemi başarısız oldu!");
                                            }
                                        }
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white mt-2 px-4 py-1 rounded"
                                >
                                    Sil
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <br />
                <button
                    onClick={() => navigate("/NewDiary")}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mr-4"
                >
                    Yeni Günlük Ekle
                </button>




            </div>
        </div>
    );
}
