import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import UserLogin from './UserLogin';
import Dashboard from './Dashboard';
//import { span } from "react-icons/im";

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && role) {
            navigate('/dashboard');
        }
    }, [token, role, navigate]);

    const handleLogout = () => {
        setToken(null);
        setRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    const handleUserClick = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <>
            <nav className='w-[100%] flex justify-between p-3 bg-gray-900 items-center'>
                <div className='md:text-[36px] text-[30px] font-bold text-white'>Quadiro</div>
                <div className='md:text-[22px] text-[16px] text-white flex md:gap-[3.6rem] gap-[12px] md:mr-[4%]'>
                    <Link to="/" className="link" onClick={handleUserClick}>Admin</Link>
                    <Link to="/user" className="link" onClick={handleUserClick}>User</Link>
                    {token && <button onClick={handleLogout}>Logout</button>}
                </div>
            </nav>
            {loading ? (
                <span className='w-[45px] h-[45px] absolute top-[50%] md:left-[50%] left-[45%] spinner'></span>
            ) : (
                <Routes>
                    <Route path="/" element={<AdminLogin setToken={setToken} setRole={setRole}/>}/>
                    <Route path="/user" element={<UserLogin setToken={setToken} setRole={setRole}/>}/>
                    <Route path="/dashboard" element={<Dashboard role={role} token={token}/>}/>
                </Routes>
            )}
        </>
    );
}

export default App;
