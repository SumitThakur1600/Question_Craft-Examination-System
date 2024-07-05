import React, { useState } from 'react';
import axios from 'axios'; // Ensure axios is imported
import { useNavigate } from 'react-router-dom'; 

const TeacherLoginPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // State to toggle between login and sign up
  const [formHeight, setFormHeight] = useState('h-80'); // Initial height of the form
  const navigate = useNavigate(); 

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('${process.env.REACT_APP_BACKEND_URL}/api/login', { username, password });
      console.log('Login response:', response.data); // Log successful login message

      // Assuming your server returns a token upon successful login
      const token = response.data.token;

      // Call login function from useAuth to set isLoggedIn to true and store token
      sessionStorage.setItem('teacherLoggedIn', 'true');
      sessionStorage.setItem('teacherUsername', username);
      
      // Redirect to TeacherDashboard or another page upon successful login
      navigate(`/TeacherDashboard/${username}`);
    } catch (error) {
      setFormHeight('h-[350px]');
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Login failed. Please try again later.');
      }
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
        setFormHeight('h-80');
      }, 2000); // 3000 milliseconds = 3 seconds
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('${process.env.REACT_APP_BACKEND_URL}/api/signup', { username, email, password });
      console.log('Signup response:', response.data); // Log successful signup message
      alert('Account created successfully!');
      // Clear form fields after account creation
      setUsername('');
      setEmail('');
      setPassword('');
      toggleSignUp();

    } catch (error) {
      console.error('Signup error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Error creating account');
      }
      setFormHeight('h-[480px]');
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
        setFormHeight('h-[460px]');
      }, 2000); // 3000 milliseconds = 3 seconds
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setFormHeight(isSignUp ? 'h-80' : 'h-[460px]');
    // Clear username and password fields when toggling
    setUsername('');
    setEmail('');
    setPassword('');
    setError(''); // Clear any existing error message when toggling
  };

  return (
    <div className="max-h-screen bg-gray-200 flex justify-center items-center">
      <div className={`w-96 max-w-md p-8 bg-white rounded-lg shadow-lg ${formHeight}`}>
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          {isSignUp ? 'Create Teacher Account' : 'Teacher Login'}
        </h1>
        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">
              {error}
            </p>
          )}
          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="registerUsername" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="registerUsername"
                  className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="registerEmail"
                  className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </>
          )}
          {!isSignUp && (
            <div className="form-group">
              <label htmlFor="loginName" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="loginName"
                className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email or username"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="loginPassword"
              className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isSignUp ? 'Create Account' : 'Log in'}
            </button>
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
              onClick={toggleSignUp}
            >
              {isSignUp ? 'Already have an account? Log in' : 'Create a new account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
