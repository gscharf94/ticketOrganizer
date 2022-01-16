const express = require('express');
const router = express.Router();
const { pool } = require('../db');


router.get('/', (req, res, next) => {

  const resp = pool.query('SELECT * FROM locate_position', (err, resp) => {
    if (err) {
      console.log('beep boop error testing');
    }

    let positions = resp.rows;
    let ticks = {};

    for (const position of positions) {
      if (!ticks[position.ticket_id]) {

        ticks[position.ticket_id] = {
          points: [],
        };
      }
      ticks[position.ticket_id].points.push({
        a: position.start_pos,
        b: position.end_pos,
        p: position.place,
      });
    }

    for (const tick in ticks) {
      // we need to make sure the points are in the correct order
      ticks[tick].points = ticks[tick].points.sort((a, b) => {
        return a.p - b.p;
      });
    }
    res.render('map', { ticks: JSON.stringify(ticks) });
  });

});


module.exports = router;