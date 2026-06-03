class UnionFind:
    """
    Implémentation de la structure Union-Find (Disjoint Set Union)
    pour la gestion des liens de parenté.
    """
    def __init__(self, taille):
        self.parent = list(range(taille))
        self.rang = [0] * taille

    def trouver(self, i):
        """
        Trouve le représentant de l'ensemble avec compression de chemin.
        """
        if self.parent[i] == i:
            return i
        self.parent[i] = self.trouver(self.parent[i])
        return self.parent[i]

    def unir(self, i, j):
        """
        Unit deux ensembles.
        """
        racine_i = self.trouver(i)
        racine_j = self.trouver(j)
        
        if racine_i != racine_j:
            # Union par rang
            if self.rang[racine_i] < self.rang[racine_j]:
                self.parent[racine_i] = racine_j
            elif self.rang[racine_i] > self.rang[racine_j]:
                self.parent[racine_j] = racine_i
            else:
                self.parent[racine_i] = racine_j
                self.rang[racine_j] += 1
            return True
        return False # Déjà dans le même ensemble
