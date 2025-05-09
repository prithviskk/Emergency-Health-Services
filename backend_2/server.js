const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const port = 5001;


app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true,  
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// PostgreSQL Connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'project',
  password: 'Abhipivi100%', 
  port: 5432,
});

// Test PostgreSQL Connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
    return;
  }
  console.log('Connected to PostgreSQL');
  done();
});

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});
const upload = multer({ storage });

// Middleware for Authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }

  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from header

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'yourSecretKey'); 
    req.user = decoded; 
    next(); 
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
// Routes

// Signup Endpoint
app.post('/signup', upload.single('proof'), async (req, res) => {
  const { email, password, hospitalName, latitude, longitude } = req.body;
  const proof = req.file ? req.file.path : null;
  console.log(proof);

  try {
    const emailCheck = await pool.query('SELECT * FROM hospital_users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hospitalResult = await pool.query(
      'INSERT INTO hospitals (name, latitude, longitude) VALUES ($1, $2, $3) RETURNING id, name',
      [hospitalName, latitude, longitude]
    );
    const hospitalId = hospitalResult.rows[0].id;
    console.log(email, hospitalName, password, hospitalId);

    const userResult = await pool.query(
      'INSERT INTO hospital_users (email, name, password, hosp_id) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
      [email, hospitalName, hashedPassword, hospitalId]
    );

    if (proof) {
      await pool.query('INSERT INTO hospital_proofs (hosp_id, proof_path) VALUES ($1, $2)', [hospitalId, proof]);
    }

    res.status(201).json({
      message: 'Hospital and user registered successfully!',
      hospital: hospitalResult.rows[0],
      user: userResult.rows[0],
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Error during sign-up. Please try again.' });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM hospital_users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, hosp_id: user.hosp_id }, 'secretkey', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Error during login. Please try again.' });
  }
});

// Fetch All Hospitals
app.get('/hospitals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hospitals');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching hospitals:', err);
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

// Receive Patient Data from App1
let storedData = {}; // Temporary storage for received data
app.post('/receive-data', authenticate, (req, res) => {
  const { patient, eta, hospital } = req.body;
  if (!patient || !eta || !hospital) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  storedData = { patient, eta, hospital };
  console.log('Data received from App1:', storedData);

  res.json({ message: 'Data received successfully' });
});

// Fetch Patient Data for App2
app.get('/fetch-data', (req, res) => {
  res.json(storedData);
});

// Fetch Patient Data from Database
app.get('/patient-data', authenticate, async (req, res) => {
  try {
    console.log(req.user.hosp_id);
    const result = await pool.query(
      "SELECT * FROM patient_details WHERE hospital_id = $1 AND status <> 'Admitted'",
      [req.user.hosp_id]
    );
    console.log(result.rows);  // Log the result for debugging
    res.json(result.rows.length > 0 ? result.rows : []);
  } catch (err) {
    console.error('Error fetching patient data:', err);
    res.status(500).json({ error: 'Failed to fetch patient data' });
  }
});

app.post('/update', async (req, res) => {
  const { patient_name } = req.body; // Assuming patient_name is sent in the request body
  console.log('Updating status for patient:', patient_name);

  try {
    // Call the stored procedure to update patient status
    const result = await pool.query('CALL update_patient_status($1)', [patient_name]);

    res.status(200).send({ message: 'Patient details updated successfully' });
  } catch (err) {
    console.error('Error updating patient details:', err);
    res.status(500).send('Server error');
  }
});

app.post('/update-requirements', async (req, res) => {
  const {
    hospital_name,
    emergencyWardAvailable,
    oxygenAvailable,
    icuAvailable,
    emergencyWardMaintenance,
    oxygenMaintenance,
    icuMaintenance,
    status
  } = req.body;

  console.log(hospital_name, emergencyWardAvailable, oxygenAvailable, icuAvailable, emergencyWardMaintenance,status);

  // Determine the hospital status
  const hospitalStatus = status

  try {
    // First, fetch the hospital_id using the hospital_name
    const hospitalResult = await pool.query(
      'SELECT id FROM hospitals WHERE name = $1',
      [hospital_name]
    );

    if (hospitalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const hospitalId = hospitalResult.rows[0].id; // Get the hospital_id from the query result

    // Now insert the data into the resources table using the retrieved hospital_id
    const result = await pool.query(
      `INSERT INTO resources (hosp_id, emergency_ward_status, oxygen_status, icu_status, status)
       VALUES ($1, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR)`,
      [
        hospitalId, // Using the fetched hospital_id
        emergencyWardAvailable && !emergencyWardMaintenance ? 'Available' : 'Not Available',
        oxygenAvailable && !oxygenMaintenance ? 'Available' : 'Not Available',
        icuAvailable && !icuMaintenance ? 'Available' : 'Not Available',
        hospitalStatus, // Calculated hospital status
      ]
    );

    console.log('Hospital status updated:', result);

    // Fetch all statuses from the resources table
    const statuses = await pool.query('SELECT * FROM resources');
    
    // Respond with a success message and all statuses
    res.json({
      message: 'Hospital requirements updated successfully!',
      allStatuses: statuses.rows,
    });
  } catch (err) {
    console.error('Error updating hospital status:', err);
    res.status(500).json({ error: 'Failed to update hospital status. Please try again.' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
