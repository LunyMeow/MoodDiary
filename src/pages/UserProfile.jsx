import { useParams } from "react-router-dom";
import { getFirebaseDB } from "../services/firebase";
import { query, collection, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useEffect, useState } from "react";
import { decrypt } from "../utils/crypto";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function UserProfile() {
    const debug = false;
    const log = (...args) => debug && console.log("[UserProfile]", ...args);

    const { username } = useParams();
    const db = getFirebaseDB();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const [userData, setUserData] = useState(null);
    const [diaries, setDiaries] = useState([]);

    useEffect(() => {
        const fetchUserByUsername = async () => {
            try {
                const q = query(collection(db, "users"), where("username", "==", username));
                const snap = await getDocs(q);

                if (snap.empty) {
                    log("Kullanıcı bulunamadı:", username);
                    return;
                }

                const userDoc = snap.docs[0];
                const user = { uid: userDoc.id, ...userDoc.data() };
                setUserData(user);
                log("Kullanıcı bulundu:", user);

                const diariesQuery = query(
                    collection(db, "diaries"),
                    where("userId", "==", user.uid),
                    where("status", "==", "public")
                );
                const diarySnap = await getDocs(diariesQuery);

                const diaryData = diarySnap.docs.map((d) => {
                    const data = d.data();
                    let decryptedContent = "";

                    try {
                        decryptedContent = decrypt(data.content, data.aesPass || "default");
                    } catch (err) {
                        log("Decrypt hatası:", err);
                        decryptedContent = "[İçerik çözülemedi]";
                    }

                    return {
                        id: d.id,
                        ...data,
                        decryptedContent,
                    };
                });

                setDiaries(diaryData);
                log("Günlükler yüklendi:", diaryData);
            } catch (err) {
                log("fetchUserByUsername hatası:", err);
            }
        };

        fetchUserByUsername();
    }, [username]);

    if (!userData) return <p>Kullanıcı bulunamadı.</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-700 p-6 dark:from-black dark:to-gray-800">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg dark:bg-gray-800">
                <div className="flex items-center gap-4 mb-6">
                    <img src={userData.photoURL || "/default.png"} className="w-20 h-20 rounded-full" />
                    <h1 className="text-2xl font-bold text-indigo-800 dark:text-white">{userData.fullname}</h1>

                    <div className="flex gap-4 mb-4">
                        {userData.followers?.includes(currentUser?.uid) ? (
                            <button
                                onClick={async () => {
                                    await updateDoc(doc(db, "users", userData.uid), {
                                        followers: arrayRemove(currentUser.uid)
                                    });
                                    await updateDoc(doc(db, "users", currentUser.uid), {
                                        following: arrayRemove(userData.uid)
                                    });
                                    setUserData({
                                        ...userData,
                                        followers: userData.followers.filter(uid => uid !== currentUser.uid)
                                    });
                                }}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded"
                            >
                                Takipten Çık
                            </button>
                        ) : (
                            <button
                                onClick={async () => {
                                    await updateDoc(doc(db, "users", userData.uid), {
                                        followers: arrayUnion(currentUser.uid)
                                    });
                                    await updateDoc(doc(db, "users", currentUser.uid), {
                                        following: arrayUnion(userData.uid)
                                    });
                                    setUserData({
                                        ...userData,
                                        followers: [...(userData.followers || []), currentUser.uid]
                                    });
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                            >
                                Takip Et
                            </button>
                        )}

                        {userData.blocked?.includes(userData.uid) ? (
                            <button
                                onClick={async () => {
                                    if (window.confirm("Bu kullanıcının engelini kaldırmak istediğinize emin misiniz?")) {
                                        await updateDoc(doc(db, "users", currentUser.uid), {
                                            blocked: arrayRemove(userData.uid)
                                        });
                                        setUserData({
                                            ...userData,
                                            blocked: userData.blocked.filter(uid => uid !== userData.uid)
                                        });
                                        alert("Engel kaldırıldı.");
                                    }
                                }}
                                className="text-sm text-purple-600 hover:underline bg-slate-100"
                            >
                                Engel Kaldır
                            </button>
                        ) : (
                            <button
                                onClick={async () => {
                                    if (window.confirm("Bu kullanıcıyı engellemek istediğinize emin misiniz?")) {
                                        await updateDoc(doc(db, "users", currentUser.uid), {
                                            blocked: arrayUnion(userData.uid)
                                        });
                                        setUserData({
                                            ...userData,
                                            blocked: [...(userData.blocked || []), userData.uid]
                                        });
                                        alert("Kullanıcı engellendi.");
                                    }
                                }}
                                className="text-sm text-red-600 hover:underline bg-yellow-300 hover:bg-yellow-500"
                            >
                                Bu kullanıcıyı engelle
                            </button>
                        )}
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Paylaşılan Günlükler</h2>
                {diaries.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-300">Bu kullanıcı henüz herkese açık günlük paylaşmamış.</p>
                ) : (
                    <ul className="space-y-4">
                        {diaries.map((diary) => (
                            <li key={diary.id} className="border p-4 rounded shadow bg-white dark:bg-gray-700 dark:text-white">
                                <p>{diary.decryptedContent}</p>
                                <small className="text-gray-500">
                                    {new Date(diary.createdAt?.seconds * 1000).toLocaleString()}
                                </small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <br />
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mb-6 dark:bg-gray-800">
                <Link to="/">
                    <button className="bg-blue-600 hover:bg-blue-900 text-white py-2 px-4 rounded">
                        Ana Sayfa
                    </button>
                </Link>
            </div>
        </div>
    );
}
