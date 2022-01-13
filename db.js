const { Pool } = require('pg');

const pool = new Pool({
  user: 'node_user',
  database: 'jobs',
  password: 'node_password',
  port: 5432,
  host: 'localhost',
});

module.exports = { pool };