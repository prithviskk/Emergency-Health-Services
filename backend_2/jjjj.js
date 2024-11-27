const express = require('express');
const { Pool } = require('pg');
const app = express();

// Set up PostgreSQL pool
const pool = new Pool({
  user: 'your-db-user',
  host: 'localhost',
  database: 'your-database-name',
  password: 'your-db-password',
  port: 5432,
});

// Middleware to parse JSON
app.use(express.json());

// Endpoint to update hospital resource requirements


// Start the server
const port = 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
