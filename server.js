const express = require('express');
const path = require('path');
const url = require('url');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

/** APPLICATION */
app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));

/** COOKIES */
app.get('/logged-in', (req, res) => {
  const cookie = req.cookies['LOGGED_IN'];
  const loggedIn = (cookie || '').toUpperCase() === 'TRUE';
  res.send(loggedIn);
});

app.get('/auth-id-token', (req, res) => {
  const idToken = req.cookies['AUTH_ID_TOKEN'];
  res.send(idToken);
});

app.delete('/logged-in', (req, res) => {
  res.clearCookie('LOGGED_IN').send();
});

app.delete('/auth-id-token', (req, res) => {
  res.clearCookie('AUTH_ID_TOKEN').send();
});

app.get('*', (req, res) => {
  res.sendFile('public/index.html', {
    root: __dirname
  });
});

app.listen(app.get('port'), () => {
  console.log('App running on port', app.get('port'));
});
