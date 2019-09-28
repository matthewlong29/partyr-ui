// const express = require('express');
// const path = require('path');
// const proxy = require('express-http-proxy');
// const url = require('url');
// const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
// const serverless = require('serverless-http');

// const app = express();
// const router = express.Router();

// app.use(cookieParser());
// app.use(bodyParser.json());

// /** ENVIRONMENT */
// // const env = process.env.NODE_ENV;

// // app.use(express.static(path.join(__dirname, 'public')));

// /** COOKIES */
// router.get('/logged-in', (req, res) => {
//   const cookie = req.cookies['LOGGED_IN'];
//   const loggedIn = (cookie || '').toUpperCase() === 'TRUE';
//   res.send(loggedIn);
// });

// router.get('/auth-id-token', (req, res) => {
//   const idToken = req.cookies['AUTH_ID_TOKEN'];
//   res.send(idToken);
// });

// router.delete('/logged-in', (req, res) => {
//   res.clearCookie('LOGGED_IN').send();
// });

// router.delete('/auth-id-token', (req, res) => {
//   res.clearCookie('AUTH_ID_TOKEN').send();
// });

// // if (env && env.trim() === 'local') {
// //   /** APPLICATION */
// //   app.set('port', process.env.PORT || 3000);

// //   /** LOCAL PROXY */
// //   const proxyPath = 'localhost:8080';
// //   const apiProxy = proxy(proxyPath, {
// //     proxyReqPathResolver: req => url.parse(req.originalUrl).path
// //   });

// //   app.use('/api/*', apiProxy);

// //   app.listen(app.get('port'), () => {
// //     console.log('App running on port', app.get('port'));
// //   });

// //   router.get('*', (req, res) => {
// //     res.sendFile('public/index.html', {
// //       root: __dirname
// //     });
// //   });

// //   app.use(router);
// // }

// app.use('/.netlify/functions/server', router);
// module.exports = app;
// module.exports.handler = serverless(app);

const express = require('express');
const path = require('path');
const proxy = require('express-http-proxy');
const url = require('url');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

app.use(cookieParser());
app.use(bodyParser.json());

/** ENVIRONMENT */
const env = process.env.NODE_ENV;

/** PROXY */
const proxyPath = process.env.PROXY_PATH;
const apiProxy = proxy(proxyPath, {
  proxyReqPathResolver: req => url.parse(req.originalUrl).path
});

app.use('/api/*', apiProxy);

/** APPLICATION */
app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));

/** COOKIES */
router.get('/logged-in', (req, res) => {
  const cookie = req.cookies['LOGGED_IN'];
  const loggedIn = (cookie || '').toUpperCase() === 'TRUE';
  res.send(loggedIn);
});

router.get('/auth-id-token', (req, res) => {
  const idToken = req.cookies['AUTH_ID_TOKEN'];
  res.send(idToken);
});

router.delete('/logged-in', (req, res) => {
  res.clearCookie('LOGGED_IN').send();
});

router.delete('/auth-id-token', (req, res) => {
  res.clearCookie('AUTH_ID_TOKEN').send();
});

app.use('/.netlify/functions/api', router);

if (env && env === 'local') {
  app.listen(app.get('port'), () => {
    console.log('App running on port', app.get('port'));
  });
  router.get('*', (req, res) => {
    res.sendFile('public/index.html', {
      root: __dirname
    });
  });
} else {
  module.exports = app;
  module.exports.handler = serverless(app);
}
