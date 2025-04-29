import React, { useState } from 'react';
import Login from './components/Login';
import DynamicForm from './components/DynamicForm';
import './App.css';

function App() {
  const [rollNumber, setRollNumber] = useState<string>('');

  const handleLoginSuccess = (roll: string) => {
    setRollNumber(roll);
  };

  return (
    <div className="App">
      {!rollNumber ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DynamicForm rollNumber={rollNumber} />
      )}
    </div>
  );
}

export default App;
