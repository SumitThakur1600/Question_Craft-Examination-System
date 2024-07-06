# Question_Craft (Examination System)

## Description
QuestionCraft is a comprehensive web application designed to revolutionize educational exam management for teachers and students. Teachers can log in to a dynamic dashboard to add, edit, and manage questions in a centralized question bank, generate and partition exam papers into three distinct sets with unique codes, and upload questions via Excel files. They can track all generated papers, monitor student participation, and view performance analytics, including the number of students who have taken each test, total tests created, and top performers. When creating tests, teachers receive unique codes for each set and provide students with these codes and paper names during account creation. Students create accounts using the unique code and paper name, log in to view all tests, and use their unique and registered codes to access the test page entrance. The user-friendly interface ensures seamless navigation, making the exam process efficient and streamlined. QuestionCraft is the ideal solution for schools and educational institutions aiming to modernize their exam management processes.
## Features
### Features of QuestionCraft

1. **Teacher Dashboard:**
   - **Student Performance Tracking:** Teachers can see the number of students who have taken tests and the total number of tests created.
   - **Student Information:** Access detailed student info and top performance metrics.
   - **Test Creation:** Teachers can create tests and receive a unique code for each set. This code is provided to students for test access.
   - **Question Partitioning:** Teachers can view questions partitioned into different sets for focused review.

2. **Student Account Management:**
   - **Account Creation:** During account creation, students are required to provide a paper name and a unique code issued by their teacher. This ensures secure access to tests and enables teachers to manage student participation effectively.
   - **Login and Access:** Once registered, students can log in to their dashboard.

3. **Student Dashboard:**
   - **Test List:** Students can see all tests created so far.
   - **Test Access:** Input fields for entering the unique code (provided by teachers) and registered code (given after account creation) to access the test page.

4. **Test Participation:**
   - **Test Page:** After entering the unique code and registered code, students can access the test screen and participate in exams.Upon entering the required codes, students gain access to the test screen to participate in exams. Attempting to exit the screen during the test triggers an automatic submission when the time limit expires, ensuring integrity and completion.

### Technology Used:

- **Frontend:** QuestionCraft utilizes ReactJS, a powerful JavaScript library for building user interfaces. ReactJS enables the creation of dynamic and responsive frontend components, ensuring a smooth user experience for teachers and students.

- **Backend:** The backend of QuestionCraft is powered by Node.js, a server-side JavaScript runtime. Express.js, a popular framework for Node.js, is used to handle server-side logic, routing, and API integrations. This combination allows QuestionCraft to manage authentication, data processing, and communication between the frontend and backend seamlessly.

- **Database:** QuestionCraft employs MongoDB as its database solution. MongoDB is a distributed NoSQL database known for its flexibility, scalability, and performance. It stores and manages various types of data required by QuestionCraft, including exam configurations, student information, test results, and more. Its distributed nature ensures high availability and fault tolerance, crucial for an application handling exam management and student data.

   ---

## GUIDE

### Prerequisites:
- **Node.js and npm:** Required to run the backend server and manage dependencies.
- **MongoDB:** Used as the database backend for QuestionCraft.
- **Git:** Necessary for cloning the project repository from version control.

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Question_Craft-Examination-System
   ```

2. **Backend Setup**
   - Navigate to the backend directory:
     ```bash
     cd question-craft-backend(Name of Backend)
     ```
   - Install backend dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `backend` directory and configure environment variables such as MongoDB URI , PORT And REACT_APP_FRONTEND_URL  .

3. **Frontend Setup**
   - Open a new terminal window.
   - Navigate to the frontend directory:
     ```bash
     cd Question_Craft-Examination-System(Name of Project)
     ```
   - Install frontend dependencies:
     ```bash
     npm install
     ```
    - Create a `.env` file in the `frontend` directory and configure environment variables such as REACT_APP_BACKEND_URL  .


4. **MongoDB Setup**
   - Ensure MongoDB is installed and running.
   - Configure MongoDB URI in the `.env` file located in the backend directory.

5. **Start the Application**
   - Start the backend server:
     ```bash
     npm start
     ```
   - Start the frontend development server in another terminal window:
     ```bash
     npm start
     ```
   - Access QuestionCraft in your web browser.

MongoDB is used as the database backend for QuestionCraft due to its:

- **Flexibility:** MongoDB's document-based model allows for flexible and schema-free data storage, which is ideal for managing various types of data related to exams, questions, students, and results.

- **Scalability:** MongoDB's ability to scale horizontally across multiple servers or clusters ensures high availability and fault tolerance, crucial for applications like QuestionCraft that may experience rapid growth in data volume and user interactions.

- **Performance:** MongoDB's indexing, query optimization, and in-memory storage engine (WiredTiger) ensure efficient data retrieval and processing, optimizing performance for concurrent exam sessions and student interactions.

- **Integration with Node.js:** MongoDB integrates seamlessly with Node.js applications through its native driver and Mongoose ORM, facilitating efficient data manipulation, query execution, and transaction management in QuestionCraft's backend.
- 
---

## Future Enhancements

- **Enhanced Analytics:** Implement more advanced analytics and visualizations to provide deeper insights into student performance trends and assessment outcomes.

- **Mobile Application:** Develop a dedicated mobile app for both teachers and students, allowing easy access to exams, results, and notifications on smartphones and tablets.

- **Advanced Security Features:** Enhance security measures with features like two-factor authentication (2FA), data encryption, and role-based access control (RBAC) to ensure the privacy and integrity of exam data.

- **Real-time Collaboration:** Introduce real-time collaboration capabilities for teachers, enabling them to co-author exams, share resources, and provide feedback synchronously.

- **Accessibility Improvements:** Improve accessibility features to meet WCAG standards, ensuring inclusivity and usability for users with disabilities.

# Project Complete

Congratulations on completing QuestionCraft, your comprehensive web application for educational exam management! Here’s a quick recap of what you’ve accomplished:

---
