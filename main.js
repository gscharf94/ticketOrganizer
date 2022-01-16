const path = require('path');
const express = require('express');
const app = express();
const port = 3000;
const indexRouter = require('./routes/index');
const jobDetailRouter = require('./routes/jobDetail');
const clientDetailRouter = require('./routes/clientDetail');
const ticketDetailRouter = require('./routes/ticketDetail');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static('public'));
app.use('/', indexRouter);
app.use('/jobDetail', jobDetailRouter);
app.use('/clientDetail', clientDetailRouter);
app.use('/ticketDetail', ticketDetailRouter);

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});