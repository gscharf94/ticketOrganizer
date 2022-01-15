const { pool } = require('./db');
const getJobStatus = require('./getJobStatus');


async function updateAllJobs() {
  const resp = pool.query('SELECT * FROM job', (err, resp) => {
    if (err) {
      console.log('error pulling jobs');
    }

    for (const job of resp.rows) {
      getJobStatus(job.id);
    }
  });
}


updateAllJobs();

// module.exports = updateAllJobs;