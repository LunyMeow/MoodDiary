import { useEffect, useState } from "react";
import {
    getFirebaseAuth,
    getFirebaseDB,
    
} from "../services/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { encrypt, decrypt } from "../utils/crypto";






export default function Home() {


    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    const user = auth?.currentUser;

    const [diaries, setDiaries] = useState([]);
    const [fullname, setUsername] = useState("");
    const [photoURL, setPhotoURL] = useState(null);


    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchDiaries = async () => {
            const q = query(collection(db, "diaries"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                aesPass:doc.aesPass,
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
    }, [user, navigate, db]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 p-6 dark:from-gray-900 dark:to-black p-6">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mb-6 dark:bg-gray-800">
                <h1 className="text-3xl font-bold text-indigo-700 dark:text-white">
                    Hoş geldin, {fullname}
                </h1>
            </div>
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg dark:bg-gray-800">
                <div className="flex justify-between items-top mb-6">
                    {/* Sol taraf */}
                    <div className="flex gap-3">
                        <Link to="/UserRelations">
                            <button className="bg-blue-500 hover:bg-blue-600 text-black py-2 px-4 rounded dark:text-white">
                                İlişkilerim
                            </button>
                        </Link>
                        <Link to="/Profile">
                            <button className="rounded bg-yellow-300 px-4 py-2 dark:bg-green-400 dark:text-white dark:hover:bg-green-500 hover:bg-yellow-400">
                                Profilim
                            </button>
                        </Link>

                        <Link to="/UserSearch">
                            <button className="rounded bg-green-300 px-4 py-2 dark:bg-red-700 dark:text-white hover:bg-green-400 dark:hover:bg-red-800">
                                Kullanıcı Ara
                            </button>
                        </Link>
                    </div>

                    {/* Sağ taraf */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                        >
                            Çıkış
                        </button>
                        <img
                            src={photoURL}
                            alt="Profil Fotoğrafı"
                            className="w-24 h-17 rounded-full object-cover"
                        />
                    </div>
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
                                <p className="text-black dark:text-white">{decrypt(diary.content, diary.aesPass)}</p>
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
