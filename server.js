const express = require('express');
const path = require('path');
const url = require('url');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const proxy = require('express-http-proxy');

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

/** ENVIRONMENT */
const env = process.env.NODE_ENV;

/** LOCAL PROXY */

const proxyPath = 'http://localhost:8080';
const apiProxy = proxy(proxyPath, {
  proxyReqPathResolver: req => url.parse(req.originalUrl).path
});

if (env && env.trim() === 'local') {
  app.use('/api/*', apiProxy);
}

/** APPLICATION */
app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));

/** COOKIES */

app.get('/auth-id-token', (req, res) => {
  const idToken = req.cookies['AUTH_ID_TOKEN'] || '';
  res.send(idToken);
});

app.delete('/auth-id-token', (req, res) => {
  res.clearCookie('AUTH_ID_TOKEN').send(true);
});

app.get('*', (req, res) => {
  res.sendFile('public/index.html', {
    root: __dirname
  });
});

app.listen(app.get('port'), () => {
  console.log('App running on port', app.get('port'));
});
