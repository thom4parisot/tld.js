'use strict';

var deprecate = require('util').deprecate;

// Load rules
var Trie = require('./lib/suffix-trie.js');
var allRules = Trie.fromJson(require('./rules.json'));

// Internals
var extractHostname = require('./lib/clean-host.js');
var getDomain = require('./lib/domain.js');
var getPublicSuffix = require('./lib/public-suffix.js');
var getSubdomain = require('./lib/subdomain.js');
var isValidHostname = require('./lib/is-valid.js');
var isIp = require('./lib/is-ip.js');
var tldExists = require('./lib/tld-exists.js');


// Flags representing steps in the `parse` function. They are used to implement
// a early stop mechanism (simulating some form of laziness) to avoid doing more
// work than necessary to perform a given action (e.g.: we don't need to extract
// the domain and subdomain if we are only interested in public suffix).
var TLD_EXISTS = 1;
var PUBLIC_SUFFIX = 2;
var DOMAIN = 3;
var SUB_DOMAIN = 4;
var ALL = 5;

/**
 * @typedef {object} FactoryOptions
 * @property {import('./lib/suffix-trie.js')} [rules]
 * @property {string[]} [validHosts]
 * @property {(string) => string|null} [extractHostname]
 */

/**
 * @typedef {Object} tldjs
 * @property {(url: string) => string} extractHostname
 * @property {(url: string) => boolean} isValidHostname
 * @property {(url: string) => boolean} isValid
 * @property {(url: string) => ParseResult} parse
 * @property {(url: string) => boolean} tldExists
 * @property {(url: string) => string} getPublicSuffix
 * @property {(url: string) => string|null} getDomain
 * @property {(url: string) => string} getSubdomain
 * @property {(FactoryOptions) => tldjs} fromUserSettings
 */

/**
 * @typedef {object} ParseResult
 * @property {string|null} hostname
 * @property {boolean} isValid
 * @property {boolean} isIp
 * @property {boolean} tldExists
 * @property {string|null} publicSuffix
 * @property {string|null} domain
 * @property {string|null} subdomain
 */

/**
 * Creates a new instance of tldjs
 * @param  {FactoryOptions} options [description]
 * @return {tldjs}                      [description]
 */
function factory(options) {
  var rules = options.rules || allRules || {};
  var validHosts = options.validHosts || [];
  var _extractHostname = options.extractHostname || extractHostname;

  /**
   * Process a given url and extract all information. This is a higher level API
   * around private functions of `tld.js`. It allows to remove duplication (only
   * extract hostname from url once for all operations) and implement some early
   * termination mechanism to not pay the price of what we don't need (this
   * simulates laziness at a lower cost).
   *
   * @param {string} url
   * @param {number} [_step] - where should we stop processing
   * @return {ParseResult}
   */
  function parse(url, _step) {
    var step = _step || ALL;
    /**
     * @type {ParseResult}
     */
    var result = {
      hostname: _extractHostname(url),
      isValid: null,
      isIp: null,
      tldExists: false,
      publicSuffix: null,
      domain: null,
      subdomain: null,
    };

    if (result.hostname === null) {
      result.isIp = false;
      result.isValid = false;
      return result;
    }

    // Check if `hostname` is a valid ip address
    result.isIp = isIp(result.hostname);
    if (result.isIp) {
      result.isValid = true;
      return result;
    }

    // Check if `hostname` is valid
    result.isValid = isValidHostname(result.hostname);
    if (result.isValid === false) { return result; }

    // Check if tld exists
    if (step === ALL || step === TLD_EXISTS) {
      result.tldExists = tldExists(rules, result.hostname);
    }
    if (step === TLD_EXISTS) { return result; }

    // Extract public suffix
    result.publicSuffix = getPublicSuffix(rules, result.hostname);
    if (step === PUBLIC_SUFFIX) { return result; }

    // Extract domain
    result.domain = getDomain(validHosts, result.publicSuffix, result.hostname);
    if (step === DOMAIN) { return result; }

    // Extract subdomain
    result.subdomain = getSubdomain(result.hostname, result.domain);

    return result;
  }


  return {
    extractHostname: _extractHostname,
    isValidHostname: isValidHostname,
    isValid: deprecate(function isValid (hostname) {
      return isValidHostname(hostname);
    }, '"isValid" is deprecated, please use "isValidHostname" instead.'),
    parse: parse,
    tldExists: function (url) {
      return parse(url, TLD_EXISTS).tldExists;
    },
    getPublicSuffix: function (url) {
      return parse(url, PUBLIC_SUFFIX).publicSuffix;
    },
    getDomain: function (url) {
      return parse(url, DOMAIN).domain;
    },
    getSubdomain: function (url) {
      return parse(url, SUB_DOMAIN).subdomain;
    },
    fromUserSettings: factory
  };
}


module.exports = factory({});
