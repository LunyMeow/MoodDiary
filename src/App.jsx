import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewDiary from "./pages/NewDiary";
import EditDiary from "./pages/EditDiary";
import Profile from "./pages/Profile";
import ThemeToggle from "./components/ThemeToggle";

import { initializeFirebase } from "./services/firebase";

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeFirebase().then(() => setReady(true));
  }, []);

  if (!ready) return <div>Firebase yükleniyor...</div>;

  return (
    <Router>
      <div className="relative min-h-screen">
        <div className="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/NewDiary" element={<NewDiary />} />
          <Route path="/edit/:id" element={<EditDiary />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
