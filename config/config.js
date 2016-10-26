/* jslint node: true */
'use strict';

var path = require('path');
require('dotenv').config();

var rootPath = path.normalize(__dirname + '/..');

var NODE_ENV = process.env.NODE_ENV || 'production';
var NODE_HOST = process.env.NODE_HOST || '127.0.0.1';
var NODE_PORT = process.env.NODE_PORT || 3000;
var MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1';
var MONGO_PORT = process.env.MONGO_PORT || 27017;
var LOG_LEVEL = process.env.LOG_LEVEL || 'info';

var APP_NAME = 'shield-readme';

var config = {
  development: {
    root: rootPath,
    app: {
      name: APP_NAME + NODE_ENV,
      address: NODE_HOST,
      port: NODE_PORT
    },
    db: {
      host: MONGO_HOST,
      port: MONGO_PORT,
      name: APP_NAME + NODE_ENV
    },
    log: {
      name: APP_NAME + NODE_ENV,
      level: LOG_LEVEL
    }
  },
  test: {
    root: rootPath,
    app: {
      name: APP_NAME + NODE_ENV,
      address: NODE_HOST,
      port: NODE_PORT
    },
    db: {
      host: MONGO_HOST,
      port: MONGO_PORT,
      name: APP_NAME + NODE_ENV
    },
    log: {
      name: APP_NAME + NODE_ENV,
      level: LOG_LEVEL
    }
  },
  production: {
    root: rootPath,
    app: {
      name: APP_NAME + NODE_ENV,
      address: NODE_HOST,
      port: NODE_PORT
    },
    db: {
      host: MONGO_HOST,
      port: MONGO_PORT,
      name: APP_NAME + NODE_ENV
    },
    log: {
      name: APP_NAME + NODE_ENV,
      level: LOG_LEVEL
    },
    redis: {
      url: process.env.REDIS_URL
    },
    shield: {
      providers: { shieldsio: { url: "https://img.shields.io/badge/" }}
    },
    badge: {
      type: {
        readme: { name: "readme", svg: "" }
      }
    },
    messages: {
      params: {
        coder: [
          "You need to provide a coder parameter in any of the following forms: [ <GitHub user> | { GitHub: \"<GitHub user>\" } | { GitHub: \"<GitHub user>\", npm: \"<npm user>\" } ]",
          "Wrong format used for coder parameter."
        ],
        repo: [
          "You need to provide a repo parameter in any of the following forms: [ <GitHub repo> | <{ GitHub: \"repo\" }> | <{ GitHub: \"repo\", npm: \"repo\" }> ]",
          "Wrong format used for repo parameter."
        ]
      }
    }
  }
};

module.exports = config[NODE_ENV];
