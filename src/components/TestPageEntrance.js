import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TestPageEntrance = ({ setShowNavButtons }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paperDetails, setPaperDetails] = useState(null);
    const [username, setUsername] = useState('');
    const [uniqueCode, setUniqueCode] = useState('');
    const [teacherUsername, setTeacherUsername] = useState('');

    useEffect(() => {
        console.log("code is :",uniqueCode);
    }, [uniqueCode])
    // Effect to prevent navigation away from the test page
    useEffect(() => {
        const disableBackNavigation = () => {
            window.history.pushState(null, '', window.location.href);
            window.history.replaceState(null, '', window.location.href);
            window.onpopstate = () => {
                navigate('/student-login'); // Navigate to student-login on back navigation
            };
        };

        disableBackNavigation();

        return () => {
            window.onpopstate = null;
        };
    }, []);

    // Effect to load paper details and handle session storage
    useEffect(() => {
        const loadPaperDetails = async () => {
            if (location.state?.paperDetails && location.state?.username) {
                const details = location.state.paperDetails;
                const name = location.state.username;
                const code = location.state.uniqueCode;
                const teacher = location.state.teacherUsername;
                sessionStorage.setItem('paperDetails', JSON.stringify(details));
                sessionStorage.setItem('username', name); // Store username in session storage
                sessionStorage.setItem('uniqueCode', code); // Store uniqueCode in session storage
                setPaperDetails(details);
                setUsername(name);
                setUniqueCode(code);
                setTeacherUsername(teacher);
                console.log('Paper details loaded:', details); // Log paperDetails to console
                console.log('Username:', name); // Log username to console
                console.log('Unique Code:', code); // Log uniqueCode to console
            } else {
                const storedPaperDetails = sessionStorage.getItem('paperDetails');
                const storedUsername = sessionStorage.getItem('username');
                const storedUniqueCode = sessionStorage.getItem('uniqueCode');
                const storedTeacherUsername = sessionStorage.getItem('teacherUsername');
                if (storedPaperDetails && storedUsername && storedUniqueCode && storedTeacherUsername) {
                    const parsedDetails = JSON.parse(storedPaperDetails);
                    setPaperDetails(parsedDetails);
                    setUsername(storedUsername);
                    setUniqueCode(storedUniqueCode);
                    setTeacherUsername(storedTeacherUsername);
                    console.log('Paper details loaded from session storage:', parsedDetails); // Log paperDetails to console
                    console.log('Username loaded from session storage:', storedUsername); // Log username to console
                    console.log('Unique Code loaded from session storage:', storedUniqueCode); // Log uniqueCode to console
                    console.log('Teacher Username loaded from session storage:', storedTeacherUsername); // Log teacherUsername to console
                }
            }
        };

        loadPaperDetails();
        setShowNavButtons(false);

        return () => {
            setShowNavButtons(true);
        };
    }, [location.state, setShowNavButtons]);

    // Function to shuffle an array
    const shuffleArray = (array) => {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    };

    // Function to handle beginning the test
    const handleBeginTest = () => {
        if (!paperDetails || !paperDetails.questions || paperDetails.questions.length === 0) {
            return;
        }

        // Shuffle the questions
        const shuffledQuestions = shuffleArray(paperDetails.questions);

        // Update paperDetails with shuffled questions
        const updatedPaperDetails = {
            ...paperDetails,
            questions: shuffledQuestions
        };

        // Store updated paperDetails in sessionStorage
        sessionStorage.setItem('paperDetails', JSON.stringify(updatedPaperDetails));

        // Enter fullscreen mode (browser-specific)
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }

        // Navigate to the test page with shuffled questions
        navigate('/TestPage', { state: updatedPaperDetails, username, uniqueCode,teacherUsername });
    };

    // Function to handle before unload event
    const handleBeforeUnload = (event) => {
    };

    // Function to handle keydown event to prevent refreshing (F5, Ctrl+R, Cmd+R)
    const handleKeyDown = (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.cancelBubble=true;
            return false;
    };

    // Function to handle context menu event
    const handleContextMenu = (event) => {
        event.preventDefault();
    };

    // Adding event listeners on component mount
    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // Render when paperDetails is null
    if (!paperDetails) {
        return (
            <div className="container mx-auto mt-8">
                <h2 className="text-2xl font-bold mb-4">Test Page Entrance</h2>
                <p>No paper details found.</p>
            </div>
        );
    }

    // Calculate total questions and total time
    const totalQuestions = paperDetails.questions.length;
    const totalTime = totalQuestions * 30; // Total time in seconds
    const paperName = paperDetails.paperName.split('_')[0];
    // Render test page entrance
    return (
        <div className="min-h-screen bg-slate-800 flex flex-col justify-center items-center w-screen">
            <h2 className="text-4xl font-bold mb-4 text-center text-white font-serif">Online Test: {paperName}</h2>
            <div className="container mx-auto mt-8 bg-gray-100 p-6 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-bold">Teacher: {paperDetails.teacherUsername}</p>
                    <div className="flex flex-col items-center text-sm text-gray-500">
                        <p>Total Questions: {totalQuestions}</p>
                        <p>Total Time: {totalTime} seconds</p>
                    </div>
                </div>
                <div className="text-lg mb-4">
                    <p className="mb-2">Instructions:</p>
                    <ul className="list-disc list-inside">
                        <li>Read each question carefully and ensure comprehension before answering.</li>
                        <li>Once started, the test cannot be paused or restarted.</li>
                        <li>Answer all questions within the allotted time.</li>
                        <li>Make sure to submit your answers before the time expires.</li>
                        <li>Click the "Begin Test" button when you are ready to start.</li>
                        <li>Entering fullscreen mode is required for the exam. If you exit fullscreen mode by pressing "Esc", your exam will be canceled.</li>
                    </ul>
                </div>
                <button
                    className="block mx-auto px-6 py-3 text-white bg-blue-500 rounded-md shadow-md hover:bg-blue-600 transition duration-300"
                    onClick={handleBeginTest}
                >
                    Begin Test
                </button>
            </div>
        </div>
    );
};

export default TestPageEntrance;
