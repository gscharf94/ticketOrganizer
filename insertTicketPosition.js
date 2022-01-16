const { pool } = require("./db");
const parseKml = require('./parseKML');


function insertData() {
  const kmlPath = process.argv.slice(2)[0];
  console.log(kmlPath)
  let kmlIterator = parseKml(kmlPath + "/Locates.kml");

  const resp = pool.query('SELECT id, ticket_number FROM ticket', (err, resp) => {
    if (err) {
      console.log('error pulling ticket dictionary');
    }

    let ticketDictionary = {};

    for (const row of resp.rows) {
      ticketDictionary[row.ticket_number] = row.id
    }

    for (const coordSet of kmlIterator) {
      coordSet.ticket_id = ticketDictionary[coordSet.ticket_number];
      if (coordSet.ticket_id == undefined) {
        console.log(`problem.. ticket: ${coordset.ticket_number} not found`);
      }
    }

    let sqlQuery = "INSERT INTO \nlocate_position(start_pos, end_pos, ticket_id, place) \nVALUES";
    for (const set of kmlIterator) {
      for (const coord of set.coords) {
        sqlQuery += `\n(${coord.a}, ${coord.b}, ${set.ticket_id}, ${coord.p}),`;
      }
    }
    sqlQuery = sqlQuery.slice(0, -1);
    sqlQuery += ";";

    console.log(sqlQuery);

    const res = pool.query(sqlQuery, (err, res) => {
      if (err) {
        console.log('error inserting locate positions');
      } else {
        console.log('succesfully added locate positions');
      }
    });

  });
}




insertData();