const express = require('express');
const router = express.Router();
const { pool } = require('../db');

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

    res.render('jobDetail', { jobId: req.params.jobId, tickets: tickets, jobFound: jobFound });

  });
})

module.exports = router;