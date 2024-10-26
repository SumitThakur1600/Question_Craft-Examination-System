import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PaperGen from './PaperGen'; // Adjust the path as necessary

const StudentDashboard = ({ setShowNavButtons }) => {
    const [papers, setPapers] = useState([]);
    const { username } = useParams();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        setShowNavButtons(false);
        return () => setShowNavButtons(true);
    }, [setShowNavButtons]);

    const handleLogout = () => {
        console.log('Logged out');
        sessionStorage.clear();
        navigate('/');
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="min-h-screen w-screen bg-teal-700 flex flex-col">
            <div className="bg-gray-800 text-white flex justify-between items-center px-4 py-2 sm:px-6 sm:py-4 shadow-lg">
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-300 to-green-300 p-2 rounded-lg shadow-lg">
                        <span className="text-xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                            Question <span className="text-green-700">Craft</span>
                        </span>
                    </div>

                    {/* Navigation Links for larger screens */}
                    <div className="hidden sm:flex gap-6">
                        <a href={`/StudentDashboard/${username}?email=${email}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            Dashboard
                        </a>
                        <a href={`/Profile2/${username}?email=${email}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                             <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.372 0 0 5.372 0 12c0 6.627 5.372 12 12 12s12-5.373 12-12S18.628 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                                <path d="M12 6c-3.313 0-6 2.688-6 6s2.688 6 6 6 6-2.688 6-6-2.688-6-6-6zm0 10c-2.211 0-4-1.789-4-4s1.789-4 4-4 4 1.789 4 4-1.789 4-4 4z" />
                            </svg>
                            Change Password
                        </a>
                        <a href={`/TestCollection/${username}?email=${email}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                           <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                                <path d="M12 4c-.55 0-1 .45-1 1v6H7c-.55 0-1 .45-1 1s.45 1 1 1h4v6c0 .55.45 1 1 1s1-.45 1-1v-6h4c.55 0 1-.45 1-1s-.45-1-1-1h-4V5c0-.55-.45-1-1-1z" />
                            </svg>
                            Test Collection
                        </a>
                    </div>
                </div>

                {/* Username and Logout Button for larger screens */}
                <div className="hidden sm:flex items-center gap-4">
                    <h2 className="text-xl font-bold">{username}</h2>
                    <button
                        className="flex items-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 shadow-md"
                        onClick={handleLogout}
                    >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 13v-2h-8v2h8zm-6-6h-2v12h2v-12zm8-4v16h-12v-16h12zm0-2h-12c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-16c0-1.1-.9-2-2-2z" />
                        </svg>
                        Logout
                    </button>
                </div>

                {/* Dropdown Menu for Mobile Devices */}
                <div className="relative sm:hidden">
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center text-white hover:text-gray-200 transition duration-300"
                    >
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <a href={`/StudentDashboard/${username}?email=${email}`} className="flex items-center block text-left px-4 py-2 text-gray-800 hover:bg-gray-700">
                                
                                Dashboard
                            </a>
                            <a href={`/Profile2/${username}?email=${email}`} className="flex items-center block text-left px-4 py-2 text-gray-800 hover:bg-gray-700">
                               
                                Change Password
                            </a>
                            <a href={`/TestCollection/${username}?email=${email}`} className="flex items-center block text-left px-4 py-2 text-gray-800 hover:bg-gray-700">
                                
                                Test Collection
                            </a>
                            <button
                                className="flex items-center block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-700"
                                onClick={handleLogout}
                            >
                    
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 text-white p-4 pt-6">
                <div>
                    <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white outline-white pl-2 pt-3">
                        Welcome back, {username}
                    </h1>
                </div>

                {/* Render PaperGen Component */}
                <div className="flex justify-center place-content-center mt-10">
                    <PaperGen username={username} email={email} />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
