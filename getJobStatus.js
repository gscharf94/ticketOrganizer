const getTicketStatus = require('./getTicketStatus');
const { pool } = require('./db');

function getTicketNumbers(jobId) {
  const resp = pool.query(`SELECT * FROM ticket WHERE job_id=${jobId}`, (err, resp) => {
    if (err) {
      console.log(`error pulling tickets for job: ${jobId}`);
    }

    if (resp.rows.length == 0) {
      console.log(`no tickets associated with job: ${jobId}`);
    } else {
      getJobStatus(resp.rows);
    }
  })
}

async function getJobStatus(tickets) {

  console.log(tickets);
  console.log('test...');
  // for (const ticket of testTickets) {
  // let response = await getTicketStatus(ticket);
  // console.log(response);
  // }
}

module.exports = getTicketNumbers