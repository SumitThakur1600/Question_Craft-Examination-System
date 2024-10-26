import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherDashboard = ({ setShowNavButtons }) => {
    const [papers, setPapers] = useState([]);
    const [totalTests, setTotalTests] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const { username } = useParams();
    const navigate = useNavigate();
    const [topStudents, setTopStudents] = useState([]);
    const [studentTests, setStudentTests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const response = await axios.get('${process.env.REACT_APP_BACKEND_URL}/api/papers/count', {
                    params: {
                        username: username // Assuming 'username' is defined somewhere in your component
                    }
                });
                setTotalTests(response.data.count);
            } catch (error) {
                console.error('Error fetching papers:', error);
            }
        };

        const fetchTotalStudents = async () => {
            try {
                const response = await axios.post('${process.env.REACT_APP_BACKEND_URL}/api/students/countno', {
                    username: username
                });
                setTotalStudents(response.data.count);
            } catch (error) {
                console.error('Error fetching total students:', error);
            }
        };

        const fetchStudentTests = async () => {
            try {
                const response = await axios.post('${process.env.REACT_APP_BACKEND_URL}/api/studenttestinfo', {
                    username: username
                });
                const updatedStudentTests = response.data.map(test => ({
                    ...test,
                    percentage: ((test.score / test.totalQuestions) * 100).toFixed(2)
                }));
                const sortedByScore = [...updatedStudentTests].sort((a, b) => b.score - a.score);
                setTopStudents(sortedByScore.slice(0, 3));
                setStudentTests(updatedStudentTests);
            } catch (error) {
                console.error('Error fetching student tests:', error);
            }
        };

        fetchPapers();
        fetchTotalStudents();
        fetchStudentTests();
    }, [username]);

    useEffect(() => {
        setShowNavButtons(false);
        return () => setShowNavButtons(true);
    }, [setShowNavButtons]);

    const handleLogout = () => {
        console.log('Logged out');
        sessionStorage.clear();
        navigate('/');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredTests = studentTests.filter(test =>
        test.uniqueCode.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

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
                        <a href={`/TeacherDashboard/${username}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            Dashboard
                        </a>
                        <a href={`/Profile/${username}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.372 0 0 5.372 0 12c0 6.627 5.372 12 12 12s12-5.373 12-12S18.628 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                                <path d="M12 6c-3.313 0-6 2.688-6 6s2.688 6 6 6 6-2.688 6-6-2.688-6-6-6zm0 10c-2.211 0-4-1.789-4-4s1.789-4 4-4 4 1.789 4 4-1.789 4-4 4z" />
                            </svg>
                            Change Password
                        </a>
                        <a href={`/Test/${username}`} className="text-white hover:text-gray-200 transition duration-300 text-lg font-bold flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                                <path d="M12 4c-.55 0-1 .45-1 1v6H7c-.55 0-1 .45-1 1s.45 1 1 1h4v6c0 .55.45 1 1 1s1-.45 1-1v-6h4c.55 0 1-.45 1-1s-.45-1-1-1h-4V5c0-.55-.45-1-1-1z" />
                            </svg>
                            Create Test
                        </a>
                    </div>
                </div>

                {/* Username and Logout Button for larger screens */}
                <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-2 group">
                        <svg className="w-6 h-6 text-white group-hover:text-gray-200 transition duration-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <h2 className="text-xl font-bold group-hover:text-gray-200 transition duration-300">{username}</h2>
                    </div>
                    <button
                        className="flex items-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 shadow-md"
                        onClick={handleLogout}
                    >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 13v-2h-8v2h8zm-6-6h-2v12h2v-12zm8-4v16h-12v-16h12zm0-2h-12c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-16c0-1.1-.9-2-2-2z" />
                        </svg>
                        Logout
                    </button>
                </div>

                {/* Dropdown Menu for mobile screens */}
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
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                            <a href={`/TeacherDashboard/${username}`} className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Dashboard</a>
                            <a href={`/Profile/${username}`} className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Change Password</a>
                            <a href={`/Test/${username}`} className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Create Test</a>
                            <button
                                onClick={handleLogout}
                                className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex-grow flex flex-col items-center py-6 px-4 sm:px-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full sm:w-2/3">
                    <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>
                    <div className="flex justify-between mb-4">
                        <div className="bg-teal-200 text-teal-700 p-4 rounded-lg shadow-md flex-1 mr-4">
                            <h2 className="text-lg font-semibold">Total Tests Generated</h2>
                            <p className="text-2xl">{totalTests}</p>
                        </div>
                        <div className="bg-teal-200 text-teal-700 p-4 rounded-lg shadow-md flex-1">
                            <h2 className="text-lg font-semibold">Total Students</h2>
                            <p className="text-2xl">{totalStudents}</p>
                        </div>
                    </div>
                </div>

                {/* Top Students Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full sm:w-2/3">
                    <h2 className="text-xl font-bold mb-4">Top Students</h2>
                    <ul className="list-disc list-inside">
                        {topStudents.map((student, index) => (
                            <li key={index} className="mb-2">
                                {student.studentUsername} - Score: {student.score}/{student.totalQuestions}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Student Test Info Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full sm:w-2/3">
                    <h2 className="text-xl font-bold mb-4">Student Test Information</h2>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by Unique Code"
                        className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
                    />
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="border border-gray-200 px-10 py-4 text-left">#</th>
                                    <th className="border border-gray-200 px-5 py-4 text-left">Username</th>
                                    <th className="border border-gray-200 px-5 py-4 text-left">Score</th>
                                    <th className="border border-gray-200 px-5 py-4 text-left">Date</th>
                                    <th className="border border-gray-200 px-5 py-4 text-left">Unique Code</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTests.length > 0 ? (
                                    filteredTests.map((test, index) => (
                                        <tr key={test._id} className="hover:bg-gray-100">
                                            <td className="px-10 py-4 text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-5 py-4 text-sm text-gray-900">{test.studentUsername}</td>
                                            <td className="px-5 py-4 text-sm text-gray-900">{test.score}/{test.totalQuestions}</td>
                                            <td className="px-5 py-4 text-sm text-gray-900">{new Date(test.testDate).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 text-sm text-gray-900">{test.uniqueCode}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center px-10 py-4 text-sm text-gray-500">No tests found for the search criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
