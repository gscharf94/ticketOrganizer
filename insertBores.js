const { pool } = require('./db');
const { parseBoreKml } = require('./parseKML');


function insertBores(jobId, folder) {
  let parsedKml = parseBoreKml(`${folder}/Bore.kml`);
  console.log(parsedKml);

  //  first we need to create a crew / crewid dictionary
  const resp = pool.query('SELECT * FROM crew', (err, resp) => {
    if (err) {
      console.log('error pulling crews');
    }

    let crewDictionary = {};
    for (const row of resp.rows) {
      crewDictionary[row.name] = row.id;
    }

    console.log(crewDictionary);

    let sqlQuery =
      `INSERT INTO bore(job_id, crew_id, bore_date, footage) \nVALUES`;

    for (const bore of parsedKml) {
      let row = `(${jobId}, ${crewDictionary[bore.crew]}, '${bore.date}', ${bore.footage}),`;
      sqlQuery += row;
    }

    sqlQuery = sqlQuery.slice(0, -1);
    sqlQuery += ";";

    // this query actually adds the bores from the kml file
    const resp2 = pool.query(sqlQuery, (err, resp2) => {
      if (err) {
        console.log(`error adding bores`);
      } else {
        console.log(`succesfully added ${parsedKml.length} bores`);
      }
    })
  })
}

module.exports = insertBores;