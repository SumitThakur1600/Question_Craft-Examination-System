import React, { useEffect } from 'react'; // Import useEffect
import { useNavigate, useParams } from 'react-router-dom';
import FileUploadComp from './FileUploadComp';

const Test = ({ setShowNavButtons }) => {
    const navigate = useNavigate();
    const { username } = useParams();

    // Effect to manage navigation buttons visibility
    useEffect(() => {
        setShowNavButtons(false); // Hide navigation buttons when Test page is active
        return () => setShowNavButtons(true); // Reset when component unmounts
    }, [setShowNavButtons]);

    const handleLogout = () => {
        console.log('Logged out');
        sessionStorage.clear();
        navigate('/');
    };

    return (
        <div className="min-h-screen w-screen bg-teal-800 flex flex-col">
            <div className="bg-gray-800 text-white flex justify-between items-center px-6 py-4 shadow-lg">
                {/* Left Side: Logo and Navigation Links */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-300 to-green-300 p-2 rounded-lg shadow-lg">
                        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                            Question <span className="text-green-700">Craft</span>
                        </span>
                    </div>
                    <div className="flex flex-row gap-6 mt-0">
                        <a href={`/TeacherDashboard/${username}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold">Dashboard</a>
                        <a href={`/Profile/${username}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold">Change Password</a>
                        <a href={`/Test/${username}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold">Create Test</a>
                    </div>
                </div>

                {/* Right Side: User Info and Logout */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group">
                        <svg className="w-6 h-6 text-white group-hover:text-gray-200 transition duration-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <h2 className="text-xl font-bold group-hover:text-gray-200 transition duration-300">{username}</h2>
                    </div>
                    <div>
                        <button className="flex items-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 shadow-md" onClick={handleLogout}>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 13v-2h-8v2h8zm-6-6h-2v12h2v-12zm8-4v16h-12v-16h12zm0-2h-12c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-16c0-1.1-.9-2-2-2z" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="container mx-auto px-4 py-8">
                <FileUploadComp username={username} /> {/* Render the FileUpload component */}
                {/* Add specific content related to test management here */}

            </div>
        </div>
    );
};

export default Test;
