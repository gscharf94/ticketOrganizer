const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const formattingFunctions = require('../formattingFunctions');


const resp = pool.query('SELECT * FROM job', (err, res) => {
  if (err) {
    console.log('err pulling jobs');
  }

  let jobs = res.rows;

  const resp = pool.query('SELECT * FROM client', (err, res) => {
    if (err) {
      console.log('err pulling clients');
    }

    let clients = res.rows;

    let clientDictionary = {};
    for (const client of clients) {
      clientDictionary[client.id] = client.client_name;
    }
    for (const job of jobs) {
      job.client_name = clientDictionary[job.client_id];
      job.estimated_footage_formatted = formattingFunctions.formatFootage(job.estimated_footage);
    }

    const resp = pool.query('SELECT job_id, COUNT(*) FROM ticket GROUP BY job_id;', (err, resp) => {
      if (err) {
        console.log('error getting ticket counts');
      }

      let ticketCounts = resp.rows;

      let ticketCountDictionary = {}
      for (const count of ticketCounts) {
        ticketCountDictionary[count.job_id] = count.count;
      }

      for (const job of jobs) {
        job.ticket_count = ticketCountDictionary[job.id];


        // TEMPORARY
        job.percent_clear = "0";
      }

      let sqlQuery =
        `SELECT job.id, COUNT(CASE WHEN ticket.ticket_status=true THEN 1 ELSE NULL END)
        FROM ticket
        INNER JOIN job ON ticket.job_id=job.id
        GROUP BY job.id;`;
      const resp2 = pool.query(sqlQuery, (err, resp2) => {
        if (err) {
          console.log('error pulling clear ticket counts');
        }

        let clearDictionary = {};
        for (const row of resp2.rows) {
          clearDictionary[row.id] = row.count;
        }

        for (const job of jobs) {
          job.number_clear = clearDictionary[job.id];
          if (job.number_clear == 0) {
            // pass
          } else {
            job.percent_clear = Math.round((job.number_clear / job.ticket_count) * 100)
          }
        }
        router.get('/', (req, res, next) => {
          res.render('index', { title: 'Job List', jobs: jobs, clients: clients });
        });
      });
    });
  });
});


module.exports = router;


