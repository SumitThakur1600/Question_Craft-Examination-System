import React, { useState } from 'react';
import FormatValidationNew from './FormatValidationNew';
import { useEffect } from 'react';
const FileUploadComp = ({ username }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [paperName, setPaperName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [partitionedData, setPartitionedData] = useState(null);
    const [selectedSet, setSelectedSet] = useState(null);
    const [questionTitles, setQuestionTitles] = useState([]);
    const [uniqueCodes, setUniqueCodes] = useState({
        setA: null,
        setB: null,
        setC: null
    });
    const [retrievedPaperName, setRetrievedPaperName] = useState('');
    const [showInstructions, setShowInstructions] = useState(true); // Track whether to show instructions

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage('');
            }, 2000); // Clear the error message after 5 seconds

            return () => clearTimeout(timer); // Clear timer if the component is unmounted or if errorMessage changes
        }
    }, [errorMessage]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log("File input changed:", file);

        const validMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (file && !validMimeTypes.includes(file.type)) {
            setErrorMessage('Invalid file type. Please upload an Excel file.');
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
        setErrorMessage('');
    };

    const checkDuplicatePaperName = async (name) => {
        try {
            const response = await fetch('${process.env.REACT_APP_BACKEND_URL}/checkPaperName?paperName=${encodeURIComponent(name)}');
            const data = await response.json();
            return data.exists; // Assuming the response contains an 'exists' field indicating duplication
        } catch (error) {
            console.error('Error checking paper name:', error);
            setErrorMessage('Error checking paper name');
            return true;
        }
    };

    const handleUpload = async () => {
        console.log("Upload button clicked");
        if (!selectedFile) {
            setErrorMessage('Please select a file.');
            return;
        }

        if (!paperName.trim()) {
            setErrorMessage('Paper Name is required.');
            return;
        }
        const fullpaperName = `${paperName}_${username}`;
        const isDuplicate = await checkDuplicatePaperName(fullpaperName);
        if (isDuplicate) {
            setErrorMessage('Paper Name already exists. Please choose a different name.');
            return;
        }
        new FormatValidationNew().validateFile(selectedFile, handleValidationComplete);
    };

    const handleValidationComplete = (isValidFormat) => {
        if (!isValidFormat) {
            setErrorMessage('Invalid Excel file format');
            setSelectedFile(null);
        } else {
            sendFileToBackend(selectedFile);
        }
    };

    const sendFileToBackend = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('paperName', `${paperName}_${username}`);
            formData.append('username', username); // Append username to FormData

            const response = await fetch('${process.env.REACT_APP_BACKEND_URL}/uploadfile', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const data = await response.json();
            console.log('File upload response:', data);
            console.log('Partitioned Questions:', data.partitions);

            setPartitionedData(data);

            // Assuming data contains specialData with paperSets containing setA, setB, setC
            if (data && data.specialData && data.specialData.paperSets) {
                const { setA, setB, setC } = data.specialData.paperSets;
                setUniqueCodes({
                    setA: setA ? setA.uniqueCode : null,
                    setB: setB ? setB.uniqueCode : null,
                    setC: setC ? setC.uniqueCode : null
                });
                setRetrievedPaperName(data.specialData.paperName || '');
                // Hide instructions if all unique codes are received
                setShowInstructions(false);
                setSelectedFile(null);
                setPaperName('');
            }

        } catch (error) {
            console.error('Error uploading file:', error);
            setErrorMessage('Error uploading file');
        }
    };
    const handleSetButtonClick = (set) => {
        setSelectedSet(set);
        if (partitionedData && partitionedData.partitions && partitionedData.partitions.length > 0) {
            const selectedSetIndex = ['setA', 'setB', 'setC'].indexOf(set);
            if (selectedSetIndex !== -1) {
                const selectedSetData = partitionedData.partitions[selectedSetIndex];
                const selectedSetTitles = selectedSetData.map(question => question.QuestionTitle);
                setQuestionTitles(selectedSetTitles);
            } else {
                console.log(`Partitioned data for set ${set} is not available.`);
            }
        } else {
            console.log("Partitioned data is not available.");
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Excel File</h2>
            <div className="mt-2">
                <label htmlFor="paper-name" className="block text-sm font-medium text-gray-700">Paper Name:</label>
                <input
                    id="paper-name"
                    type="text"
                    className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                    value={paperName}
                    onChange={(e) => setPaperName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Select a file:</label>
                <div className="flex items-center justify-between">
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                    <label htmlFor="file-upload" className="cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md transition duration-300 ease-in-out">Choose File</label>
                    <span className="text-sm text-gray-600">{selectedFile ? selectedFile.name : 'No file selected'}</span>
                </div>
            </div>

            <button onClick={handleUpload} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md mt-4 transition duration-300 ease-in-out">Upload</button>
            {errorMessage && <p className="text-sm text-red-500 mt-2">{errorMessage}</p>}


            {uniqueCodes.setA && uniqueCodes.setB && uniqueCodes.setC && (
                <div className="mt-4 p-4 bg-gray-200 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Unique Codes:</h3>
                    <div className="text-lg text-gray-700">
                        <p><strong>Set A:</strong> {uniqueCodes.setA}</p>
                        <p><strong>Set B:</strong> {uniqueCodes.setB}</p>
                        <p><strong>Set C:</strong> {uniqueCodes.setC}</p>
                        <p><strong>Paper Name:</strong>{retrievedPaperName}</p>
                    </div>
                </div>
            )}
            {partitionedData && (
                <div className="mt-4 flex flex-wrap justify-center sm:justify-evenly">
                    <button onClick={() => handleSetButtonClick('setA')} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 sm:py-2 sm:px-4 rounded-md mb-2 sm:mb-0 mx-1 sm:mx-2">Show Set A</button>
                    <button onClick={() => handleSetButtonClick('setB')} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 sm:py-2 sm:px-4 rounded-md mb-2 sm:mb-0 mx-1 sm:mx-2">Show Set B</button>
                    <button onClick={() => handleSetButtonClick('setC')} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 sm:py-2 sm:px-4 rounded-md mx-1 sm:mx-2">Show Set C</button>
                </div>
            )}

            {questionTitles.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-y-auto" style={{ maxHeight: "300px" }}>
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <ul className="list-disc ml-6">
                        {questionTitles.map((title, index) => (
                            <li key={index} className="mt-2">{title}</li>
                        ))}
                    </ul>
                </div>
            )}

            {showInstructions && (
                <div className="mt-4 p-4 bg-gray-200 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                    <p className="text-sm text-gray-700">
                        <strong>1. Upload Excel File:</strong> Select an Excel file using the "Choose File" button.<br />
                        <strong>2. Excel Format Requirements:</strong> Your Excel file must include the following headers:
                    </p>
                    <ul className="sm:flex sm:flex-row flex-wrap sm:justify-start sm:space-x-8 flex-col list-disc pl-0 ml-8 text-sm text-gray-700">
                        <li className="mb-2">QuestionId</li>
                        <li className="mb-2">Question Title</li>
                        <li className="mb-2">Question Option</li>
                        <li className="mb-2">Difficulty Level</li>
                        <li className="mb-2">Subject</li>
                        <li className="mb-2">Answer</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileUploadComp;
