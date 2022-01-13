const { pool } = require("./db");

async function insertData() {
  const name = process.argv.slice(2);
  const res = await pool.query(
    `INSERT INTO client (client_name) VALUES('${name}');`
  );
  console.log(`added new client: "${name}"`);
}

insertData();