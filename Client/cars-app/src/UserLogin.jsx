import React, { useState } from 'react';
import axios from 'axios';
import adminImg from './../src/assets/Images/admin.avif';
import { useNavigate } from 'react-router-dom';
import { CgSpinner } from "react-icons/cg";

const UserLogin = ({ setToken, setRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const BASE_URL = 'https://quadiro-backend.onrender.com/user'; // Define the base URL here

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/login`, { email, password });
            setToken(response.data.token);
            setRole('user');
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', 'user');
        //    localStorage.setItem('user_id',user_id)
            setLoading(false);
            navigate("/dashboard");
        } catch (error) {
            setLoading(false);
            alert(error);
        }
    };

    const handleSignup = async (e) => {
        setError('');
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Confirm Password and Password do not match');
            return;
        }
        try {
            const response = await axios.post(`${BASE_URL}/signup`, { email, password });
            console.log('Signup response:', response.data);
            alert('Signup successful');
            setIsSignup(!isSignup);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className='w-[100%] flex flex-col items-center justify-center mx-auto'>
            {loading ? (<CgSpinner className='text-[3.5rem] absolute top-[50%] md:left-[50%] left-[45%] animate-spin' />) :
                <><h1 className='md:text-[32px] text-[26px] md:mt-[2%] md:mb-[3%] mt-[8%] mb-[8%] text-center'>Assignment for Quadiro Technologies</h1>
                    <form
                        onSubmit={isSignup ? handleSignup : handleLogin}
                        className='p-2 pt-4 pb-4 md:pb-0 rounded-2xl shadow-lg form md:w-[50%] w-[80%] mx-auto flex justify-around items-center md:flex-row flex-col-reverse'
                    >
                        <div className='md:w-[40%] w-[90%] md:mt-0 mt-[8%]'>
                            <div className="form-floating mb-4">
                                <input
                                    type="email"
                                    className="form-control shadow-none"
                                    required
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email"
                                />
                                <label className='text-[16px]'>Email</label>
                            </div>
                            <div className="form-floating mb-4">
                                <input
                                    type="password"
                                    className="form-control shadow-none"
                                    required
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='password'
                                />
                                <label className='text-[16px]'>Password</label>
                            </div>
                            {isSignup && (
                                <div className="form-floating mb-1">
                                    <input
                                        type="password"
                                        className="form-control shadow-none"
                                        required
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder='confirm password'
                                    />
                                    <label className='text-[16px]'>Confirm Password</label>
                                </div>
                            )}
                            {error && (
                                <p className='text-red-500 text-[13px]'>{error}</p>
                            )}
                            <div className='mt-[1rem] flex flex-col'>
                                <button
                                    type="submit"
                                    className='btn btn-success w-[120px] text-[18px]'
                                >
                                    {isSignup ? 'Sign Up' : 'Login'}
                                </button>
                                <p
                                    onClick={() => { setIsSignup(!isSignup); setError(''); }}
                                    className='text-[14px] mt-2 '
                                >
                                    {isSignup
                                        ? 'Already have an account? Then '
                                        : `Don't have an account yet? Then `
                                    }
                                    <span className='text-blue-500 font-semibold underline font-bold cursor-pointer'>
                                        {isSignup ? 'Sign In' : 'Sign Up'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className='md:w-[300px] md:h-[300px]'>
                            <img src={adminImg} className='image' alt="img" />
                        </div>
                    </form></>}
        </div>
    );
};

export default UserLogin;
