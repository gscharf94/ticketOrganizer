const { pool } = require('./db');
const { parseBoreKml } = require('./parseKML');

/**
 * @param {[]} borePositions
 * takes the coordinates and populates bore_positions table
 * with the positions. this is run inside of {@link insertBores} 
 * 
 * borePositions is an array of objects
 * 
 * {
 * 
 *  a: latitude
 * 
 *  b: longitude
 * 
 *  c: altitude
 * 
 *  p: place (in case of more than 3 points need to know which order to draw them in)
 * 
 *  bore_id: each position is associated with a bore
 * 
 * }
 */
function insertBorePositions(borePositions) {
  let sqlQuery =
    `INSERT INTO bore_position(bore_id, start_pos, end_pos, place) VALUES`;

  for (const bore of borePositions) {
    let row = `(${bore.bore_id}, ${bore.start_pos}, ${bore.end_pos}, ${bore.place}),`;
    sqlQuery += row;
  }

  sqlQuery = sqlQuery.slice(0, -1);
  sqlQuery += ";"s

  const resp = pool.query(sqlQuery, (err, resp) => {
    if (err) {
      console.log('error adding bore positions');
    } else {
      console.log(`successfully added ${borePositions.length} bore positions`);
    }
  });
}

/**
 * @param {int} jobId
 * deletes all bore_positions associated with a job
 * so that we can add new ones
*/
async function clearBorePositions(jobId) {
  let sqlQuery =
    `DELETE FROM bore_position
    USING bore, job
    WHERE
      bore_position.bore_id=bore.id AND
      bore.job_id=job.id
      AND job.id=${jobId}`;
  const resp = pool.query(sqlQuery, (err, resp) => {
    if (err) {
      console.log(`error deleting bore_positions for job ${jobId}`);
    } else {
      console.log(`successfully deleted bore_position for job ${jobId}`);
    }
  })
}

/**
 * @param {int} jobId
 * deletes all bores associated with a job
 * so that we can add new ones
 */
async function clearBores(jobId) {
  let sqlQuery =
    `DELETE FROM bore USING job WHERE bore.job_id=job.id AND job.id=${jobId}`;

  const resp = await pool.query(sqlQuery, (err, resp) => {
    if (err) {
      console.log(`error deleting bores for jobId: ${jobId}`);
    } else {
      console.log(`deleted all bores associated with jobId: ${jobId}`);
    }
  });
}


/**
 * @param {int} jobId - self explanatory
 * @param {string} folder - path to folder which must contain "Bore.kml" file
 * 
 * it uses {@link parseBoreKml} to get the info out of a kml file. also runs
 * {@link clearBores} before in order to clear the way so we can
 * write a query that inserts all bores into db
 * in addition, runs {@link insertBorePositions} to fill the
 * bore_position table with the coordinates from the kml file
*/
async function insertBores(jobId, folder) {
  let parsedKml = parseBoreKml(`${folder}/Bore.kml`);

  // clear the bores and bore position so we can add new ones
  await clearBores(jobId);
  await clearBorePositions(jobId);

  //  first we need to create a crew / crewid dictionary
  const resp = pool.query('SELECT * FROM crew', (err, resp) => {
    if (err) {
      console.log('error pulling crews');
    }

    let crewDictionary = {};
    for (const row of resp.rows) {
      crewDictionary[row.name] = row.id;
    }

    let sqlQuery =
      `INSERT INTO bore(job_id, crew_id, bore_date, footage) \nVALUES`;

    for (const bore of parsedKml) {
      let row = `(${jobId}, ${crewDictionary[bore.crew]}, '${bore.date}', ${bore.footage}),`;
      sqlQuery += row;
    }

    sqlQuery = sqlQuery.slice(0, -1);
    sqlQuery += " RETURNING id;";

    // this query actually adds the bores from the kml file
    const resp2 = pool.query(sqlQuery, (err, resp2) => {
      if (err) {
        console.log(`error adding bores`);
      } else {
        console.log(`succesfully added ${parsedKml.length} bores`);

        let boreIds = resp2.rows;
        let borePositions = [];
        for (let i = 0; i < boreIds.length; i++) {
          let coords = parsedKml[i].coords;
          for (const coord of coords) {
            borePositions.push({
              start_pos: Number(coord.a),
              end_pos: Number(coord.b),
              place: coord.p,
              altitude: Number(coord.c),
              bore_id: boreIds[i].id,
            });
          }
        }

        insertBorePositions(borePositions);
      }
    })
  })
}

insertBores(8, "/mnt/4AB454E6B454D653/Users/Gustavo/Google Drive/locate stuff/infinite/053A_pon");
//module.exports = {
//  insertBores,
//  clearBores,
//}
