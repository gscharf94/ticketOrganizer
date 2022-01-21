const { pool } = require("./db");

async function insertCrew(crewName) {
  const res = await pool.query(
    `INSERT INTO crew (name) VALUES('${crewName}');`
    , (err, resp) => {
      if (err) {
        console.log('error adding crew');
      } else {
        console.log(`added new client: "${crewName}"`);
      }
    });
}

module.exports = insertCrew;