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
    getDomain: function (host) {
      return getDomain(_rules, validHosts, host);
    },
    getSubdomain: function (host) {
      return getSubdomain(_rules, validHosts, host);
    },
    isValid: function (host) {
      return isValid(validHosts, host);
    },
    getPublicSuffix: function (host) {
      return getPublicSuffix(_rules, host);
    },
    tldExists: function (tld) {
      return tldExists(_rules, tld);
    },
    init: factory
  };
}

module.exports = factory([], allRules);
