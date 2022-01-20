const express = require('express');
const router = require('./ticketDetail');

router.post('/:jobId', (req, res, next) => {
  // now here we can run the code that updates the job
})

module.exports = router;