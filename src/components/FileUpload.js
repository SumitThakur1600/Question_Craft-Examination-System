import React, { useState } from 'react';
import FormatValidation from './FormatValidation';

const FileUpload = ({ onFileUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [partitionedData, setPartitionedData] = useState(null);
    const [selectedSet, setSelectedSet] = useState(null);
    const [questionTitles, setQuestionTitles] = useState([]);

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

    const handleUpload = () => {
        console.log("Upload button clicked");
        if (!selectedFile) {
            setErrorMessage('Please select a file.');
            return;
        }

        new FormatValidation().validateFile(selectedFile, handleValidationComplete);
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

            const response = await fetch('${process.env.REACT_APP_BACKEND_URL}/upload', {
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
            onFileUpload(selectedFile);
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

            {!partitionedData && (
                <div className="mt-4 p-4 bg-gray-200 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                    <p className="text-sm text-gray-700">
                        <strong>1. Upload Excel File:</strong> Select an Excel file using the "Choose File" button.<br />
                        <strong>2. Excel Format Requirements:</strong> Your Excel file must include the following headers:
                    </p>
                    <ul className="sm:flex sm:flex-row sm:justify-start sm:space-x-8 flex-col list-disc pl-0 ml-8 text-sm text-gray-700">
                        <li className="mb-2">QuestionId</li>
                        <li className="mb-2">Question Title</li>
                        <li className="mb-2">Difficulty Level</li>
                        <li className="mb-2">Subject</li>
                    </ul>
                    <p className="text-sm text-gray-700 mt-0">
                        <strong>3. Expected Result:</strong> Upon successful upload, the system will automatically generate three sets of questions. Each set will be balanced in terms of difficulty level, and no question will be repeated across sets. Click on Set A, Set B, or Set C buttons to view each set.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;