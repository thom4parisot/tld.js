"use strict";

var rules = require('./rules.json');

var cleanHostValue = require('./lib/clean-host.js');
var escapeRegExp = require('./lib/escape-regexp.js');
var getRulesForTld = require('./lib/tld-rules.js');
var getDomain = require('./lib/domain.js');
var getSubdomain = require('./lib/subdomain.js');
var isValid = require('./lib/is-valid.js');
var getPublicSuffix = require('./lib/public-suffix.js');
var tldExists = require('./lib/tld-exists.js');

function factory(rules, validHosts) {
  return {
    cleanHostValue: cleanHostValue,
    escapeRegExp: escapeRegExp,
    getRulesForTld: getRulesForTld,
    getDomain: getDomain.bind(null, rules, validHosts),
    getSubdomain: getSubdomain.bind(null, rules, validHosts),
    isValid: isValid.bind(null, validHosts),
    getPublicSuffix: getPublicSuffix.bind(null, rules),
    tldExists: tldExists.bind(null, rules),
    init: factory.bind(null),
    rules: rules,
  };
}

module.exports = factory(rules, []);
