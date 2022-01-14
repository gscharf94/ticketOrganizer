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
        job.percent_clear = "0%";
      }



      router.get('/', (req, res, next) => {
        res.render('index', { title: 'Job List', jobs: jobs, clients: clients });
      });
    });
  });
});


module.exports = router;


