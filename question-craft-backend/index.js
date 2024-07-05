const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const bodyParser = require('body-parser');
const { partitionQuestions } = require('./partitionAlgorithm');
const cors = require('cors'); // Import cors middleware
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;
const app = express();
const port = process.env.PORT;//port number
const generatedCodes = new Set();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const mongoURI = 'mongodb://your-username:your-password@your-hostname:27017/your-database' || process.env.MONGODB_URI ; //mongodURI

// Apply CORS middleware to allow requests from localhost:3000
app.use(cors({
  origin: process.env.REACT_APP_FRONTEND_URL // Replace with your client's actual origin
}));

// Retry logic for transient errors
const retryOperation = async (operation, retries = 5, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === retries || !isTransientError(error)) throw error;
      console.log(`Retrying operation (attempt ${attempt}):`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay * attempt)); // Exponential backoff
    }
  }
};

const isTransientError = (error) => {
  return error.code === 112 || error.message.includes('waiting for replication timed out');
};

const storeInDistributedDatabase = async (partitions) => {
  const client = new MongoClient(mongoURI, {
    w: 1, // Acknowledge writes from the primary only
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('Question');

    // Track existing QuestionIds across all sets
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
    // Insert each partition into the corresponding MongoDB collection
    for (let i = 0; i < partitions.length; i++) {
      const set = String.fromCharCode(97 + i); // 'a' for 0, 'b' for 1, 'c' for 2, etc.
      const collectionName = `dbset${set}`;
      const collection = database.collection(collectionName);

      // Filter out documents whose QuestionId already exists in any other set
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
          // Update existingIds after successful insertion
          if (set === 'a') {
            existingIdsA.push(...uniqueDocs.map(doc => doc.QuestionId));
          } else if (set === 'b') {
            existingIdsB.push(...uniqueDocs.map(doc => doc.QuestionId));
          } else if (set === 'c') {
            existingIdsC.push(...uniqueDocs.map(doc => doc.QuestionId));
          }
        } catch (error) {
          if (error.code === 11000) {
            // Handle duplicate key error
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

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: true });

    // Store data in a special structure
    const questions = data.map(row => ({
      QuestionId: row['QuestionId'],
      QuestionTitle: row['Question Title'],
      DifficultyLevel: row['Difficulty Level'],
      Subject: row['Subject'],
    }));

    console.log('Data after reading from file:', questions.length);
    // Partitioning logic using partitionQuestions function
    const partitions = partitionQuestions(questions);

    // Store partitioned data in a distributed database
    storeInDistributedDatabase(partitions);

    // Return partitioned data to frontend
    res.status(200).json({ partitions: partitions, message: 'File processed and data stored successfully!' });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file' });
  }
});

// Endpoint for teacher login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('Question');
    const usersCollection = db.collection('teacher');

    // Check if user exists
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint for teacher signup
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('Question');
    const usersCollection = db.collection('teacher');

    // Check if username already exists
    const existingUsername = await usersCollection.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Check if email already exists
    const existingEmail = await usersCollection.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Insert new user into the database
    const newUser = {
      username,
      email,
      password: hashedPassword,
    };

    const result = await usersCollection.insertOne(newUser);

    console.log('Teacher created successfully:', result.insertedId);

    res.status(201).json({ message: 'Teacher created successfully' });
  } catch (error) {
    console.error('Teacher signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/student/login', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if student exists
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db('Question');
    const studentsCollection = db.collection('students');

    const student = await studentsCollection.findOne({ username, email });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: student._id }, 'secret', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const generatedStudentCodes = new Set();

// Function to generate a unique student code
function generateStudentUniqueCode(studentName) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code;

  do {
    code = studentName.slice(0, 3).toUpperCase(); // Take first 3 characters of the student's name and convert to uppercase
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
  } while (generatedStudentCodes.has(code));

  generatedStudentCodes.add(code);
  return code;
}

function generatePaperName(username, email, paperName) {
  if (!email) {
    throw new Error('Email is null or undefined');
  }
  // Extract characters of email until '@'
  const atIndex = email.indexOf('@');
  const emailPrefix = atIndex !== -1 ? email.substring(0, atIndex) : email;

  // Combine username, email prefix, and paperName to form a unique identifier
  const uniqueIdentifier = `${username}_${emailPrefix}_${paperName}`;

  // Return the combined identifier
  return uniqueIdentifier;
}
app.post('/api/student/signup', async (req, res) => {
  const { username, email, password, paperName } = req.body;

  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('Question');
    const studentsCollection = db.collection('students');

    // Check if username already exists
    const existingUsername = await studentsCollection.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Check if email already exists
    const existingEmail = await studentsCollection.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
    const uniquePaperName = generatePaperName(username, email, paperName);

    const uniqueCode = generateStudentUniqueCode(username);
    // Insert new student into the database
    const newStudent = {
      username,
      email,
      password: hashedPassword,
      paperName: uniquePaperName,
      uniqueCode,
    };

    const result = await studentsCollection.insertOne(newStudent);
    console.log('Student created successfully:', result.insertedId);
    res.status(201).json({ message: 'Student created successfully', uniqueCode });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/teacher/change-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db('Question');
    const teachersCollection = db.collection('teacher');

    // Find the teacher
    const teacher = await teachersCollection.findOne({ username });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Validate current password
    const isPasswordValid = await bcrypt.compare(currentPassword, teacher.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Salt rounds = 10

    // Update the password in the database
    const result = await teachersCollection.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      throw new Error('Password update failed');
    }

    console.log(`Password updated for teacher ${username}`);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PaperSchema = new mongoose.Schema({
  paperName: { type: String, required: true },
  teacherUsername: { type: String, required: true },
  paperSets: {
    setA: {
      uniqueCode: { type: String, required: true },
      questions: [{ type: mongoose.Schema.Types.Mixed }]
    },
    setB: {
      uniqueCode: { type: String, required: true },
      questions: [{ type: mongoose.Schema.Types.Mixed }]
    },
    setC: {
      uniqueCode: { type: String, required: true },
      questions: [{ type: mongoose.Schema.Types.Mixed }]
    }
  }
});
const Paper = mongoose.model('Paper', PaperSchema, 'papers');

async function storeDatabase(specialData) {
  try {
    const client = new MongoClient(mongoURI, {
      w: 1, // Acknowledge writes from the primary only
    });

    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('Question');
    const Papers = database.collection('papers'); // Collection name 'papers'

    // Destructure specialData for easier access
    const { paperName, teacherUsername, paperSets } = specialData;

    // Construct the paper document
    const newPaper = {
      paperName,
      teacherUsername,
      paperSets
    };

    // Insert the new paper document into the database
    await Papers.insertOne(newPaper);
    console.log('Paper saved successfully:', newPaper);

    // Optionally return the saved document or an acknowledgment
    return { success: true, message: 'Paper data saved successfully', paper: newPaper };
  } catch (error) {
    console.error('Error saving paper:', error);
    throw new Error('Error saving paper');
  }
}


function generateUniqueCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code;

  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
  } while (generatedCodes.has(code));

  generatedCodes.add(code);
  return code;
}

app.post('/uploadfile', upload.single('file'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: true });

    // Store data in a special structure
    const questions = data.map(row => ({
      QuestionId: row['QuestionId'],
      QuestionTitle: row['Question Title'],
      DifficultyLevel: row['Difficulty Level'],
      Subject: row['Subject'],
      QuestionOption: row['Question Option'],
      Answer: row['Answer'],
    }));

    console.log('Data after reading from file:', questions.length);

    // Partitioning logic using partitionQuestions function
    const partitions = partitionQuestions(questions);

    // Generate unique codes before storing data
    const uniqueCodes = {
      setA: generateUniqueCode(),
      setB: generateUniqueCode(),
      setC: generateUniqueCode(),
    };

    // Example special structure format
    const specialData = {
      paperName: req.body.paperName,
      teacherUsername: req.body.username, // Assuming the teacher's username is sent in the request body
      paperSets: {
        setA: {
          uniqueCode: uniqueCodes.setA,
          questions: partitions[0]
        },
        setB: {
          uniqueCode: uniqueCodes.setB,
          questions: partitions[1]
        },
        setC: {
          uniqueCode: uniqueCodes.setC,
          questions: partitions[2]
        }
      }
    };

    // Store partitioned data in a distributed database
    await storeDatabase(specialData);

    res.status(200).json({ specialData, partitions, message: 'File processed and data stored successfully!' });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file' });
  }
});

// Endpoint to count papers created by the teacher (based on 'teacherUsername')
app.get('/api/papers/count', async (req, res) => {
  const { username } = req.query;

  try {
    if (!username) {
      return res.status(400).json({ error: 'Username parameter is required' });
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Query to count papers where teacherUsername matches the provided username
    const count = await Paper.countDocuments({ teacherUsername: username });
    console.log(`COUNT VALUE FOR ${username} IS `, count); // Log the count value

    // Send response with count
    res.json({ count });
  } catch (error) {
    console.error('Error counting papers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/student/change-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db('Question');
    const teachersCollection = db.collection('students');

    // Find the teacher
    const teacher = await teachersCollection.findOne({ username });

    if (!teacher) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate current password
    const isPasswordValid = await bcrypt.compare(currentPassword, teacher.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Salt rounds = 10

    // Update the password in the database
    const result = await teachersCollection.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      throw new Error('Password update failed');
    }

    console.log(`Password updated for teacher ${username}`);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/student/test-collections', async (req, res) => {
  let client;

  try {
    // Connect to MongoDB Server
    client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    // Access the database and collection
    const db = client.db('Question');
    const papersCollection = db.collection('papers'); // Replace 'papers' with your collection name

    // Fetch papers from collection
    const papers = await papersCollection.find({}).toArray();

    // Process fetched papers
    const collections = papers.map((paper, index) => ({
      srno: index + 1,
      paperName: paper.paperName,
      teacherUsername: paper.teacherUsername,
      totalQuestions: calculateTotalQuestions(paper.paperSets) // Assuming calculateTotalQuestions is defined elsewhere
    }));

    console.log("Result collections:", collections);
    res.status(200).json({ collections });
  } catch (error) {
    console.error('Error fetching test collections:', error);
    res.status(500).json({ error: 'Failed to fetch test collections' });
  } finally {
    // Close the connection when done
    if (client) {
      await client.close();
    }
  }
});

function calculateTotalQuestions(paperSets) {
  let setAQuestions = paperSets?.setA?.questions?.length || 0;
  let setBQuestions = paperSets?.setB?.questions?.length || 0;
  let setCQuestions = paperSets?.setC?.questions?.length || 0;

  if (setAQuestions === setBQuestions && setBQuestions === setCQuestions) {
    return setAQuestions; // Return the length of any set if they all have the same number of questions
  }

  return 0;
}

app.post('/api/check-code', async (req, res) => {
  const { uniqueCode, registeredCode, username, email } = req.body;

  let client;

  try {
    client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db('Question');
    const studentsCollection = db.collection('students');
    const student12 = db.collection('studenttests');
    const papersCollection = db.collection('papers');



    // Find the paper that contains the uniqueCode
    const paper = await papersCollection.findOne({
      $or: [
        { 'paperSets.setA.uniqueCode': uniqueCode },
        { 'paperSets.setB.uniqueCode': uniqueCode },
        { 'paperSets.setC.uniqueCode': uniqueCode }
      ]
    });

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    // Determine which set contains the unique code
    let set = null;
    if (paper.paperSets.setA.uniqueCode === uniqueCode) {
      set = 'setA';
    } else if (paper.paperSets.setB.uniqueCode === uniqueCode) {
      set = 'setB';
    } else if (paper.paperSets.setC.uniqueCode === uniqueCode) {
      set = 'setC';
    }

    if (!set) {
      return res.status(404).json({ error: 'Unique code not found in any set' });
    }

    // Find the student with the registered code
    const student = await studentsCollection.findOne({
      uniqueCode: registeredCode
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found with registered code' });
    }

    // Generate paper name and validate against student's paper name
    const paperName2 = generatePaperName(username, email, paper.paperName);
    if (paperName2 !== student.paperName) {
      return res.status(404).json({ error: 'You are not allowed for this Paper' });
    }

    // Check if student has already taken the test
    const existingTest = await student12.findOne({
      studentUsername: username,
      uniqueCode: uniqueCode
    });
    console.log('Existing Test:', existingTest); // Debug log
    if (existingTest) {
      return res.status(404).json({ error: 'Student has already taken this test' });
    }


    // Return questions of the found set
    res.status(200).json({
      paperName: paper.paperName,
      teacherUsername: paper.teacherUsername,
      questions: paper.paperSets[set].questions
    });

  } catch (error) {
    console.error('Error checking code:', error);
    res.status(500).json({ error: 'Failed to check code' });
  }
});


app.post('/api/studentTests', async (req, res) => {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('Question');
    const collection = db.collection('studenttests');

    const { teacherUsername, studentUsername, testName, testDate, questions, Marks, uniqueCode } = req.body;
    const numericMarks = Number(Marks);

    // Validate Marks value
    if (isNaN(numericMarks)) {
      throw new Error('Invalid value for Marks');
    }

    const studentTest = {
      teacherUsername,
      studentUsername,
      testName,
      testDate: new Date(testDate), // Ensure testDate is a Date object
      questions,
      Marks: numericMarks,
      uniqueCode,
    };

    // Save the student test data to MongoDB
    await collection.insertOne(studentTest);

    // Respond with a success message
    res.json({ message: 'Test data saved successfully' });
  } catch (error) {
    console.error('Error saving test data:', error);
    res.status(500).json({ error: 'Failed to save test data. Please try again.' });
  }
});
const studentTestSchema = new mongoose.Schema({
  teacherUsername: { type: String, required: true },
  studentUsername: { type: String, required: true },
  testName: { type: String, required: true },
  testDate: { type: Date, required: true },
  questions: [{
    questionId: { type: String, required: true },
    questionTitle: { type: String, required: true },
    selectedOption: { type: String, required: true },
    correctOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  Marks: { type: Number, required: true },
  uniqueCode: { type: String, required: true } // Define uniqueCode field
}, { versionKey: false });

// Create a model from the schema
const StudentTest = mongoose.model('StudentTest', studentTestSchema, 'studenttests');

app.post('/api/students/countno', async (req, res) => {
  const { username } = req.body;
  try {
    if (!username) {
      return res.status(404).json({ error: 'Username parameter is required' });
    }
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    const count = await StudentTest.countDocuments({ teacherUsername: username });
    console.log(`COUNT FOR ${username} IS `, count); // Log the count value
    res.json({ count });
  } catch (error) {
    console.error('Error fetching total students:', error);
    res.status(500).json({ error: 'Failed to fetch total students' });
  }
});
app.post('/api/studenttestinfo', async (req, res) => {
  const { username } = req.body; // Assuming username is sent in the request body

  try {
    if (!username) {
      return res.status(404).json({ error: 'Username parameter is required' });
    }

    // Ensure to establish MongoDB connection before querying
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Fetch student tests based on teacherUsername matching username
    const studentTests = await StudentTest.find({ teacherUsername: username });

    // Format the fetched data for response
    const formattedStudentTests = studentTests.map(test => ({
      studentUsername: test.studentUsername,
      testName: test.testName,
      testDate: test.testDate,
      totalQuestions: test.questions.length,
      score: test.Marks,
      uniqueCode: test.uniqueCode
    }));

    console.log("Formatted Student Tests:", formattedStudentTests);

    // Send formatted data as JSON response
    res.json(formattedStudentTests);
  } catch (error) {
    console.error('Error fetching student tests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = { storeInDistributedDatabase };
