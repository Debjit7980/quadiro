import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CgSpinner } from "react-icons/cg";
import userLogo from './../src/assets/Images/userLogo.png';

const Dashboard = ({ role, token }) => {
    const [cars, setCars] = useState([]);
    const [totalCars, setTotalCars] = useState(0);
    const [carName, setCarName] = useState('');
    const [manufacturingYear, setManufacturingYear] = useState('');
    const [price, setPrice] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentCar, setCurrentCar] = useState(null);
    const [updateCarName, setUpdateCarName] = useState('');
    const [updateManufacturingYear, setUpdateManufacturingYear] = useState('');
    const [updatePrice, setUpdatePrice] = useState('');
    const [alert, setAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const BASE_URL = 'https://quadiro-backend.onrender.com';

    const fetchCars = async () => {
        const response = await axios.get(`${BASE_URL}/cars`);
        const sortedCars = response.data.sort((a, b) => a.id - b.id); // Sort cars by id
        setCars(sortedCars);
    };

    const fetchDashboardData = async () => {
        const response = await axios.get(`${BASE_URL}/dashboard`);
        setTotalCars(response.data.totalCars);
    };

    // Define fetchUserDetails function
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details', error);
        }
    };

    useEffect(() => {
        fetchCars();
        fetchDashboardData();

        if (role === 'user') {
            fetchUserDetails();
        }
    }, [role, token]);

    const handleAddCar = async () => {
        setLoading(true); // Set loading to true when adding a car
        setAlert(false);
        if (carName === "" || manufacturingYear === "" || price === "") {
            setAlert(true);
            setLoading(false);
            return;
        }
        await axios.post(`${BASE_URL}/cars`, { carName, manufacturingYear, price, role });
        setCarName("");
        setManufacturingYear("");
        setPrice("");
        setTimeout(() => {
            setLoading(false);
            fetchDashboardData();
            fetchCars();
        }, 1000);
    };

    const handleDeleteCar = async (id) => {
        setDeleteLoading(id);
        await axios.delete(`${BASE_URL}/cars/${id}`, { data: { role } });
        fetchDashboardData();
        setTimeout(() => {
            setDeleteLoading(null);
            fetchCars();
        }, 500)
    };

    const handleUpdateCar = (car) => {
        setCurrentCar(car);
        setUpdateCarName(car.car_name);
        setUpdateManufacturingYear(car.manufacturing_year);
        setUpdatePrice(car.price);
        setShowModal(true);
    };

    const handleSaveUpdate = async () => {
        await axios.put(`${BASE_URL}/cars/${currentCar.id}`, { carName: updateCarName, manufacturingYear: updateManufacturingYear, price: updatePrice, role });
        setShowModal(false);
        setUpdateCarName('');
        setUpdateManufacturingYear('');
        setUpdatePrice('');
        setCurrentCar(null);
        fetchCars();
        fetchDashboardData();
    };
    console.log(userDetails);
    return (
        <div className='items-center md:p-4 p-0 pt-4 w-[100%] h-[100%]'>
            <div className='flex items-center justify-between'>
                <h1 className='md:text-[36px] text-[28px] font-bold ml-5'>Dashboard</h1>
                <h2 className='md:text-[32px] text-[22px] bg-green-700 text-white p-2 mr-5 rounded-lg'>Total Cars: {totalCars}</h2>
            </div>
            {role === 'admin' && (
                <div className='p-4 border border-black w-[80%] mx-auto mt-[3rem]'>
                    <h2 className='text-[32px]'>Add New Cars</h2>
                    {alert && <p id="alert">*Fill all the details</p>}
                    <div className='add-car mt-[2%] flex flex-col md:flex-row md:justify-between space-y-[20px] md:space-y-0'>
                        <input type="text" placeholder="Car Name" value={carName} onChange={(e) => setCarName(e.target.value)} />
                        <input type="text" placeholder="Manufacturing Year" value={manufacturingYear} onChange={(e) => setManufacturingYear(e.target.value)} />
                        <input type="text" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
                        <button onClick={handleAddCar} className='btn btn-success md:w-[85px] flex items-center justify-center'>
                            {loading ? <CgSpinner className='text-[1.5rem] animate-spin' /> : 'Add Car'}
                        </button>
                    </div>
                </div>
            )}
            {role === 'user' && (
                <div className='mt-4 flex flex-row items-center'>
                    <img src={userLogo} alt="adminImg" className='w-[90px] h-[90px] ml-[4%] mt-2' />
                    {userDetails && (
                        <p className='text-[18px] ml-5 mt-3 flex flex-col'><span className='font-bold'>User Email</span>{userDetails.email}</p>
                    )}
                </div>
            )}
            <div className='md:w-[80%] mx-auto mt-[3.6rem] w-[320px] '>
                <span className='text-2xl font-[500] ml-1 '>The List of Cars:</span>
                <table className='border border-black bg-gray-100 table table-striped mt-3'>
                    <thead>
                        <tr className='text-[12px] md:text-[16px]'>
                            <th className='md:py-2 text-center'>Serial No.</th>
                            <th className='md:py-2 text-center'>Car Name</th>
                            <th className='md:py-2 text-center'>Manufacturing Year</th>
                            <th className='md:py-2 text-center'>Price (INR lakhs)</th>
                            {role === 'admin' && <th className='py-2 text-center'>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map((car, index) => (
                            <tr key={car.id} className='border-t text-[12px] md:text-[16px]'>
                                <td className='md:py-2 text-center'>{index + 1}</td>
                                <td className='md:py-2 text-center'>{car.car_name}</td>
                                <td className='md:py-2 text-center'>{car.manufacturing_year}</td>
                                <td className='md:py-2 text-center'>{car.price}</td>
                                {role === 'admin' && (
                                    <td className='py-2 flex justify-around md:flex-row flex-col gap-[12px] md:gap-0'>
                                        <button onClick={() => handleDeleteCar(car.id)} className='bg-red-500 text-white flex items-center justify-center w-[60px] text-[12px] md:text-[14px] p-1 font-thin rounded-lg' disabled={deleteLoading === car.id}>
                                            {deleteLoading === car.id ? <CgSpinner className='text-[1.2rem] animate-spin' /> : 'Delete'}
                                        </button>
                                        <button onClick={() => handleUpdateCar(car)} className='bg-blue-400 text-white w-[60px] text-[12px] md:text-[14px] p-1 font-thin rounded-lg'>Update</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Update Car</h3>
                        <input type="text" placeholder="Car Name" value={updateCarName} onChange={(e) => setUpdateCarName(e.target.value)} className="border border-gray-300 p-2 w-full mb-2" />
                        <input type="text" placeholder="Manufacturing Year" value={updateManufacturingYear} onChange={(e) => setUpdateManufacturingYear(e.target.value)} className="border border-gray-300 p-2 w-full mb-2" />
                        <input type="text" placeholder="Price" value={updatePrice} onChange={(e) => setUpdatePrice(e.target.value)} className="border border-gray-300 p-2 w-full mb-4" />
                        <button onClick={handleSaveUpdate} className="bg-blue-500 text-white p-2 rounded-lg w-full">Save Changes</button>
                        <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white p-2 rounded-lg w-full mt-2">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
