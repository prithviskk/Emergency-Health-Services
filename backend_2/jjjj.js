const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser=require('body-parser');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating JWT
const multer = require('multer');  // For handling file uploads

const app = express();
const port = 5001;

// CORS Setup
app.use(cors());

// Middleware to parse incoming request body
app.use(express.json()); // For JSON data
app.use(express.urlencoded({ extended: true })); // For form-urlencoded data

// Set up PostgreSQL connection pool without dotenv
const pool = new Pool({
  user: 'postgres',         // Replace with your PostgreSQL username
  host: 'localhost',        // Replace with your PostgreSQL host
  database: 'project',      // Replace with your PostgreSQL database name
  password: 'Abhipivi100%', // Replace with your PostgreSQL password
  port: 5432,               // Default PostgreSQL port
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directory where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()); // Generate unique filenames
  }
});

const upload = multer({ storage: storage });

// Test PostgreSQL connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
    return;
  }
  console.log('Connected to PostgreSQL');
  done();
});

// POST endpoint to register a hospital
app.post('/signup', upload.single('proof'), async (req, res) => {
  const { email, password, hospitalName, latitude, longitude } = req.body;
  console.log(email, password,hospitalName, latitude, longitude);
  // Get the proof file path (if available)
  const proof = req.file ? req.file.path : null;

  try {
    // Check if the email is already taken
    const checkEmailQuery = `SELECT * FROM hospital_users WHERE email = $1`;
    const result = await pool.query(checkEmailQuery, [email]);

    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the hospital details into the hospitals table
    const hospitalQuery = `
      INSERT INTO hospitals (name, latitude, longitude)
      VALUES ($1, $2, $3) RETURNING id, name, latitude, longitude;
    `;
    const hospitalValues = [hospitalName, latitude, longitude];
    const hospitalInsertResult = await pool.query(hospitalQuery, hospitalValues);
    const hosp_id = hospitalInsertResult.rows[0].id;

    // Insert the user details into the hospital_users table
    const userQuery = `
      INSERT INTO hospital_users (email, name, password, hosp_id)
      VALUES ($1, $2, $3, $4) RETURNING id, email, name;
    `;
    const userValues = [email, hospitalName, hashedPassword, hosp_id];
    const userInsertResult = await pool.query(userQuery, userValues);

    // If proof file is provided, insert it into the hospital_proofs table
    if (proof) {
      const proofQuery = `
        INSERT INTO hospital_proofs (hosp_id, proof_path)
        VALUES ($1, $2);
      `;
      await pool.query(proofQuery, [hosp_id, proof]);
    }

    // Respond with the inserted hospital and user data (excluding password)
    res.status(201).json({
      message: 'Hospital and user registered successfully!',
      hospital: hospitalInsertResult.rows[0],
      user: userInsertResult.rows[0],
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Error during sign-up. Please try again.' });
  }
});

// POST endpoint for login authentication// POST endpoint for login authentication
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by email
      const result = await pool.query('SELECT * FROM hospital_users WHERE email = $1', [email]);
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
  

// Example endpoint to retrieve all hospitals
app.get('/hospitals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hospitals');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error retrieving hospitals:', err);
    res.status(500).json({ error: 'Error retrieving hospitals' });
  }
});

app.use(bodyParser.json());
app.use(cors());

let storedData = {};  // Temporary store for patient data (can be saved in DB)

app.post('/receive-data', (req, res) => {
  const { patient, eta, hospital } = req.body;

  if (!patient || !eta || !hospital) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Store the data in the backend temporarily (you can save this in a DB)
  storedData = { patient, eta, hospital };

  console.log('Data received from App1:', storedData);

  // Respond back to App1 with success
  res.status(200).json({ message: 'Data received successfully.' });
});

// Endpoint to fetch stored data (for App2 frontend)
app.get('/fetch-data', (req, res) => {
  res.json(storedData);  // Send the stored data to the React frontend
});

app.get('/patient-data', async (req, res) => {
  try {
    // Query the patient_details table using the pool
    const result = await pool.query('SELECT * FROM patient_details WHERE hospital_name=');
    console.log(result.rows);  // Log the result for debugging

    if (result.rows.length > 0) {
      res.json(result.rows);  // Send the patient data as JSON
    } else {
      res.status(200).json([]);  // No records found, send empty array
    }
  } catch (err) {
    console.error('Error fetching patient data: ', err);
    res.status(500).json({ error: 'Failed to fetch patient data' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
