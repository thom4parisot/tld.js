#!/usr/bin/env node

'use strict';

var tldjs = require('..');

var output = tldjs.parse(process.argv[2] || '');

process.stdout.write(JSON.stringify(output, null, 2));
