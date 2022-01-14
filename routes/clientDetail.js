const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const formattingFunctions = require('../formattingFunctions')

router.get('/:clientId', (req, res, next) => {
  const clientId = req.params.clientId;

  const resp = pool.query(`SELECT * FROM client WHERE id=${clientId}`, (err, resp) => {
    if (err) {
      console.log(`error pulling clientId: ${clientId}`);
    }

    let client = resp.rows[0];

    const resp2 = pool.query(`SELECT * FROM job WHERE client_id=${client.id}`, (err, resp2) => {
      if (err) {
        console.log(`error pulling jobs for client: ${client.client_name}`);
      }

      let clientJobs = resp2.rows;

      for (const job of clientJobs) {
        job.estimated_footage_formatted = formattingFunctions.formatFootage(job.estimated_footage);
      }

      const resp3 = pool.query('SELECT job_id, COUNT(*) FROM ticket GROUP BY job_id;', (err, resp3) => {
        if (err) {
          console.log('error getting ticket counts')
        }

        let count = resp3.rows;
        let countDictionary = {};

        for (const ct of count) {
          countDictionary[ct.job_id] = ct.count;
        }

        for (const job of clientJobs) {
          job.ticket_count = countDictionary[job.id];

          // TEMPORARY
          job.percent_clear = "0%";
        }

        res.render('clientDetail', { client: client, jobs: clientJobs });
      });
    });
  });
});

module.exports = router;