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

        const resp2 = pool.query(sqlQuery, (err, resp2) => {
          if (err) {
            console.log(`error pulling locate positions for job: ${jobId}`);
          }

          let positions = resp2.rows;

          let ticks = {};

          for (const position of positions) {
            if (!ticks[position.ticket_id]) {
              ticks[position.ticket_id] = {
                points: [],
                ticket_status: position.ticket_status,
                ticket_number: position.ticket_number,
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

          sqlQuery =
            `SELECT positive_response.response, positive_response.ticket_id FROM positive_response
          INNER JOIN ticket ON positive_response.ticket_id=ticket.id
          INNER JOIN job ON ticket.job_id=job.id
          WHERE job.id=${jobId}`;

          const resp3 = pool.query(sqlQuery, (err, resp3) => {
            if (err) {
              console.log(`error pulling positive responses for jobId ${jobId}`);
            }


            let ticketResponseCounts = {}

            for (const response of resp3.rows) {

              if (!ticketResponseCounts[response.ticket_id]) {
                ticketResponseCounts[response.ticket_id] = {
                  total: 0,
                  clear: 0,
                };
              }

              let clear = false;
              if (
                response.response.search("Marked") != -1 ||
                response.response.search("No Conflict") != -1 ||
                response.response.search("test code") != -1 ||
                response.response.search("Clear No") != -1 ||
                response.response.search("Privately owned facilities") != -1 ||
                response.response.search("Not service provider") != -1
              ) {
                clear = true;
              }

              if (clear) {
                ticketResponseCounts[response.ticket_id].clear++;
              }

              ticketResponseCounts[response.ticket_id].total++;
            }
            res.render('jobDetail', {
              jobId: req.params.jobId,
              tickets: tickets,
              jobFound: jobFound,
              jobName: jobName,
              positions: JSON.stringify(ticks),
              ticketCounts: JSON.stringify(ticketResponseCounts),
            });

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