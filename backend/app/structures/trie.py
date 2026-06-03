class NoeudTrie:
    """
    Représente un nœud dans l'arbre Trie.
    """
    def __init__(self):
        self.enfants = {}
        self.est_fin_mot = False

class Trie:
    """
    Implémentation de la structure de données Trie (Arbre préfixe).
    """
    def __init__(self):
        self.racine = NoeudTrie()

    def inserer(self, mot):
        """
        Insère un mot dans le Trie.
        """
        noeud = self.racine
        for caractere in mot:
            if caractere not in noeud.enfants:
                noeud.enfants[caractere] = NoeudTrie()
            noeud = noeud.enfants[caractere]
        noeud.est_fin_mot = True

    def rechercher_prefixe(self, prefixe):
        """
        Retourne tous les mots commençant par le préfixe donné.
        """
        noeud = self.racine
        for caractere in prefixe:
            if caractere not in noeud.enfants:
                return []
            noeud = noeud.enfants[caractere]
        
        resultats = []
        self._collecter_mots(noeud, prefixe, resultats)
        return resultats

    def _collecter_mots(self, noeud, prefixe_actuel, resultats):
        """
        Méthode récursive pour collecter les mots.
        """
        if noeud.est_fin_mot:
            resultats.append(prefixe_actuel)
        
        for caractere, enfant in noeud.enfants.items():
            self._collecter_mots(enfant, prefixe_actuel + caractere, resultats)
