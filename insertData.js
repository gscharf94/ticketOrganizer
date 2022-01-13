const { pool } = require("./db");

async function insertData() {
  const [name, client, city] = process.argv.slice(2);
  const res = await pool.query(
    `INSERT INTO jobs (name, client, city) VALUES('${name}', '${client}', '${city}');`
  );
  console.log(`added new entry into jobs: ${name, client, city}`);
}

insertData();