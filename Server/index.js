const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL client setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'quadiro',
    password: 'root',
    port: 5432
});

// Secret key for JWT (store in .env file)
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to check authentication token
const checkAdminRole = (req, res, next) => {
    const userRole = req.body.role; // Assuming role is sent in the request body

    if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
};


// Admin login endpoint
app.post('/admin/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM admin WHERE admin_name = $1 AND password = $2', [name, password]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ name }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('Error during login', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//SignUp User
app.post('/user/signup', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    try {
        // Check if user already exists
        const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            //pool.release();
            return res.status(400).json({ message: 'Email already exists, sign in then' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await pool.query('INSERT INTO "users" (email, password) VALUES ($1, $2)', [email, hashedPassword]);
        
        //client.release();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//Check for user's authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
};

// Fetch logged-in user details endpoint
app.get('/user/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query('SELECT email FROM users WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user details', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// User login endpoint
app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user from database
        const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials Email' });
        }

        const user = result.rows[0];

        // Verify the password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials Password' });
        }

        // Generate JWT token
        const token = jwt.sign({ email: user.email, userId: user.user_id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('Error during login', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Fetch all cars
app.get('/cars', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cars');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching cars', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a new car
app.post('/cars', checkAdminRole, async (req, res) => {
    const { carName, manufacturingYear, price, role } = req.body; // Assuming role is sent in the request body

    try {
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only' });
        }
        await pool.query('INSERT INTO cars (car_name, manufacturing_year, price) VALUES ($1, $2, $3)', [carName, manufacturingYear, price]);
        res.status(201).json({ message: 'Car added successfully' });
    } catch (error) {
        console.error('Error adding car:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a car
app.delete('/cars/:id', checkAdminRole, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; // Assuming role is sent in the request body

    try {
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only' });
        }
        await pool.query('DELETE FROM cars WHERE id = $1', [id]);
        res.status(200).json({ message: 'Car deleted successfully' });
    } catch (error) {
        console.error('Error deleting car:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a car
app.put('/cars/:id', async (req, res) => {
    const { id } = req.params;
    const { carName, manufacturingYear, price, role } = req.body;

    if (role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query(
            'UPDATE cars SET car_name = $1, manufacturing_year = $2, price = $3 WHERE id = $4 RETURNING *',
            [carName, manufacturingYear, price, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch dashboard data
app.get('/dashboard', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) AS totalCars FROM cars');
        res.json({ totalCars: parseInt(result.rows[0].totalcars, 10) });
    } catch (error) {
        console.error('Error fetching dashboard data', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
