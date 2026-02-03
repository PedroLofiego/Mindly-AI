import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import LandingPage from "./pages/LandingPage";
import Onboarding from "./pages/Onboarding";
import ChatPage from "./pages/ChatPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  const [view, setView] = useState("landing");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Check for saved profile in localStorage
    const savedProfile = localStorage.getItem("mindly_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        setView("chat");
      } catch (e) {
        localStorage.removeItem("mindly_profile");
      }
    }
  }, []);

  const handleStart = () => {
    setView("onboarding");
  };

  const handleOnboardingComplete = async (profileData) => {
    try {
      const response = await axios.post(`${API}/profiles`, profileData);
      const newProfile = response.data;
      localStorage.setItem("mindly_profile", JSON.stringify(newProfile));
      setProfile(newProfile);
      setView("chat");
    } catch (error) {
      console.error("Error creating profile:", error);
      // Create local profile as fallback
      const localProfile = { ...profileData, id: `local-${Date.now()}` };
      localStorage.setItem("mindly_profile", JSON.stringify(localProfile));
      setProfile(localProfile);
      setView("chat");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mindly_profile");
    setProfile(null);
    setView("landing");
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {view === "landing" && <LandingPage onStart={handleStart} />}
      {view === "onboarding" && <Onboarding onComplete={handleOnboardingComplete} />}
      {view === "chat" && profile && (
        <ChatPage profile={profile} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
