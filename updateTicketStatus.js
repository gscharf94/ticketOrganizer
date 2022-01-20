const { pool } = require('./db');

console.log('hello world');

async function getAllTickets() {
  const resp = pool.query('SELECT * FROM ticket', (err, resp) => {
    if (err) {
      console.log('error pulling tickets');
    }
    let tickets = resp.rows;

    for (const tick of tickets) {
      getTicketStatus(tick.id);
    }
  });
}

async function getTicketStatus(ticket_id) {
  const resp = pool.query(`SELECT * FROM positive_response INNER JOIN ticket ON positive_response.ticket_id=ticket.id WHERE ticket.id=${ticket_id}`, (err, resp) => {
    if (err) {
      console.log(`error pulling positive response for ticket: ${ticket_id}`);
    }

    let responses = resp.rows;
    console.log(responses);

    let ticketStatus = true;
    for (const response of responses) {
      if (
        response.response.search("Marked") != -1 ||
        response.response.search("No Conflict") != -1 ||
        response.response.search("Clear No") != -1 ||
        response.response.search("test code") != -1 ||
        response.response.search("Privately owned facilities") != -1
      ) {
        // do nothing
      } else {
        ticketStatus = false;
      }
    }

    const sqlUpdateQuery = `UPDATE ticket SET ticket_status=${ticketStatus} WHERE id=${ticket_id};`
    const updateRes = pool.query(sqlUpdateQuery, (err, resp) => {
      if (err) {
        console.log(`error updating ticket status for ticketId: ${ticket_id} to ${ticketStatus}`);
      } else {
        console.log(`updated ticketId: ${ticket_id} ticket_status to: ${ticketStatus}`);
      }
    });

    console.log(`${ticket_id} is clear?: ${ticketStatus}`);

  })
}

async function updateTicketStatus(ticket_id) {
  // goes through all tickets and sets their ticket_status to true or false
  return 0;
}


getAllTickets();