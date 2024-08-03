import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { span } from "react-icons/cg";
import adminImg from './../src/assets/Images/admin.avif';

const AdminLogin = ({ setToken, setRole }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('https://quadiro-backend.onrender.com/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            const { token } = data;
            setToken(token);
            setRole('admin');
            localStorage.setItem('token', token);
            localStorage.setItem('role', 'admin');
            setLoading(false);
            navigate('/dashboard');
        } catch (error) {
            alert('Invalid credentials');
            setLoading(false); // Ensure loading state is turned off in case of error
        }
    };

    return (
        <div className='w-[100%] flex flex-col items-center justify-center mx-auto'>
            {loading ? (
                <span className='w-[45px] h-[45px] absolute top-[50%] md:left-[50%] left-[45%] spinner'></span>
            ) : (
                <>
                    <h1 className='md:text-[32px] text-[26px] md:mt-[3%] md:mb-[3%] mt-[8%] mb-[8%] text-center'>
                        Assignment for Quadiro Technologies
                    </h1>
                    <form onSubmit={handleLogin} className='p-2 pt-4 pb-4 md:pb-0 rounded-2xl shadow-lg form md:w-[50%] w-[80%] mx-auto flex justify-around items-center md:flex-row flex-col-reverse'>
                        <div className='md:w-[40%] w-[90%] md:mt-0 mt-[8%]'>
                            <div className="form-floating mb-4">
                                <input
                                    type="text"
                                    className="form-control shadow-none"
                                    required
                                    name="name"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value) }}
                                    placeholder="name"
                                />
                                <label className='text-[16px]'>Admin Name</label>
                            </div>
                            <div className="form-floating mb-4">
                                <input
                                    type="password"
                                    className="form-control shadow-none"
                                    required
                                    name="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value) }}
                                    placeholder='password'
                                />
                                <label className='text-[16px]'>Password</label>
                            </div>
                            <div className='mt-[3rem]'>
                                <button
                                    type="submit"
                                    className='btn btn-success w-[120px] text-[18px]'
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                        <div className='md:w-[300px] md:h-[300px]'>
                            <img src={adminImg} className='image' alt="img" />
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default AdminLogin;
