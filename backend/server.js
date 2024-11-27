const express = require('express');
const { Pool } = require('pg'); // Import pg.Pool for database connection pooling
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path=require('path');
const cors = require('cors'); // Import CORS package
const app = express();
const port = 5000;

// Enable CORS for all routes
app.use(cors()); // This will allow all origins (you can restrict it if needed)

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// PostgreSQL Pool setup
const pool = new Pool({
  host: 'localhost',      // Database host (make sure PostgreSQL is running)
  port: 5432,             // Database port (default for PostgreSQL)
  user: 'postgres',       // PostgreSQL username
  password: 'Abhipivi100%', // PostgreSQL password
  database: 'project',    // Your database name
  max: 20,                // Max number of connections in the pool
  idleTimeoutMillis: 30000, // Timeout for idle connections (in ms)
  connectionTimeoutMillis: 2000, // Timeout for establishing connections (in ms)
});

// Log database connection success and error
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit on error
});

// Authentication Middleware (to protect routes that need JWT)
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access Denied');
  try {
    const verified = jwt.verify(token, 'secretkey');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

// Signup Route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  console.log('Signup attempt:', { email, password });

  try {
    // Check if email already exists in the database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).send('Email already in use');
    }

    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed password:', hashedPassword);

    // Insert user into the database
    const insertResult = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );

    // Respond with success
    res.send({ success: true, userId: insertResult.rows[0].id });
  } catch (err) {
    console.error('Sign-up error:', err);
    res.status(500).send('Error during sign-up. Please try again.');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).send('User not found');

    // Check if the password matches
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid Password');

    // Create a JWT token
    const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Error during login. Please try again.');
  }
});

// Get hospitals and resources
app.get('/hospitals', async (req, res) => {
  try {
    // Get hospitals along with their resources
    const result = await pool.query(
      'SELECT * FROM hospitals'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching hospitals:', err);
    res.status(500).send('Error fetching hospitals.');
  }
});

// Calculate shortest path (using simple Haversine formula for distance)

// Haversine formula to calculate the distance between two geographical points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
  
  // Endpoint to calculate shortest path and ETA
  app.post('/shortest-path', async (req, res) => {
    const { lat, lon } = req.body; // Ambulance location (latitude, longitude)
  
    try {
      // Fetch all hospitals
      const result = await pool.query(
        `SELECT * 
         FROM hospitals `
      );
      // Assuming an ambulance speed of 80 km/h (you can adjust this)
      const ambulanceSpeed = 80; // in km/h
  
      // Calculate distance and ETA for each hospital
      const sortedHospitals = result.rows
        .map(hospital => {
          const distance = haversineDistance(lat, lon, hospital.latitude, hospital.longitude);
          const eta = (distance / ambulanceSpeed) * 60; // ETA in minutes
          return {
            ...hospital,
            distance,
            eta, // Add
          };
        })
        .sort((a, b) => a.distance - b.distance); // Sort by nearest distance
  
      res.json(sortedHospitals); // Return the sorted hospitals with ETA
    } catch (err) {
      console.error('Error calculating shortest path:', err);
      res.status(500).send('Error calculating shortest path.');
    }
  });
 
  app.post('/submit-patient-details', async (req, res) => {
    const { name, ageGroup, emergency, gender,hospitalName,hospitalId } = req.body;
    console.log(name, ageGroup, emergency, gender,hospitalName,hospitalId);
    try {
        // Call the stored procedure
        const query = `CALL insert_patient_details($1, $2, $3, $4,$5,$6);`;
        const values = [name, ageGroup, emergency, gender,hospitalName,hospitalId];

        await pool.query(query, values);

        res.status(201).json({ message: 'Patient details submitted successfully' });
    } catch (error) {
        console.error('Error inserting patient details via procedure:', error);
        res.status(500).json({ message: 'Failed to submit patient details' });
    }
});



// Listen on port 5000
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
