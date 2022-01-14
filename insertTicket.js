const { pool } = require("./db");
const fs = require('fs');

function createIterator() {
  // returns an object where insertData() can iterate through in order
  // to add a list of tickets to the database
  const [jobName, sourceDirectory] = process.argv.slice(2);
  console.log(jobName);
  console.log(sourceDirectory);

  const files = fs.readdirSync(sourceDirectory);

  let compiledTicketData = [];
  for (const file of files) {
    compiledTicketData.push(parseTicketText(`${sourceDirectory}/${file}`));
  }

  insertData(compiledTicketData, jobName);
}

function trimDescription(txt) {
  // the regex for description results in an ugly string
  // this should make it nicer by removing some of the new lines
  // due to the limitations of the ticket system
  txt = txt.slice(0, -2);
  txt = txt.replaceAll("\n", " ");
  txt = txt.replaceAll("'", "''");
  return txt;
}

function escapeSingleQuote(txt) {
  // turns "my name's gustavo"
  // into  "my name''s gustavo"
  // so that it can be escaped in postgresql
  return txt.replaceAll("'", "''");
}


function parseTicketText(filePath) {
  // takes in raw ticket text and parses that to return an object 
  // with the necessary information to insert it into database

  let result = {}
  result.ticketJobId = Number(filePath.slice(-7, -4));

  let text = fs.readFileSync(filePath, 'utf8');

  let ticketNumberRegex = /Ticket : (\d{9})/;
  let ticketNumberResult = text.match(ticketNumberRegex);
  result.ticketNumber = ticketNumberResult[1];

  let streetRegex = /Street  : (.*)/;
  let streetResult = text.match(streetRegex);
  result.street = escapeSingleQuote(streetResult[1]);

  let crossStreetRegex = /Cross 1 : (.*)/;
  let crossStreetResult = text.match(crossStreetRegex);
  result.crossStreet = escapeSingleQuote(crossStreetResult[1]);

  let callInDateRegex = /Taken: (\d{2}\/\d{2}\/\d{2})/;
  let callInDateResult = text.match(callInDateRegex);
  result.callInDate = callInDateResult[1];

  let expDateRegex = /Exp Date : (\d{2}\/\d{2}\/\d{2})/;
  let expDateResult = text.match(expDateRegex);
  result.expDate = expDateResult[1];

  let descriptionRegex = /Locat: ([\s\d\w\(\)\,\.\&\'\"\-\/]*):/;
  let descriptionResult = text.match(descriptionRegex);
  result.description = trimDescription(descriptionResult[1]);

  return result;
}


async function insertData(compiledData, jobName) {
  // takes in a list of objects and then inserts those objects to the database

  // first we need to get the jobId associated with the job name
  const resp = pool.query(`SELECT * FROM job where job_name='${jobName}'`, async (err, result) => {
    if (err) {
      console.log('query error');
    }
    let response = result.rows;
    if (response.length == 0) {
      console.log(`job: ${jobName} was not found`);
    } else {
      let jobId = response[0].id;

      // we create the big boy SQL query
      let sqlQuery = `INSERT INTO \nticket(street, cross_street, expiration_date, call_in_date, job_id, ticket_number, ticket_folder_id, description)\n VALUES`;
      for (const item of compiledData) {
        let value = `\n('${item.street}','${item.crossStreet}','${item.expDate}','${item.callInDate}',${jobId},'${item.ticketNumber}',${item.ticketJobId},'${item.description}'),`;
        sqlQuery += value;
      }
      sqlQuery = sqlQuery.slice(0, -1);
      sqlQuery += ";";

      const res = await pool.query(sqlQuery);
      console.log(`added tickets`);
    }
  })
}

createIterator()