const express = require('express');
const router = express.Router();
const { pool } = require('../db');


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
    }

    router.get('/', (req, res, next) => {
      res.render('index', { title: 'Job List', jobs: jobs, clients: clients });
    });
  });
});


module.exports = router;


