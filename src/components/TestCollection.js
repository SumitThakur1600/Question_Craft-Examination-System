import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const TestCollection = ({ setShowNavButtons }) => {
    const [testCollections, setTestCollections] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { username } = useParams();
    const params = new URLSearchParams(location.search);
    const email = params.get('email');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Fetch test collections from the API
    useEffect(() => {
        const fetchTestCollections = async () => {
            try {
                const response = await axios.post('${process.env.REACT_APP_BACKEND_URL}/api/student/test-collections');
                if (response.data && response.data.collections) {
                    setTestCollections(response.data.collections);
                } else {
                    setTestCollections([]);
                    setError('Failed to fetch test collections. Please try again later.');
                }
            } catch (error) {
                setError('Failed to fetch test collections. Please try again later.');
            }
        };

        fetchTestCollections();
    }, []);

    useEffect(() => {
        setShowNavButtons(false); // Hide navigation buttons when Test Collection page is active
        return () => setShowNavButtons(true); // Reset when component unmounts
    }, [setShowNavButtons]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                            Dashboard
                        </a>
                        <a href={`/Profile2/${username}?email=${email}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                            Change Password
                        </a>
                        <a href={`/TestCollection/${username}?email=${email}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
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
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold mb-4 text-white">Test Collection</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}

                {/* Card view for mobile devices */}
                <div className="block sm:hidden">
                    {testCollections.length > 0 ? (
                        testCollections.map((collection, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-4 mb-4">
                                <h3 className="text-lg font-semibold">{collection.paperName.split('_')[0]}</h3>
                                <p className="text-gray-700">Teacher Username: {collection.teacherUsername}</p>
                                <p className="text-gray-700">Number of Questions: {collection.totalQuestions}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500">No test collections found.</div>
                    )}
                </div>

                {/* Table view for larger screens */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Paper Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher Username</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Questions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {testCollections.length > 0 ? (
                                testCollections.map((collection, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{collection.paperName.split('_')[0]}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.teacherUsername}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.totalQuestions}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No test collections found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TestCollection;
