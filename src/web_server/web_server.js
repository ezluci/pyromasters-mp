'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { resolveTemplates } = require('./templates.js');

const app = express();

app.use('*', (req, res, next) => {
   console.log(new Date(), ' ', req.originalUrl);
   next();
});

app.get('/', serveHTML);
app.get('*.html', serveHTML);
app.get('*.js', serveJS);
app.use(express.static(path.join(__dirname, '..', 'web')));

if (! process.env.PORT_HTTP) {
   console.error(`http port is ${process.env.PORT_HTTP}`);
} else {
   const server = require('http').createServer(app);
   server.listen(process.env.PORT_HTTP, () => {
      console.log(`http on port ${process.env.PORT_HTTP}`);
   });
}


function serveHTML(req, res, next) {
   const url = req.url.split('?')[0];
   const filePath = path.join(__dirname, '..', 'web', (url === '/' ? '/index.html' : url));
   if (!fs.existsSync(filePath)) {
      res.status(404).end();
      return;
   }

   const file = fs.readFileSync(filePath, { encoding: 'utf-8' });
   res.set('Content-Type', 'text/html');
   res.send(resolveTemplates(file));
}


function serveJS(req, res, next) {
   const url = req.url.split('?')[0];
   const filePath = path.join(__dirname, '..', 'web', url);
   if (!fs.existsSync(filePath)) {
      res.status(404).end();
      return;
   }

   const file = fs.readFileSync(filePath, { encoding: 'utf-8' });
   res.set('Content-Type', 'text/javascript');
   res.send(resolveTemplates(file));
}