'use strict';

const path = require('node:path');
const fs = require('node:fs');
const ejs = require('ejs');
require('dotenv').config();

function readFile(path) {
   return fs.readFileSync(path, { encoding: 'utf-8' });
}

const templates = {};

templates.version = JSON.parse(readFile(path.join(__dirname, '..', '..', 'package.json'))).version;
templates.socket_port = process.env.PORT_SOCKET.toString();
templates.footer = resolveTemplates(readFile(path.join(__dirname, 'templates', 'footer.html')));


function resolveTemplates(html) {
   return ejs.render(html, templates);
}

module.exports.resolveTemplates = resolveTemplates;