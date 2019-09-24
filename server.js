const express = require('express');
const path = require('path');
const proxy = require('express-http-proxy');
const url = require('url');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

var app = express();
app.use(cookieParser());
app.use(bodyParser.json());

/** PROXY */
const apiProxy = proxy('localhost:8080/api', {
  proxyReqPathResolver: req => url.parse(req.originalUrl).path
});

app.use('/api/*', apiProxy);

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

// app.post('/auth-id-token', (req, res) => {
//   res
//     .cookie('AUTH_ID_TOKEN', req.body.idToken, {
//       httpOnly: true
//     })
//     .send();
// });

app.get('*', (req, res) => {
  res.sendFile('public/index.html', {
    root: __dirname
  });
});

app.listen(app.get('port'), () => {
  console.log('App running on port', app.get('port'));
});
