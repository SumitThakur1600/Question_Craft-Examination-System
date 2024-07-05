import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams,useLocation } from 'react-router-dom';

const TestCollection = ({ setShowNavButtons }) => {
    const [testCollections, setTestCollections] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation(); 
    const { username } = useParams();
    const params = new URLSearchParams(location.search);
    const email = params.get('email');

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
        console.log('Logged out');
        sessionStorage.clear();
        navigate('/');
    };

    return (
        <div className="min-h-screen w-screen bg-teal-800 flex flex-col">
            <div className="bg-gray-800 text-white flex justify-between items-center px-6 py-4 shadow-lg">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-300 to-green-300 p-2 rounded-lg shadow-lg">
                        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                            Question <span className="text-green-700">Craft</span>
                        </span>
                    </div>
                    <div className="flex flex-row gap-6 mt-0">
                        <a href={`/StudentDashboard/${username}?email=${email}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold">Dashboard</a>
                        <a href={`/Profile2/${username}?email=${email}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold">Change Password</a>
                        <a href={`/TestCollection/${username}?email=${email}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold">Test Collection</a>
                    </div>
                </div>

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

            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold mb-4 text-white">Test Collection</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="overflow-x-auto">
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
                                testCollections.map((collection, index) => {
                                    // Split the paperName to get only the papername part
                                    const paperName = collection.paperName.split('_')[0];

                                    return (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paperName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.teacherUsername}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.totalQuestions}</td>
                                        </tr>
                                    );
                                })
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
