const getTicketStatus = require('./getTicketStatus');
const insertPositiveResponses = require('./insertPositiveResponses');
const { pool } = require('./db');

function getTicketNumbers(jobId) {
  const resp = pool.query(`SELECT * FROM ticket WHERE job_id=${jobId}`, (err, resp) => {
    if (err) {
      console.log(`error pulling tickets for job: ${jobId}`);
    }

    if (resp.rows.length == 0) {
      console.log(`no tickets associated with job: ${jobId}`);
    } else {
      getJobStatus(resp.rows, jobId);
    }
  })
}

async function getJobStatus(tickets, jobId) {

  let responses = [];

  for (const ticket of tickets) {
    let outputResponse = {};
    let scrapingResponse = await getTicketStatus(ticket.ticket_number);
    for (const utility in scrapingResponse) {
      let utilityType = scrapingResponse[utility].utilityType;
      let utilityResponse = scrapingResponse[utility].response;
      let utilityNotes = scrapingResponse[utility].notes;

      outputResponse = {
        name: utility,
        type: utilityType,
        response: utilityResponse,
        notes: utilityNotes,
        ticket_id: ticket.id,
      }

      responses.push(outputResponse);
    }
  }
  insertPositiveResponses.clearJobPositiveResponses(jobId);
  insertPositiveResponses.insertPositiveResponses(responses);
}

module.exports = getTicketNumbers