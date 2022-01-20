const { pool } = require('./db');

function escapeSingleQuote(txt) {
  return txt.replace(/'/g, "''");
}

async function clearJobPositiveResponses(jobId) {
  console.log(`deleting positive responses for jobId: ${jobId}`)
  let sqlQuery = `DELETE FROM positive_response USING ticket WHERE positive_response.ticket_id=ticket.id AND ticket.job_id=${jobId};`
  const res = await pool.query(sqlQuery, (err, res) => {
    if (err) {
      console.log(`error deleting positive responses for job: ${jobId}`);
    }
    console.log(`succesfully deleted positive responses for job: ${jobId}`);
  })
}

async function insertPositiveResponses(responses) {
  let sqlQuery = `INSERT INTO positive_response(utility_name, response, notes, utility_type, ticket_id)\nVALUES`;
  for (const response of responses) {
    let name = escapeSingleQuote(response.name);
    let resp = escapeSingleQuote(response.response);
    let notes = escapeSingleQuote(response.notes);
    let type = escapeSingleQuote(response.type);

    let value = `\n('${name}', '${resp}', '${notes}', '${type}', ${response.ticket_id}),`;
    sqlQuery += value;
  }
  sqlQuery = sqlQuery.slice(0, -1);
  sqlQuery += ";";

  const res = await pool.query(sqlQuery, (err, resp) => {
    if (err) {
      console.log('error adding positive responses');
    }
    console.log(`succesfully added ${responses.length} positive response updates`);
  });
}


module.exports = {
  insertPositiveResponses,
  clearJobPositiveResponses,
}