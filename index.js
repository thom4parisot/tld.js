"use strict";

var allRules = require('./rules.json');

var cleanHostValue = require('./lib/clean-host.js');
var escapeRegExp = require('./lib/escape-regexp.js');
var getRulesForTld = require('./lib/tld-rules.js');
var getDomain = require('./lib/domain.js');
var getSubdomain = require('./lib/subdomain.js');
var isValid = require('./lib/is-valid.js');
var getPublicSuffix = require('./lib/public-suffix.js');
var tldExists = require('./lib/tld-exists.js');

function factory(validHosts, rules) {
  var _rules = rules || allRules;

  return {
    cleanHostValue: cleanHostValue,
    escapeRegExp: escapeRegExp,
    getRulesForTld: getRulesForTld,
    getDomain: getDomain.bind(null, _rules, validHosts),
    getSubdomain: getSubdomain.bind(null, _rules, validHosts),
    isValid: isValid.bind(null, validHosts),
    getPublicSuffix: getPublicSuffix.bind(null, _rules),
    tldExists: tldExists.bind(null, _rules),
    init: factory.bind(null)
  };
}

module.exports = factory([], allRules);
