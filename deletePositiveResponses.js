const { clearJobPositiveResponses } = require('./insertPositiveResponses');

async function deletePositiveResponses() {
  const jobId = process.argv.slice(2);
  clearJobPositiveResponses(jobId);
}

deletePositiveResponses();