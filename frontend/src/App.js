import React from 'react'; 
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Prices from './components/Prices';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import { UserProvider } from './components/UserContext';
import UserInfo from './components/UserInfo';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      

      <UserProvider>
      <Router>
        <div>
          <UserInfo />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
      </Router>
      </UserProvider>

      </header>
    </div>
  );
}

export default App;
