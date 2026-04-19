import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import UploadResume from "./pages/UploadResume";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import SkillStrength from "./pages/SkillStrength";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DiscoverJobs from "./pages/DiscoverJobs";
import JobDetails from "./pages/JobDetails";
import ApplicationTracking from "./pages/ApplicationTracking";
import CareerInsights from "./pages/CareerInsights";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import LearningHub from "./pages/LearningHub";
import LearningRoadmaps from "./pages/LearningRoadmaps";
import "./App.css";

function App() {
  const [result, setResult] = useState(null);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Aurora-style animated background */}
        <div className="fixed inset-0 z-0 aurora-bg" />

        {/* Global navigation */}
        <Navbar />

        {/* Page routes with transitions */}
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadResume setResult={setResult} />} />
            <Route path="/results" element={<Results result={result} />} />
            <Route path="/dashboard" element={<Dashboard result={result} />} />
            <Route path="/about" element={<About />} />
            <Route path="/strength" element={<SkillStrength result={result} />} />
            <Route path="/profile" element={<Profile result={result} />} />
            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Jobs & Companies */}
            <Route path="/discover" element={<DiscoverJobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            {/* User Features */}
            <Route path="/applications" element={<ApplicationTracking />} />
            <Route path="/saved-jobs" element={<ApplicationTracking />} />
            <Route path="/career-insights" element={<CareerInsights />} />
            <Route path="/learning-hub" element={<LearningHub />} />
            <Route path="/roadmaps" element={<LearningRoadmaps />} />
            <Route path="/roadmaps/:skill" element={<LearningRoadmaps />} />
            <Route path="/my-profile" element={<UserProfile />} />
            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
