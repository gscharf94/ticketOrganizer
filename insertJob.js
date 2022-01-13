const { pool } = require("./db");

async function insertData() {
  const [name, city, client] = process.argv.slice(2);
  console.log(name, city, client);
  const resp = pool.query(`SELECT * FROM client WHERE client_name='${client}'`, async (err, result) => {
    if (err) {
      console.log('query error');
    }
    let response = result.rows;
    if (response.length == 0) {
      console.log(`${client} was not found`);
    } else {
      let client_id = response[0].id;
      const res = await pool.query(`INSERT INTO job(job_name, city, client_id) VALUES ('${name}','${city}','${client_id}');`);
      console.log(`added new job: ${name}, ${city}, ${client}, client_id: ${client_id}`);
    }
  });
}

insertData();