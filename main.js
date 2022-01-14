const path = require('path');
const express = require('express');
const app = express();
const port = 3000;
const indexRouter = require('./routes/index');
const jobDetailRouter = require('./routes/jobDetail');
const clientDetailRouter = require('./routes/clientDetail');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/', indexRouter);
app.use('/jobDetail', jobDetailRouter);
app.use('/clientDetail', clientDetailRouter);

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});