                                        // FILEUPLOAD

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

            const response = await fetch('http://localhost:3001/upload', {
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
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
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
                <div className="mt-4 flex justify-evenly">
                    <button onClick={() => handleSetButtonClick('setA')} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mr-2">Show Set A</button>
                    <button onClick={() => handleSetButtonClick('setB')} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md mr-2">Show Set B</button>
                    <button onClick={() => handleSetButtonClick('setC')} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md">Show Set C</button>
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
        </div>
    );
};

export default FileUpload;

                                               // FORMATVALIDATION

import * as XLSX from 'xlsx';
class FormatValidation {
    validateFile(selectedFile, onValidationComplete) {
        const handleValidation = () => {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const expectedHeaders = ['QuestionId', 'Question Title', 'Difficulty Level', 'Subject'];
                    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });


                    if (sheetData.length === 0) {
                        console.error('No data found in the Excel sheet.');
                        onValidationComplete(false);
                        return;
                    }


                    const isValidFormat = expectedHeaders.every(header => sheetData[0].includes(header));
                    onValidationComplete(isValidFormat);
                };
                reader.readAsArrayBuffer(selectedFile);
            } catch (error) {
                console.error('Error reading or validating the file:', error);
                onValidationComplete(false);
            }
        };

        handleValidation();
    }
}

export default FormatValidation;

                                                // INDEX

const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const bodyParser = require('body-parser');
const { partitionQuestions } = require('./partitionAlgorithm');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const mongoURI = 'mongodb://192.168.116.131:27017,192.168.116.129:27017,192.168.116.132:27017,192.168.116.133:27018,192.168.116.134:27018/Question?replicaSet=rs0';

// Apply CORS middleware to allow requests from localhost:3000
app.use(cors({
    origin: 'http://localhost:3000'
}));

// Retry logic for transient errors
const retryOperation = async (operation, retries = 5, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === retries || !isTransientError(error)) throw error;
            console.log(`Retrying operation (attempt ${attempt}):`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
};

const isTransientError = (error) => {
    return error.code === 112 || error.message.includes('waiting for replication timed out');
};

const storeInDistributedDatabase = async (partitions) => {
    const client = new MongoClient(mongoURI, {
        w: 1, 
    });

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const database = client.db('Question');

        const existingIdsA = await database.collection('dbseta').distinct('QuestionId');
        const existingIdsB = await database.collection('dbsetb').distinct('QuestionId');
        const existingIdsC = await database.collection('dbsetc').distinct('QuestionId');
        const countNewInsertions = (docs, existingIds) => {
            let count = 0;
            docs.forEach(doc => {
                if (!existingIds.includes(doc.QuestionId)) {
                    count++;
                }
            });
            return count;
        };
        for (let i = 0; i < partitions.length; i++) {
            const set = String.fromCharCode(97 + i);
            const collectionName = `dbset${set}`;
            const collection = database.collection(collectionName);

            const uniqueDocs = partitions[i].filter(doc => {
                if (set === 'a') {
                    return !existingIdsB.includes(doc.QuestionId) && !existingIdsC.includes(doc.QuestionId);
                } else if (set === 'b') {
                    return !existingIdsA.includes(doc.QuestionId) && !existingIdsC.includes(doc.QuestionId);
                } else if (set === 'c') {
                    return !existingIdsA.includes(doc.QuestionId) && !existingIdsB.includes(doc.QuestionId);
                }
            });

            if (uniqueDocs.length > 0) {
                try {
                    const result = await retryOperation(() => collection.insertMany(uniqueDocs, {
                        writeConcern: { w: 1 },
                        ordered: false
                    }));

                    const newInsertionsCount = countNewInsertions(uniqueDocs, set === 'a' ? existingIdsA : (set === 'b' ? existingIdsB : existingIdsC));
                    console.log(`Inserted ${newInsertionsCount} new documents into ${collectionName}`);
                    if (set === 'a') {
                        existingIdsA.push(...uniqueDocs.map(doc => doc.QuestionId));
                    } else if (set === 'b') {
                        existingIdsB.push(...uniqueDocs.map(doc => doc.QuestionId));
                    } else if (set === 'c') {
                        existingIdsC.push(...uniqueDocs.map(doc => doc.QuestionId));
                    }
                } catch (error) {
                    if (error.code === 11000) {
                        const duplicateIds = uniqueDocs.filter(doc => {
                            const existingIds = set === 'a' ? existingIdsA.concat(existingIdsB, existingIdsC) :
                                (set === 'b' ? existingIdsB.concat(existingIdsA, existingIdsC) :
                                    existingIdsC.concat(existingIdsA, existingIdsB));
                            return existingIds.includes(doc.QuestionId);
                        }).map(doc => doc.QuestionId);

                        console.error(`Error: Duplicate key error (Data Already Present) in ${collectionName} for QuestionIds: ${duplicateIds.join(', ')}`);
                        const successfulInsertionsCount = uniqueDocs.length - duplicateIds.length;
                        console.log(`Inserted ${successfulInsertionsCount} documents into ${collectionName}`);
                    } else {
                        console.error('Error during insertion:', error);
                    }
                }
            } else {
                console.log(`No new documents to insert into ${collectionName}`);
            }
        }

        console.log('Data stored in distributed database (MongoDB) successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
};

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const buffer = req.file.buffer;
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: true });

        const questions = data.map(row => ({
            QuestionId: row['QuestionId'],
            QuestionTitle: row['Question Title'],
            DifficultyLevel: row['Difficulty Level'],
            Subject: row['Subject'],
        }));

        console.log('Data after reading from file:', questions.length);
        const partitions = partitionQuestions(questions);

        storeInDistributedDatabase(partitions);

        res.status(200).json({ partitions: partitions, message: 'File processed and data stored successfully!' });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Error processing file' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = { storeInDistributedDatabase };

                                           // PARTITIONQUESTION

const partitionQuestions = (questions) => {
    
    if (!Array.isArray(questions)) {
        throw new Error("Invalid input: Questions must be provided in an array");
    }

    if (questions.length < 3) {
        throw new Error("Invalid input: At least 3 questions are required to partition into 3 sets");
    }
    
    const counts = { 'Easy': 0, 'Medium': 0, 'Hard': 0 };
    questions.forEach(question => {
        if (question && typeof question === 'object') {
            if (!question.DifficultyLevel) {
                throw new Error(`DifficultyLevel is missing for question: ${JSON.stringify(question)}`);
            }
            if (typeof question.DifficultyLevel !== 'string') {
                throw new Error(`DifficultyLevel should be a string, but got ${typeof question.DifficultyLevel} for question: ${JSON.stringify(question)}`);
            }
            const difficultyLevel = question.DifficultyLevel.trim();
            if (['Easy', 'Medium', 'Hard'].includes(difficultyLevel)) {
                counts[difficultyLevel]++;
            } else {
                throw new Error(`Unknown difficulty level encountered for question: ${JSON.stringify(question)}`);
            }
        } else {
            throw new Error(`Invalid question object: ${JSON.stringify(question)}`);
        }
    });
    
    const totalQuestions = questions.length;
    const minQuestionsPerSet = Math.floor(totalQuestions / 3);
    const remainder = totalQuestions % 3;

    if (remainder !== 0) {
        questions.sort((a, b) => {
            const levelOrder = ['Hard', 'Medium', 'Easy'];
            return levelOrder.indexOf(b.DifficultyLevel) - levelOrder.indexOf(a.DifficultyLevel);
        });

        const difficultyLevels = ['Hard', 'Medium', 'Easy'];
        let removedCount = 0;

        for (const level of difficultyLevels) {
            if (removedCount >= remainder) break;

            let i = 0;
            while (counts[level] > minQuestionsPerSet && removedCount < remainder && i < questions.length) {
                if (questions[i].DifficultyLevel === level) {
                    questions.splice(i, 1);
                    counts[level]--;
                    removedCount++;
                } else {
                    i++;
                }
            }
        }
    }

    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    console.log(questions.length);
    
    const sets = [[], [], []];
    const numQuestionsPerSet = Math.floor(totalQuestions / 3); 
    const usedQuestions = new Set();
    let setIndex = 0; 

    ['Hard', 'Medium', 'Easy'].forEach(level => {
        const filteredQuestions = questions.filter(question => question.DifficultyLevel === level);
        filteredQuestions.forEach(question => {
            while (sets[setIndex].length >= numQuestionsPerSet) {
                setIndex = (setIndex + 1) % 3;
            }

            if (!usedQuestions.has(question)) {
                sets[setIndex].push(question);
                usedQuestions.add(question); 
                setIndex = (setIndex + 1) % 3; 
            }
        });
    });
    let remainingQuestions = questions.filter(question => !usedQuestions.has(question));
    remainingQuestions.forEach(question => {
        
        const minSetLength = Math.min(...sets.map(set => set.length));
        const minSetIndex = sets.findIndex(set => set.length === minSetLength);
        sets[minSetIndex].push(question);
    });

    return sets;
};

module.exports = { partitionQuestions };
