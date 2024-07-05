import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FileUploadPage from './components/FileUpload';
import StudentLoginPage from './components/StudentLoginPage';
import TeacherLoginPage from './components/TeacherLoginPage';
import Profile from './components/Profile';
import TeacherDashboard from './components/TeacherDashboard';
import Test from './components/Test';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './components/StudentDashboard';
import Profile2 from './components/Profile2';
import TestCollection from './components/TestCollection';
import ProtectedRoute2 from './components/ProtectedRoute2';
import TestPageEntrance from './components/TestPageEntrance';
import TestPage from './components/TestPage';
const App = () => {
  const [showNavButtons, setShowNavButtons] = useState(true);

  const handleFileUpload = (file) => {
    // Simulate processing the Excel file (replace with actual logic)
    console.log('Processing Excel file:', file);
    // Add any processing logic here if needed
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-300 flex flex-col justify-center items-center">
        <Routes>
          <Route path="/" element={<FileUploadPage onFileUpload={handleFileUpload} />} />
          <Route path="/teacher-login" element={<TeacherLoginPage />} />
          <Route path="/student-login" element={<StudentLoginPage />} />
          <Route
            path="/TeacherDashboard/:username"
            element={
              <ProtectedRoute>
                <TeacherDashboard setShowNavButtons={setShowNavButtons} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Profile/:username"
            element={
              <ProtectedRoute>
                <Profile setShowNavButtons={setShowNavButtons} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Test/:username"
            element={
              <ProtectedRoute>
                <Test setShowNavButtons={setShowNavButtons} />
              </ProtectedRoute>
            }
          />
          <Route
            path="StudentDashboard/:username"
            element={
              <ProtectedRoute2>
                <StudentDashboard setShowNavButtons={setShowNavButtons} />
              </ProtectedRoute2>
            }
          />
          <Route
            path="/Profile2/:username"
            element={
              <ProtectedRoute2>
                <Profile2 setShowNavButtons={setShowNavButtons} />
              </ProtectedRoute2>
            }
          />
          <Route
            path="/TestCollection/:username"
            element={
              <ProtectedRoute2>
                <TestCollection setShowNavButtons={setShowNavButtons} />
              </ProtectedRoute2>
            }
          />
          <Route
            path="/TestPageEntrance"
            element={<TestPageEntrance setShowNavButtons={setShowNavButtons} />}
          />
          <Route
            path="/TestPage"
            element={<TestPage setShowNavButtons={setShowNavButtons} />}
          />

        </Routes>
        {/* Navigation Buttons */}
        {showNavButtons && (
          <div className="absolute top-10 right-12 space-x-4">
            <Link to="/">
              <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Home
              </button>
            </Link>
            <Link to="/teacher-login">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Teacher Login
              </button>
            </Link>
            <Link to="/student-login">
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Student Login
              </button>
            </Link>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
