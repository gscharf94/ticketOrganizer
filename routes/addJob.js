const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', (req, res, next) => {
  const resp = pool.query('SELECT * FROM client', (err, resp) => {
    if (err) {
      console.log('error pulling client list');
    }
    let clients = resp.rows;
    console.log(clients);
    res.render('addJob', { clients: clients });
  })
});

router.post('/action', (req, res, next) => {
  res.render('addJobSuccess');
  console.log(req.body);
})

module.exports = router;