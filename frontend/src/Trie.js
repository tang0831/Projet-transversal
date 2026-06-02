class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.data = null;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, data = null) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.data = data;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    const results = [];
    this._collectAllWords(node, prefix.toLowerCase(), results);
    return results;
  }

  _collectAllWords(node, currentPrefix, results) {
    if (node.isEndOfWord) {
      results.push({ word: currentPrefix, data: node.data });
    }
    for (const char in node.children) {
      this._collectAllWords(node.children[char], currentPrefix + char, results);
    }
  }
}
