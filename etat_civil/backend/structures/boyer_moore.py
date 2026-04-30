class BoyerMoore:
    def __init__(self, pattern):
        self.pattern = pattern
        self.m = len(pattern)
        self.bad_char = self.precompute_bad_char()

    def precompute_bad_char(self):
        # The bad character heuristic
        bad_char = {}
        for i in range(self.m):
            bad_char[self.pattern[i]] = i
        return bad_char

    def search(self, text):
        n = len(text)
        s = 0  # shift of the pattern with respect to text
        results = []

        while s <= (n - self.m):
            j = self.m - 1

            # Keep reducing j while characters of pattern and text are matching
            while j >= 0 and self.pattern[j] == text[s + j]:
                j -= 1

            if j < 0:
                results.append(s)
                # Shift the pattern so that the next character in text aligns with the last occurrence of it in pattern
                s += (self.m - self.bad_char.get(text[s + self.m], -1)) if s + self.m < n else 1
            else:
                # Shift the pattern so that the bad character in text aligns with the last occurrence of it in pattern
                s += max(1, j - self.bad_char.get(text[s + j], -1))
        
        return results

def boyer_moore_search(text, pattern):
    if not pattern:
        return 0
    bm = BoyerMoore(pattern)
    res = bm.search(text)
    return res[0] if res else -1
