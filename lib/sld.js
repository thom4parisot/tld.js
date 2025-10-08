'use strict';


/**
 * Returns the Second Level Domain (SLD) of a hostname string
 *
 * @api
 * @param {string} hostname
 * @param {string} publicSuffix - the public suffix of the hostname
 * @return {string|null} the SLD string if any, otherwise null.
 */
module.exports = function getSLD(hostname, publicSuffix) {
  if (typeof hostname !== 'string' || typeof publicSuffix !== 'string') {
    return null;
  }

  if (!hostname || !publicSuffix) {
    return null;
  }

  if (hostname === publicSuffix) {
    return null;
  }

  if (!hostname.endsWith('.' + publicSuffix)) {
    return null;
  }

  // extract SLD only
  var publicSuffixIndex = hostname.length - publicSuffix.length - 2;
  var lastDotBeforeSuffixIndex = hostname.lastIndexOf('.', publicSuffixIndex);

  if (lastDotBeforeSuffixIndex === -1) {
    // No dot found, the entire part before suffix is the SLD
    return hostname.substring(0, hostname.length - publicSuffix.length - 1);
  } else {
    // Extract the part between the last dot and the suffix
    return hostname.substring(lastDotBeforeSuffixIndex + 1, hostname.length - publicSuffix.length - 1);
  }
};
