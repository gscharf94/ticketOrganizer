const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.send('hello world');
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});