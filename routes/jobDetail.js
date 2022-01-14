const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const formattingFunctions = require('../formattingFunctions');

router.get('/:jobId', (req, res, next) => {
  const jobId = req.params.jobId;

  const resp = pool.query(`SELECT * FROM ticket WHERE job_id=${jobId}`, (err, resp) => {
    if (err) {
      console.log(`error pulling tickets for jobId ${jobId}`);
    }

    let tickets = resp.rows;

    let jobFound = true;
    if (tickets.length == 0) {
      jobFound = false;
    }

    if (jobFound) {
      const resp = pool.query(`SELECT * FROM job WHERE id=${jobId}`, (err, resp) => {
        if (err) {
          console.log('error getting job name');
        }

        let jobName = resp.rows[0].job_name;

        for (const ticket of tickets) {
          ticket.call_in_date_formatted = formattingFunctions.formatDate(ticket.call_in_date);
          ticket.expiration_date_formatted = formattingFunctions.formatDate(ticket.expiration_date);
        }


        res.render('jobDetail', { jobId: req.params.jobId, tickets: tickets, jobFound: jobFound, jobName: jobName });
      })

    }
    else {
      res.render('jobDetail', { jobId: req.params.jobId, tickets: tickets, jobFound: jobFound });
    }
  });
})

module.exports = router;