var isValid = require('./is-valid.js');

/**
 * Utility to cleanup the base host value. Also removes url fragments.
 *
 * Works for:
 * - hostname
 * - //hostname
 * - scheme://hostname
 * - scheme+scheme://hostname
 *
 * @param {string} value
 * @return {String}
 */

// scheme      = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
var hasPrefixRE = /^(([a-z][a-z0-9+.-]+)?:)\/\//;
var ipLikeRE = /(\d+\.){3}\d+/i;
var ipv6LikeRE = /(([A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4}|::1)/i;


/**
 * @see https://github.com/oncletom/tld.js/issues/95
 *
 * @param {string} value
 */
function trimTrailingDots(value) {
  if (value[value.length - 1] === '.') {
    return value.substr(0, value.length - 1);
  }
  return value;
}


/**
 * Fast check to avoid calling `trim` when not needed.
 *
 * @param {string} value
 */
function checkTrimmingNeeded(value) {
  return (
    value.length > 0 && (
      value.charCodeAt(0) <= 32 ||
      value.charCodeAt(value.length - 1) <= 32
    )
  );
}


/**
 * Fast check to avoid calling `toLowerCase` when not needed.
 *
 * @param {string} value
 */
function checkLowerCaseNeeded(value) {
  for (var i = 0; i < value.length; i += 1) {
    var code = value.charCodeAt(i);
    if (code >= 65 && code <= 90) { // [A-Z]
      return true;
    }
  }

  return false;
}


module.exports = function extractHostname(value) {
  // First check if `value` is already a valid hostname.
  if (isValid(value)) {
    return trimTrailingDots(value);
  }

  var url = value;

  if (typeof url !== 'string') {
    url = '' + url;
  }

  var needsLowerCase = checkLowerCaseNeeded(url);
  if (needsLowerCase) {
    url = url.toLowerCase();
  }

  var v6Match = url.match(ipv6LikeRE);
  if (v6Match) {
    return v6Match[1];
  }

  var needsTrimming = checkTrimmingNeeded(url);
  if (needsTrimming) {
    url = url.trim();
  }

  // Try again after `url` has been transformed to lowercase and trimmed.
  if ((needsLowerCase || needsTrimming) && isValid(url)) {
    return trimTrailingDots(url);
  }

  // Proceed with heavier url parsing to extract the hostname.
  if (!hasPrefixRE.test(url)) {
    url = 'https://' + url;
  }

  try {
    var parts = new URL(url);

    if (parts.hostname) {
      // WHATWG URL parses any integer sequence as an IP, whereas the legacy
      // node URL module would not. Preserve behavior where non-ip-like strings
      // will not result in valid hostnames.
      if (ipLikeRE.test(parts.hostname) && !ipLikeRE.test(value)) {
        return value;
      }
      return trimTrailingDots(parts.hostname);
    }
  } catch (e) {
    // Invalid URL
  }

  return null;
};
