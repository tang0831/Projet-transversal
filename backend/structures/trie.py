class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.data = None

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word, data=None):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.data = data

    def search(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return None
            node = node.children[char]
        return node.data if node.is_end_of_word else None

    def starts_with(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]
        
        # Collect all words starting with this prefix
        results = []
        self._collect_all_words(node, prefix, results)
        return results

    def _collect_all_words(self, node, current_prefix, results):
        if node.is_end_of_word:
            results.append((current_prefix, node.data))
        
        for char, child_node in node.children.items():
            self._collect_all_words(child_node, current_prefix + char, results)
