const express = require('express');
const router = express.Router();


router.get('/', (req, res, next) => {
  res.render('map', { test: 'testing 123' });
});


module.exports = router;