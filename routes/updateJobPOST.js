const express = require('express');
const { pool } = require('../db');
const router = express.Router();
const getJobStatus = require('../getJobStatus');


function checkIfJobUpdated(jobId) {
  let resp = pool.query(`SELECT * FROM ticket WHERE ticket.job_id=${jobId}`, (err, resp) => {
    if (err) {
      console.log(`error pulling job: ${jobId} for ticket update check`);
    }
    let testTicket = resp.rows[0];
    let last_updated_time = testTicket.last_updated
    console.log(last_updated_time);
  })
}

router.post('/:jobId/:check', (req, res, next) => {
  // if check == 0 -> it's the first time and we need to check job
  // if check == 1 -> we just respond with the last updated time

  let jobId = req.params.jobId;
  if (req.params.check == 0) {
    getJobStatus(req.params.jobId);
  } else if (req.params.check == 1) {
    const resp = pool.query(
      `SELECT positive_response.last_updated
      FROM positive_response
      INNER JOIN ticket ON positive_response.ticket_id=ticket.id
      INNER JOIN job on ticket.job_id=job.id
      WHERE job.id=${jobId}`, (err, resp) => {
      if (err) {
        console.log(`error getting sample ticket for job: ${jobId}`)
      }
      let sampleTicket = resp.rows[0];
      let lastUpdated = sampleTicket.last_updated
      res.send(JSON.stringify(lastUpdated));
    });
  } else {
    console.log('this is not supposed to happen');
  }
});

module.exports = router;