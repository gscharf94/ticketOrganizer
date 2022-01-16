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

        sqlQuery =
          `SELECT * FROM locate_position
          INNER JOIN ticket ON locate_position.ticket_id=ticket.id
          INNER JOIN job ON ticket.job_id=job.id
          WHERE job.id=${jobId};`;

        console.log(sqlQuery);

        const resp2 = pool.query(sqlQuery, (err, resp2) => {
          if (err) {
            console.log(`error pulling locate positions for job: ${jobId}`);
          }

          let positions = resp2.rows;
          console.log(positions);

          let ticks = {};

          for (const position of positions) {
            if (!ticks[position.ticket_id]) {
              ticks[position.ticket_id] = {
                points: [],
              }
            }
            ticks[position.ticket_id].points.push({
              a: position.start_pos,
              b: position.end_pos,
              p: position.place,
            });
          }

          for (const tick in ticks) {
            ticks[tick].points = ticks[tick].points.sort((a, b) => {
              return a.p - b.p;
            });
          }

          res.render('jobDetail', {
            jobId: req.params.jobId,
            tickets: tickets,
            jobFound: jobFound,
            jobName: jobName,
            positions: JSON.stringify(ticks)
          });
        })


      });

    }
    else {
      res.render('jobDetail', { jobId: req.params.jobId, tickets: tickets, jobFound: jobFound });
    }
  });
})

module.exports = router;