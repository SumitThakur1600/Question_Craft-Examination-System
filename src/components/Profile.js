import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = ({ setShowNavButtons }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const { username } = useParams();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Function to handle password change
    const handleChangePassword = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('https://papersystem.onrender.com/api/teacher/change-password', {
                username,
                currentPassword,
                newPassword,
            });

            setSuccessMessage(response.data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError(''); 
            setTimeout(() => {
                setSuccessMessage('');
            }, 2000);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('Failed to change password. Please try again later.');
            }
        }
    };

    // Effect to manage navigation buttons visibility
    useEffect(() => {
        setShowNavButtons(false);
        return () => setShowNavButtons(true);
    }, [setShowNavButtons]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    // Function to toggle dropdown visibility
    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
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
                    <div className="hidden sm:flex gap-6">
                        <a href={`/TeacherDashboard/${username}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            Dashboard
                        </a>
                        <a href={`/Profile/${username}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.372 0 0 5.372 0 12c0 6.627 5.372 12 12 12s12-5.373 12-12S18.628 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                                <path d="M12 6c-3.313 0-6 2.688-6 6s2.688 6 6 6 6-2.688 6-6-2.688-6-6-6zm0 10c-2.211 0-4-1.789-4-4s1.789-4 4-4 4 1.789 4 4-1.789 4-4 4z" />
                            </svg>
                            Change Password
                        </a>
                        <a href={`/Test/${username}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                                <path d="M12 4c-.55 0-1 .45-1 1v6H7c-.55 0-1 .45-1 1s.45 1 1 1h4v6c0 .55.45 1 1 1s1-.45 1-1v-6h4c.55 0 1-.45 1-1s-.45-1-1-1h-4V5c0-.55-.45-1-1-1z" />
                            </svg>
                            Create Test
                        </a>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-2 group">
                        <svg className="w-6 h-6 text-white group-hover:text-gray-200 transition duration-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <h2 className="text-xl font-bold group-hover:text-gray-200 transition duration-300">{username}</h2>
                    </div>
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

                <div className="sm:hidden relative">
                    <button
                        onClick={toggleDropdown}
                        className="bg-gray-800 text-white p-2 rounded-lg focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                        </svg>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 w-48 bg-white text-black shadow-lg mt-2 rounded-lg">
                            <a href={`/TeacherDashboard/${username}`} className="block px-4 py-2 hover:bg-gray-200">Dashboard</a>
                            <a href={`/Profile/${username}`} className="block px-4 py-2 hover:bg-gray-200">Change Password</a>
                            <a href={`/Test/${username}`} className="block px-4 py-2 hover:bg-gray-200">Create Test</a>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold mb-4 text-white">Change Password</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

                <form onSubmit={handleChangePassword}>
                    <div className="mb-4">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-white">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-white">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-block bg-slate-900 hover:bg-blue-200 hover:text-black text-white px-4 py-2 font-semibold rounded-md transition duration-300"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
