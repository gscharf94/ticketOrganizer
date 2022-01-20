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
  console.log(`starting positive response pull for job: ${jobId} total tickets = ${tickets.length}`);

  let responses = [];

  let counter = 1;
  for (const ticket of tickets) {
    console.log(`starting ticket: ${ticket.ticket_number} ${counter}/${tickets.length} job: ${jobId}`);
    let outputResponse = {};
    let scrapingResponse = await getTicketStatus(ticket.ticket_number);
    for (const utility in scrapingResponse) {
      let utilityType = scrapingResponse[utility].utilityType;
      let utilityResponse = scrapingResponse[utility].response;
      let utilityNotes = scrapingResponse[utility].notes;
      let utilityContact = scrapingResponse[utility].contact;
      let utilityAlternateContact = scrapingResponse[utility].alternateContact;
      let utilityEmergencyContact = scrapingResponse[utility].emergencyContact;

      outputResponse = {
        name: utility,
        type: utilityType,
        response: utilityResponse,
        notes: utilityNotes,
        ticket_id: ticket.id,
        contact: utilityContact,
        alternateContact: utilityAlternateContact,
        emergencyContact: utilityEmergencyContact,
      }

      responses.push(outputResponse);
    }

    counter++;
  }
  console.log(`finished job: ${jobId}`);

  insertPositiveResponses.clearJobPositiveResponses(jobId);
  insertPositiveResponses.insertPositiveResponses(responses);
}

module.exports = getTicketNumbers