import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface LoginProps {
  onLoginSuccess: (rollNumber: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    rollNumber: '',
    name: ''
  });

  const validateForm = () => {
    const errors = {
      rollNumber: '',
      name: ''
    };
    
    // Roll number validation
    if (rollNumber.trim().length < 3) {
      errors.rollNumber = 'Roll number must be at least 3 characters';
    }
    if (!/^[A-Za-z0-9]+$/.test(rollNumber)) {
      errors.rollNumber = 'Roll number can only contain letters and numbers';
    }
    
    // Name validation
    if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!/^[A-Za-z\s]+$/.test(name)) {
      errors.name = 'Name can only contain letters and spaces';
    }

    setValidationErrors(errors);
    return !errors.rollNumber && !errors.name;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://dynamic-form-generator-9rl7.onrender.com/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rollNumber, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'User already exists') {
          toast.error('This roll number is already registered. Please use a different roll number.');
          setError('This roll number is already registered');
        } else {
          toast.error('Login failed. Please check your details and try again.');
          throw new Error('Login failed');
        }
        return;
      }

      toast.success('Successfully logged in!');
      onLoginSuccess(rollNumber);
    } catch (err) {
      toast.error('Something went wrong. Please try again later.');
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-form">
        <div className="login-left">
          <h2>Student Login🧑‍🎓</h2>
          <p>Enter your details to continue</p>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Roll Number</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => {
                  setRollNumber(e.target.value);
                  setValidationErrors(prev => ({ ...prev, rollNumber: '' }));
                }}
                placeholder="Enter your roll number"
                required
                className={validationErrors.rollNumber ? 'error-input' : ''}
                disabled={isLoading}
              />
              {validationErrors.rollNumber && (
                <div className="validation-error">{validationErrors.rollNumber}</div>
              )}
            </div>
            
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="Enter your name"
                required
                className={validationErrors.name ? 'error-input' : ''}
                disabled={isLoading}
              />
              {validationErrors.name && (
                <div className="validation-error">{validationErrors.name}</div>
              )}
            </div>
            

            <button 
              type="submit" 
              disabled={isLoading}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? (
                <span className="button-content">
                  <span className="spinner"></span>
                  Logging in...
                </span>
              ) : (
                'Continue'
              )}
            </button>
            
            <div className="login-footer">
              <span>Need help?</span>
              <a href="#">Terms & Conditions</a>
            </div>
          </form>
        </div>
        
        <div className="login-right">
          <div className="login-overlay"></div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Login;