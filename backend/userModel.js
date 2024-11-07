const db = require('./db');

const createUser = async (username, password, hashedPassword, userType, uniqueGenHospId = null) => {
    const query = `
        INSERT INTO users (username, password, hashed_password, user_type, unique_gen_hosp_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [username, password, hashedPassword, userType, uniqueGenHospId];
    const result = await db.query(query, values);
    return result.rows[0];
};

const getUserByUsername = async (username) => {
    const query = `SELECT * FROM users WHERE username = $1`;
    const result = await db.query(query, [username]);
    return result.rows[0];
};

const getUserProfile = async (userId) => {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await db.query(query, [userId]);
    return result.rows[0];
};

module.exports = {
    createUser,
    getUserByUsername,
    getUserProfile,
};
