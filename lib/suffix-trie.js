"use strict";


var VALID_HOSTNAME_VALUE = 0;


function minIndex(a, b) {
  if (a === null) return b;
  if (b === null) return a;
  return a < b ? a : b;
}


function insertInTrie(rule, trie) {
  var parts = rule.parts;
  var node = trie;

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    var nextNode = node[part];
    if (nextNode === undefined) {
      nextNode = Object.create(null);
      node[part] = nextNode;
    }

    node = nextNode;
  }

  node.$ = VALID_HOSTNAME_VALUE;

  return trie;
}


function lookupInTrie(parts, trie, index) {
  var part;
  var nextNode;
  var publicSuffixIndex = null;

  if (trie === undefined) {
    return null;
  }

  // We have a match
  if (trie.$ !== undefined) {
    publicSuffixIndex = index + 1;
  }

  if (index === -1) {
    return publicSuffixIndex;
  }

  // Check branch corresponding to next part of hostname
  part = parts[index];
  nextNode = trie[part];
  if (nextNode !== undefined) {
    publicSuffixIndex = minIndex(
      publicSuffixIndex,
      lookupInTrie(parts, nextNode, index - 1)
    );
  }

  // Check wildcard
  nextNode = trie['*'];
  if (nextNode !== undefined) {
    publicSuffixIndex = minIndex(
      publicSuffixIndex,
      lookupInTrie(parts, nextNode, index - 1)
    );
  }

  return publicSuffixIndex;
}


function SuffixTrie(rules) {
  this.exceptions = Object.create(null);
  this.rules = Object.create(null);

  (rules || []).forEach(function (rule) {
    if (rule.exception) {
      insertInTrie(rule, this.exceptions);
    } else {
      insertInTrie(rule, this.rules);
    }
  }.bind(this));
}


SuffixTrie.fromJson = function (json) {
  var trie = new SuffixTrie();

  trie.exceptions = json.exceptions;
  trie.rules = json.rules;

  return trie;
};


SuffixTrie.prototype.hasTld = function (value) {
  return this.rules[value] !== undefined;
};


SuffixTrie.prototype.suffixLookup = function (hostname) {
  var publicSuffix = null;
  var parts = hostname.split('.');

  // Look for a match in rules
  publicSuffixIndex = lookupInTrie(
    parts,
    this.rules,
    parts.length - 1
  );

  if (publicSuffixIndex === null) {
    return null;
  }

  publicSuffix = parts.slice(publicSuffixIndex).join('.');

  // Look for exceptions
  var publicSuffixIndex = lookupInTrie(
    parts,
    this.exceptions,
    parts.length - 1
  );

  if (publicSuffixIndex !== null) {
    publicSuffix = parts.slice(publicSuffixIndex + 1).join('.');
  }

  return publicSuffix;
};


SuffixTrie.prototype.lookup = function (hostname) {
  var candidate = this.suffixLookup(hostname);

  if (candidate !== hostname) {
    return null;
  }

  return candidate;
};


SuffixTrie.prototype.has = function (hostname) {
  return this.lookup(hostname) !== null;
};


module.exports = SuffixTrie;