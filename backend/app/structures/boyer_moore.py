class BoyerMoore:
    """
    Implémentation de l'algorithme de recherche de chaîne Boyer-Moore.
    """
    def __init__(self, motif):
        self.motif = motif
        self.taille_motif = len(motif)
        self.table_mauvais_caractere = self._creer_table_mauvais_caractere()

    def _creer_table_mauvais_caractere(self):
        """
        Crée la table des mauvais caractères pour le saut.
        """
        table = {}
        for i in range(self.taille_motif):
            table[self.motif[i]] = i
        return table

    def rechercher(self, texte):
        """
        Recherche le motif dans le texte donné.
        Retourne l'index de la première occurrence ou -1 si non trouvé.
        """
        taille_texte = len(texte)
        decalage = 0
        
        while decalage <= taille_texte - self.taille_motif:
            j = self.taille_motif - 1
            
            # Comparaison de droite à gauche
            while j >= 0 and self.motif[j] == texte[decalage + j]:
                j -= 1
            
            if j < 0:
                return decalage # Motif trouvé
            else:
                # Calcul du décalage basé sur la table des mauvais caractères
                caractere_mauvais = texte[decalage + j]
                decalage += max(1, j - self.table_mauvais_caractere.get(caractere_mauvais, -1))
        
        return -1
