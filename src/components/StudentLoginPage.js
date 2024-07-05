import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [paperName, setPaperName] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [formHeight, setFormHeight] = useState('h-[400px]');
  const navigate = useNavigate();
  const [uniqueCode, setUniqueCode] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      console.log(username);
      console.log(password);
      console.log(email);
      const response = await axios.post('${process.env.REACT_APP_BACKEND_URL}/api/student/login', { username, password, email });
      console.log('Login response:', response.data);

      const token = response.data.token;

      sessionStorage.setItem('studentLoggedIn', 'true');
      sessionStorage.setItem('studentUsername', username);

      navigate(`/StudentDashboard/${username}?email=${email}`);
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password');
      setFormHeight('h-[430px]');

      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Login failed. Please try again later.');
      }

      setTimeout(() => {
        setError('');
        setFormHeight('h-[400px]');
      }, 2000);
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('${process.env.REACT_APP_BACKEND_URL}/api/student/signup', { username, email, password, paperName });
      console.log('Signup response:', response.data);
      const generatedCode = response.data.uniqueCode;
      setUniqueCode(generatedCode);
      alert('Account created successfully!');

      setUsername('');
      setEmail('');
      setPassword('');
      setPaperName('');

    } catch (error) {
      console.error('Signup error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Error creating account');
      }
      setFormHeight('h-[570px]');

      setTimeout(() => {
        setError('');
        setFormHeight('h-[540px]');
      }, 2000);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setFormHeight(isSignUp ? 'h-[410px]' : 'h-[540px]');
    setUsername('');
    setPassword('');
    setEmail('');
    setPaperName('');
    setUniqueCode('');
    setError('');
  };

  return (
    <div className="max-h-screen bg-gray-200 flex justify-center items-center">
      <div className={`w-96 max-w-md p-8 bg-white rounded-lg shadow-lg ${formHeight}`}>
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          {isSignUp ? 'Create Student Account' : 'Student Login'}
        </h1>
        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">
              {error}
            </p>
          )}
          {isSignUp && (
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
          )}
          {isSignUp && (
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
          )}
          {!isSignUp && (
            <div className="form-group">
              <label htmlFor="loginUsername" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="loginUsername"
                className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                required
              />
            </div>
          )}
          {!isSignUp && (
            <div className="form-group">
              <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="loginEmail"
                className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="registerPaperName" className="block text-sm font-medium text-gray-700">
                Paper Name
              </label>
              <input
                type="text"
                id="registerPaperName"
                className="form-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={paperName}
                onChange={(e) => setPaperName(e.target.value)}
                placeholder="Enter your paper name"
                required
              />
            </div>
          )}

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

        {uniqueCode && (
          <p className="text-green-500 text-xl text-center mt-2">
            Your unique code: {uniqueCode}
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentLoginPage;
