const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/:ticketId', (req, res, next) => {
  const ticketId = req.params.ticketId;

  const resp = pool.query(`SELECT * FROM positive_response WHERE ticket_id=${ticketId}`, (err, resp) => {
    if (err) {
      console.log(`error pulling positive response for ticketId: ${ticketId}`);
    }

    let positiveResponses = resp.rows;
    let responseFound = true;
    if (positiveResponses.length == 0) {
      responseFound = false;
    }

    let ticketInfoQuery =
      `SELECT
        ticket.id, ticket.street, ticket.cross_street, ticket.expiration_date, ticket.call_in_date, ticket.job_id, ticket.ticket_status, ticket.ticket_number, ticket.description, ticket.ticket_folder_id, job.job_name, job.city, client.client_name
      FROM ticket
      INNER JOIN job ON ticket.job_id=job.id
      INNER JOIN client ON job.client_id=client.id
      WHERE ticket.id=${ticketId};`
    const resp2 = pool.query(ticketInfoQuery, (err, resp2) => {
      if (err) {
        console.log(`error pulling ticket info: ${ticketId}`);
      }

      let ticketInfo = resp2.rows;

      let ticketFound = true
      if (ticketInfo.length == 0) {
        ticketFound = false;
      }

      res.render('ticketDetail', {
        ticketId: ticketId,
        responses: positiveResponses,
        responseFound: responseFound,
        ticket: ticketInfo[0], // comes in an array, need to get the first element
        ticketFound: ticketFound,
      });
    });
  });
})



module.exports = router;