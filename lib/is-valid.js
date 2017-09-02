"use strict";


/**
 * Check if the code point is a digit [0-9]
 *
 * @param {number} code
 * @return boolean
 */
function isDigit(code) {
  // 48 == '0'
  // 57 == '9'
  return code >= 48 && code <= 57;
}


/**
 * Check if the code point is a letter [a-zA-Z]
 *
 * @param {number} code
 * @return boolean
 */
function isAlpha(code) {
  // Force to lower-case
  code |= 32;
  // 97 === 'a'
  // 122 == 'z'
  return code >= 97 && code <= 122;
}


/**
 * Check if the code point is a valid character in first position of a hostname.
 *
 * @param {number} code
 * @return boolean
 */
function isAllowedFirstHostnameChar(code) {
  return isAlpha(code) || isDigit(code);
}


/**
 * Check if the code point is a valid hostname character.
 *
 * @param {number} code
 * @return boolean
 */
function isAllowedHostnameChar(code) {
  return (
    isAlpha(code) ||
    isDigit(code) ||
    code === 45 // '-'
  );
}


/**
 * Check if a host string is valid (according to RFC
 * It's usually a preliminary check before trying to use getDomain or anything else
 *
 * Beware: it does not check if the TLD exists.
 *
 * @api
 * @param {string} host
 * @return {boolean}
 */
module.exports = function isValid(validHosts, host) {
  if (typeof host !== 'string') {
    return false;
  }

  if (host.length > 255) {
    return false;
  }

  if (validHosts.indexOf(host) !== -1) {
    return true;
  }

  if (host.length === 0) {
    return false;
  }

  // Check first character
  if (isAllowedFirstHostnameChar(host.charCodeAt(0)) === false) {
    return false;
  }

  // Validate host according to RFC
  var lastDotIndex = -1;
  var i = 0;
  for (; i < host.length; i += 1) {
    var code = host.charCodeAt(i);

    if (code === 46) { // '.'
      // Check maximum label size is 63 octets
      if ((i - lastDotIndex) > 64) {
        return false;
      }

      // Forbid two consecutive dots
      if (lastDotIndex === (i - 1)) {
        return false;
      }

      lastDotIndex = i;
    } else if (isAllowedHostnameChar(code) === false) {
      return false;
    }
  }

  // Check that hostname contains at least one dot.
  if (lastDotIndex === -1) {
    return false;
  }

  // Check that last label is <= 63 octets long
  if ((i - lastDotIndex) > 64) {
    return false;
  }

  return true;
};
