![](media/image1.png){width="2.1458333333333335in"
height="2.1458333333333335in"}

***Projet transversal -- Niveau L2***

***Parcours « Services Informatiques aux Organisations »***

***Thème : Système Centralisé de l\'Identité Civile Numérique***

**Présenté par :** TANG Aimelie Willia SE 20240200

**Encadré par :** Monsieur RAZAFINDRAIBE Fabrice

**Année universitaire : 2025-2026**

**SOMMAIRE**

# 

**RÉSUMÉ........................................................................................01**

**ABSTRACT....................................................................................02**

**INTRODUCTION
GÉNÉRALE...........................................................03**

### PARTIE I : ANALYSE ET CONCEPTION DU SYSTÈME

1.  Analyse des
    besoins**..........................................................04**

<!-- -->

2.  Fonctionnalités à
    implémenter**..............................................04**

<!-- -->

3.  Modélisation du système
    (UML)**...........................................05**

### PARTIE II : ARCHITECTURE TECHNIQUE ET RÉALISATION

1.  Technologies
    utilisées**........................................................10**

<!-- -->

2.  Structure des dossiers
    (Arborescence)**.....................................12**

<!-- -->

3.  Structure de la base de données
    (SQL)**....................................15**

### PARTIE III : RÉSULTATS EXPÉRIMENTAUX ET PERSPECTIVES

1.  Scénarios d\'utilisation et résultats
    obtenus**................................19**

<!-- -->

2.  Perspectives
    d'amélioration**................................................24**

**CONCLUSION
GÉNÉRALE.............................................................26**

**BIBLIOGRAPHIE........................................................................\...27**

**ANNEXES**

- ANNEXE A : Questionnaire
  terrain**.............................................\...28**

- ANNEXE B : Extraits de code source
  (Algorithmes)**...........................28**

**TABLE DES
MATIERES..................................................................34**

**RÉSUMÉ**

Ce projet propose la conception d'une Plateforme Nationale d'Identité
Civile Numérique dans une vision prospective à l'horizon 2035. Il vise à
centraliser et sécuriser les données d'état civil afin de résoudre les
problèmes de fragmentation des registres papier, de doublons d'identité
et de lenteur des traitements administratifs. Le système permet
l'enregistrement des actes de naissance, mariage et décès, ainsi que la
gestion des liens de parenté et la recherche efficace des citoyens. Une
attention particulière est portée à la performance des recherches sur de
grands volumes de données grâce à l'utilisation d'algorithmes optimisés
et de structures de données adaptées. Le projet intègre également des
mécanismes de vérification de cohérence des données pour garantir
l'unicité et la fiabilité des identités. L'architecture repose sur une
API REST développée en FastAPI, un frontend en React.js et une base de
données MySQL. Des contraintes fortes sont imposées, notamment
l'implémentation d'algorithmes sans bibliothèques externes et la gestion
d'un mode hors ligne pour les zones à faible connectivité. L'objectif
final est de proposer un système robuste, sécurisé et évolutif capable
de moderniser la gestion de l'identité civile. Ce travail met en avant
l'importance de l'algorithmique et de la conception logicielle dans les
systèmes publics critiques.

**Mots-clés :** Identité numérique, état civil, base de données,
algorithmes, FastAPI, React.js, sécurité.

**ABSTRACT**

This project presents the design of a National Digital Civil Identity
Platform within a forward-looking vision for 2035. It aims to centralize
and secure civil status data in order to address the fragmentation of
paper-based records, identity duplication, and slow administrative
processing. The system supports the registration of vital events such as
birth, marriage, and death, as well as the management of family
relationships and efficient citizen search. Special emphasis is placed
on high-performance data processing using optimized algorithms and
appropriate data structures to handle large-scale databases. The
platform also includes consistency verification mechanisms to ensure
identity uniqueness and data reliability. The architecture is based on a
FastAPI REST backend, a React.js frontend, and a MySQL database. Strong
constraints are applied, including the implementation of core algorithms
without external libraries and offline functionality for areas with
limited connectivity. The main goal is to build a secure, scalable, and
efficient system capable of modernizing civil identity management. This
work highlights the importance of algorithmic design and software
engineering in critical public systems.

**Keywords :** Digital identity, civil registration, database systems,
algorithms, FastAPI, React.js, cybersecurity.

**INTRODUCTION**

À l'ère de la transformation numérique, la gestion des données d'état
civil constitue un enjeu

majeur pour les administrations publiques. Dans de nombreux pays,
notamment à Madagascar, les systèmes actuels reposent encore largement
sur des registres papier fragmentés, sujets à la perte, aux erreurs et
aux doublons. Cette situation entraîne des lenteurs administratives
importantes, une faible fiabilité des données et des difficultés dans la
planification des politiques publiques. Dans ce contexte, la mise en
place d'une identité civile numérique centralisée devient une nécessité
stratégique.

La problématique principale de ce projet est donc la suivante : comment
concevoir un système fiable, sécurisé et performant permettant de
centraliser, gérer et exploiter efficacement les données d'état civil
tout en garantissant l'unicité de chaque citoyen ?

Pour répondre à cette problématique, ce projet vise plusieurs objectifs
globaux. Il s'agit tout d'abord de centraliser les informations d'état
civil dans une base de données robuste. Ensuite, le système doit
garantir l'unicité des identités grâce à des mécanismes de vérification
et des structures de données adaptées. Il doit également assurer des
performances élevées lors des opérations de recherche et de traitement,
même sur de grands volumes de données. Enfin, une attention particulière
est accordée à l'accessibilité du système, notamment dans les zones à
connectivité limitée.

Ce rapport est structuré en plusieurs parties. Il commence par une
présentation du contexte et des besoins du projet, suivie de l'analyse
fonctionnelle et des spécifications du système. Ensuite, la conception
et les choix technologiques sont détaillés, avant d'aborder les
algorithmes et structures de données utilisés. Enfin, le document
présente l'implémentation, les tests effectués ainsi que les
perspectives d'évolution du projet.

**ANALYSE ET CONCEPTION**

1.  **Analyse des besoins**

Le système répond au besoin de modernisation de l'état civil à
Madagascar. Les registres papier actuels provoquent des pertes de
données, des doublons et des recherches très lentes. La plateforme
permet de centraliser toutes les informations dans une base de données
sécurisée et accessible.\
\
Les principaux utilisateurs du système sont :\
- L'administrateur système : gestion des comptes et supervision.\
- L'officier d'état civil : validation des actes et contrôle des
informations sensibles.\
- L'agent de saisie : enregistrement des actes de naissance, mariage et
décès.\
- Le citoyen : consultation limitée de ses informations personnelles.\
Le système doit garantir la rapidité des recherches, la sécurité des
données et l'unicité des identités numériques.

2.  **Fonctionnalités à implémenter**

Les principales fonctionnalités du système sont :\
- Enregistrement des actes de naissance, mariage et décès.\
- Recherche multicritère rapide des citoyens.\
- Gestion des liens de parenté.\
- Vérification des doublons d'identité.\
- Authentification sécurisée des utilisateurs.\
- Consultation des informations d'état civil.\
- Gestion du mode hors ligne avec synchronisation des données.\
- Journalisation des opérations sensibles.

3.  **Modélisation du système**

    1.  ![](media/image3.svg){width="6.447916666666667in"
        height="8.869062773403325in"}**Diagramme de cas d'utilisation**

Ce diagramme UML de cas d'utilisation décrit le fonctionnement d'un
système informatique destiné à la gestion des actes d'état civil et des
citoyens.\
Les personnages autour du système sont appelés des acteurs. Ici, on
retrouve principalement le Citoyen, l'Officier d'état civil et
l'Administrateur. Chaque acteur possède des rôles différents dans
l'application.

Le Citoyen utilise le système pour effectuer des demandes comme demander
un acte de naissance, consulter l'état de ses demandes ou accéder à ses
informations personnelles.\
L'Officier d'état civil s'occupe des opérations administratives :
enregistrer les naissances, mariages ou décès, vérifier les demandes et
délivrer les actes officiels.\
L'Administrateur, quant à lui, assure la gestion technique du système :
gestion des utilisateurs, des localités, des paramètres et des journaux
(logs).

Les ovales représentent les fonctionnalités du système appelées cas
d'utilisation.\
Les relations « include » signifient qu'une fonctionnalité utilise
obligatoirement une autre fonctionnalité.\
Les relations « extend » indiquent qu'une action est optionnelle ou
complémentaire à une autre.

En résumé, ce diagramme montre clairement qui utilise le système et
quelles actions chaque utilisateur peut réaliser.

2.  **Diagramme de séquence**

> ![](media/image5.svg){width="6.802083333333333in" height="6.58125in"}
>
> Ce diagramme de séquence décrit le fonctionnement chronologique du
> système et met en évidence la circulation des données à travers
> plusieurs processus clés :

- Authentification : Ce flux gère la connexion sécurisée de l\'agent et
  la récupération instantanée de ses droits d\'accès ainsi que de sa
  restriction géographique.

- Enregistrement Civil : Il formalise le flux d\'insertion et de
  persistance des données du citoyen et de son acte d\'état civil dans
  la base de données.

- Traitement & Impression : Ce scénario orchestre la création d\'une
  demande officielle d\'acte en ligne jusqu\'à la génération automatique
  et au téléchargement du document PDF associé.

- Communication : Il représente la publication de messages sur le forum,
  un espace dédié à la coordination et à l\'entraide entre les
  différents districts.

Vision Système : L\'ensemble de ce diagramme permet de visualiser
précisément le rôle pivot des contrôleurs applicatifs et du générateur
PDF dans l\'orchestration des tâches logiques après chaque interaction
de l\'agent.

1.  ![](media/image7.svg){width="7.65625in"
    height="6.221527777777778in"}**Diagramme de classes**

> Le diagramme de classes modélise la structure statique du système
> Vision 2035 en définissant les entités de données, les composants
> logiques et leurs interactions. La transition entre les
> fonctionnalités du système et sa représentation en classes répond à
> des règles strictes de conception logicielle :

- La matérialisation des cas d\'utilisation en structures : Les
  fonctionnalités telles que « Demander un acte » ou « Générer un PDF »
  ne se traduisent pas par des classes d\'actions isolées. La demande
  d\'acte est découpée entre une entité de persistance (Demande_Acte)
  stockant les attributs en base de données (statut, type, dates), et un
  composant logique (DemandeController) qui expose les méthodes
  d\'exécution. La génération PDF est entièrement portée par un
  composant utilitaire de la couche service (PDFGenerator), sollicité
  dynamiquement par l\' ActeController.

- L\'organisation de la couche de persistance : Les entités principales
  de la base de données relationnelle (Utilisateur, Citoyen, Acte,
  Localite, Synchro_File et systeme_log) reprennent scrupuleusement la
  structure et les clés étrangères définies dans le modèle physique. La
  gestion de la parenté est assurée par la table d\'association
  Lien_Parente, qui relie les citoyens entre eux de manière réflexive.

- L\'intégration des structures de données et algorithmes : Le diagramme
  met en évidence le couplage entre les contrôleurs métiers et les
  modules algorithmiques avancés. Le CitoyenController s\'appuie
  directement sur l\'arbre AVL (AVLTree) pour l\'indexation, sur
  l\'arbre numérique (Trie) pour l\'auto-complétion des champs, sur la
  structure UnionFind pour la vérification de la cohérence des liens de
  parenté, et sur l\'algorithme de BoyerMoore pour optimiser les
  performances de recherche textuelle.

Vision Système : Cette modélisation respecte rigoureusement le patron de
conception Modèle-Vue-Contrôleur (MVC) et le principe de séparation des
responsabilités. Elle démontre comment chaque exigence fonctionnelle est
convertie en structures de données tangibles et en traitements
applicatifs stables, garantissant la robustesse de l\'application lors
de sa phase d\'implémentation.

**RÉALISATION**

1.  **Technologies utilisées**

Le développement de la Plateforme Nationale d\'Identité Civile Numérique
(Vision 2035) repose sur une architecture moderne de type SPA (Single
Page Application) découplée, s\'appuyant sur un modèle Client-Serveur.
Le choix de chaque technologie a été rigoureusement dicté par les
exigences de performance, d\'intégrité des données et de tolérance aux
pannes réseau en milieu rural.

###  Environnement Backend (Serveur et Logique Métier)

- **Langage : Python 3.12**

  - Raison du choix : Python a été sélectionné pour sa maturité, sa
    syntaxe expressive et sa gestion native avancée des structures de
    données (listes, dictionnaires, typage statique optionnel). Elle
    offre des optimisations majeures de performance au niveau de
    l\'interpréteur.

- **Framework : FastAPI**

  - Raison du choix : FastAPI est un framework web moderne et
    ultra-performant, basé sur les standards ouverts OpenAPI et JSON
    Schema permettant de gérer des milliers de requêtes simultanées avec
    une empreinte mémoire minimale.

###  Environnement Frontend (Interface Utilisateur)

- **Framework Interface : React.js**

  - Raison du choix : Pour offrir une expérience utilisateur fluide aux
    agents de saisie et aux citoyens, React.js s\'impose par son
    architecture basée sur des composants réutilisables et son mécanisme
    de Virtual DOM. Ce dernier optimise les mises à jour graphiques en
    temps réel, un atout clé pour l\'affichage instantané des résultats
    lors des requêtes d\'auto-complétion (Radix Trie) ou de recherche
    textuelle (Boyer-Moore).

- **Gestion Locale de la Persistance : JavaScript LocalStorage**

  - Raison du choix : Afin de répondre à la contrainte critique de
    connectivité intermittente dans les zones rurales de Madagascar,
    l\'environnement Frontend intègre une file de synchronisation
    (Synchro_File) codée en JavaScript. Elle permet d\'intercepter, de
    stocker localement les données au format JSON en mode déconnecté
    (Offline), puis de sérialiser leur envoi vers le serveur dès le
    retour de la connectivité (Online).

### 

### Système de Gestion de Base de Données

- **MySQL**

  - Raison du choix : La gestion de l\'état civil exige un respect
    strict des propriétés ACID (Atomicité, Cohérence, Isolation,
    Durabilité). MySQL a été choisi pour sa robustesse transactionnelle
    et son moteur de stockage InnoDB, qui assure une gestion parfaite
    des clés étrangères et des contraintes d\'intégrité (notamment pour
    les tables à relations complexes comme Citoyen, Acte et la table
    pivot de parenté Lien_Parente).

###  Protocoles d\'Échange et Outils de Développement

- **Architecture de Communication : API REST/ JSON**

  - Raison du choix : L\'utilisation de services Web REST garantit une
    séparation totale entre le Frontend et le Backend. Les données sont
    échangées exclusivement sous la forme d\'objets standardisés JSON
    (JavaScript Object Notation), minimisant la bande passante réseau
    consommée, ce qui est crucial pour les infrastructures réseaux
    limitées des districts éloignés.

- **Modélisation et Conception : UML (Unified Modeling Language)**

  - Raison du choix : UML a été employé à travers des outils de
    conception (tel que Draw.io) pour formaliser la structure statique
    (Diagramme de classes) et la dynamique (Diagrammes de cas
    d\'utilisation et de séquence) du système. Cette approche
    méthodologique a sécurisé la phase de codage en établissant une
    correspondance exacte entre le schéma relationnel SQL et les
    structures objets de l\'application.

2.  **Structure des dossiers**

Coté Backend :

![](media/image5.png){width="1.9895833333333333in"
height="5.3125in"}![](media/image6.png){width="1.9583333333333333in"
height="5.135416666666667in"}

L\'examen des captures d\'écran de notre espace de travail met en
évidence une implémentation logicielle modulaire et ordonnée. Les
dossiers sont structurés de manière à séparer les concepts de
persistance, de traitement métier et d\'optimisation :

- Le dossier controllers : Il isole parfaitement la logique applicative
  à travers des fichiers dédiés pour chaque domaine d\'activité
  (acte_controller.py, citoyen_controller.py, etc.). On y remarque la
  présence d\'un auth_controller.py indispensable pour centraliser
  l\'authentification sécurisée des agents de saisie, ainsi qu\'un
  sync_controller.py qui traite les requêtes issues des files d\'attente
  asynchrones.

- Le dossier models : Les fichiers de ce dossier calquent rigoureusement
  l\'organisation de notre base de données relationnelle SQL. À noter la
  présence fine de file_synchronisation.py (qui correspond à notre table
  Synchro_File) et de systeme_log.py, indispensables à la traçabilité et
  à la gestion de la tolérance aux pannes réseau.

- Le dossier structures : C\'est le point fort de notre architecture. Il
  regroupe l\'ensemble des algorithmes personnalisés exigés par notre
  cahier des charges (avl.py, boyer_moore.py, trie.py, union_find.py).
  L\'isolement de ces fichiers au sein d\'un répertoire indépendant
  démontre au jury que l\'implémentation de ces structures complexes
  s\'est faite \"à la main\", de manière pure, découplée des frameworks
  web tiers.

- Le dossier utils : Il accueille le service technique transverse
  pdf_generator.py. Ce choix de conception confirme que la génération de
  documents officiels est traitée comme un utilitaire applicatif qui
  transforme dynamiquement les modèles textuels en fichiers binaires
  exportables, sans charger la base de données.

Coté Frontend :

![](media/image7.png){width="2.15625in"
height="5.9375in"}![](media/image8.png){width="2.15625in"
height="5.5625in"}

L\'architecture de la partie cliente témoigne d\'une volonté
d\'accessibilité multi-support. L\'application dissocie l\'interface
d\'administration lourde (Web) et l\'outil de terrain destiné aux agents
de saisie itinérants (Mobile) :

- Le dossier frontend (Application Web - Vite / Tailwind CSS) :
  L\'utilisation combinée de Vite.js (via vite.config.js) et de Tailwind
  CSS (tailwind.config.js) garantit un environnement de développement
  ultra-rapide et une interface web hautement réactive. La présence du
  dossier src montre une structuration modulaire des composants, appuyée
  par des hooks personnalisés (hooks) et des couches de requêtes d\'API
  (services) pour communiquer de manière asynchrone avec le backend.

- Le dossier mobile (Application Mobile - Expo / React Native) : C\'est
  l\'atout stratégique du projet pour répondre aux contraintes du milieu
  rural à Madagascar. Basé sur l\'écosystème Expo (identifiable par
  .expo et metro.config.js), il utilise le système de routage moderne
  basé sur les fichiers (Expo Router) au sein du répertoire app. Chaque
  fichier correspond directement à un écran de l\'application : login.js
  pour l\'authentification, citoyens.js et actes.js pour la gestion
  d\'état civil, et surtout optimisation.js, qui pilote localement les
  structures légères et la file d\'attente pour le mode déconnecté.

- La racine du projet et les documents d\'analyse : On note la présence
  à la racine du fichier de configuration global app.json propre aux
  applications mobiles managées, ainsi que le document de cadrage
  CDC_SE20240200L2SIO01.docx (Cahier des Charges). Cela prouve une
  parfaite traçabilité entre les exigences initiales et l\'arborescence
  technique finale.

3.  **Structure de la base de données**

![](media/image9.png){width="4.708333333333333in" height="1.84375in"}

Cet extrait SQL montre la création de la table localite, traduisant
fidèlement la classe spécifiée sur le diagramme global :

- Optimisation des types : L\'usage de types VARCHAR de dimensions
  adaptées évite la perte de données tout en limitant l\'espace de
  stockage.

- Clé primaire unique : Le mécanisme INT AUTO_INCREMENT assure un
  identifiant unique immuable, indispensable pour la performance des
  futures jointures relationnelles.

- Intégrité InnoDB : Le choix du moteur InnoDB garantit le respect des
  propriétés ACID et prend en charge nativement les contraintes de clés
  étrangères requises par l\'architecture.

![](media/image10.png){width="6.3in" height="2.4854166666666666in"}

Cet extrait SQL matérialise la création de la table Citoyen, assurant la
persistance de la classe centrale du diagramme global :

- Unicité et traçabilité : L\'usage de numero_cin VARCHAR(20) UNIQUE
  garantit l\'identité numérique exclusive de chaque individu.

- Respect des contraintes métier : Les types adaptés comme DATE, CHAR(1)
  pour le sexe et BOOLEAN pour l\'état civil optimisent le stockage de
  chaque profil.

- Lien relationnel fort : La contrainte CONSTRAINT fk_cit_loc lie de
  façon intègre le citoyen à sa localite de rattachement sous le moteur
  transactionnel InnoDB

![](media/image11.png){width="5.166666666666667in"
height="5.635416666666667in"}

Cet extrait de script SQL concrétise l\'implémentation des tables de
suivi et de sécurité de l\'application, en parfaite cohérence avec le
diagramme de classes :

- Table acte : Assure la traçabilité des pièces officielles. L\'attribut
  date_registrement utilise le mécanisme DATETIME DEFAULT
  CURRENT_TIMESTAMP pour figer automatiquement et de manière immuable
  l\'instant exact de l\'inscription en base de données.

- Table utilisateur : Gère les accès au système. L\'attribut
  mot_de_passe est dimensionné en VARCHAR(255) afin d\'accueillir en
  toute sécurité les empreintes textuelles générées par les algorithmes
  de hachage robustes (comme Bcrypt), interdisant tout stockage en
  clair.

- Table systeme_log : Garantit l\'auditabilité de la plateforme.
  L\'utilisation du type TEXT pour l\'attribut details permet
  d\'enregistrer des rapports d\'activité contextuels complets sous le
  moteur transactionnel sécurisé InnoDB.

![](media/image12.png){width="6.595833333333333in"
height="2.2840277777777778in"}![](media/image13.png){width="6.177083333333333in"
height="1.8020833333333333in"}

Ces deux extraits de script SQL concrétisent l\'implémentation des
mécanismes avancés de gestion des relations et de résilience réseau de
l\'application :

- Table Lien_Parente (Gestion généalogique) : Cette table pivot utilise
  des clés étrangères croisées (id_parent, id_enfant) vers la table
  Citoyen pour briser la relation Plusieurs-à-Plusieurs. Elle sert de
  support physique à l\'algorithme Union-Find pour interdire la création
  de cycles généalogiques incohérents.

- Table Synchro_File (Gestion du mode hors-ligne) : Véritable pilier de
  la tolérance aux pannes réseau, elle utilise le type TEXT pour
  l\'attribut donnees_json afin d\'encapsuler de manière flexible les
  flux d\'état civil saisis sur le terrain. Les champs statut et
  priorite permettent au backend d\'ordonnancer automatiquement leur
  traitement lors de la reconnexion.

**\**

**RESULTATS**

1.  **Résultats obtenus**

> Cette section présente les résultats concrets de l\'implémentation du
> système Vision 2035 à travers les trois scénarios métiers les plus
> critiques. Chaque scénario illustre l\'interaction entre l\'interface
> utilisateur (Web/Mobile), la logique applicative et les performances
> algorithmiques associées.

1.  **Scénario 1 :** Authentification sécurisée et Tableau de bord
    sectorisé (Web)

- Description du scénario : L'officier d'état civil accède à son espace
  personnel sur la plateforme web centrale (Registre National Numérique
  • République de Madagascar). Une fois authentifié, le système charge
  l\'interface de gestion de son compte, valide son rôle applicatif et
  verrouille dynamiquement ses privilèges de traitement en fonction de
  son affectation géographique.

<!-- -->

- Capture d\'écran correspondante :

![](media/image14.png){width="3.9375in" height="2.9in"}

> Explication technique du scénario : La capture d\'écran ci-dessus
> illustre la réussite du processus d\'authentification et l\'affichage
> de l\'écran « MON COMPTE » pour un profil de test nommé officier_test.

Sur le plan architectural, ce scénario valide plusieurs couches de
sécurité et de persistance :

- Vérification des accès : Lors de la soumission du formulaire de
  connexion, la couche Frontend (React.js) interroge l\'API
  auth_controller.py côté Backend. Le système compare de manière
  asynchrone les identifiants saisis avec l\'empreinte chiffrée stockée
  dans le champ mot_de_passe (dimensionné en VARCHAR(255) dans la table
  utilisateur).

- Contrôle d\'accès basé sur les rôles : L\'interface affiche clairement
  le badge AGENT sous la section Rôle Système. Cette donnée provient
  directement de l\'attribut role de la table utilisateur. Elle permet à
  l\'application d\'adapter les menus pour restreindre l\'accès aux
  seules fonctionnalités de saisie et de validation des actes d\'état
  civil, bloquant les menus de configuration globale réservés à
  l\'administrateur.

- Sectorisation territoriale : Le système extrait la clé étrangère
  id_localite associée au compte de l\'agent. Bien que le profil de test
  indique un identifiant non lié pour cette simulation, cette relation
  maîtresse avec la table localite est celle qui filtre au niveau du
  serveur toutes les requêtes SQL descendantes. Elle garantit ainsi
  qu\'un officier d\'état civil ne puisse ni consulter ni manipuler les
  registres de citoyens extérieurs à sa zone géographique de compétence.

1.  **Scénario 2 :** Enregistrement d\'un citoyen sur l\'interface
    mobile

- Description du scénario : Un agent de saisie itinérant utilise
  l\'application mobile (Expo / React Native) pour procéder à
  l\'enrôlement d\'un citoyen. Ce scénario simule la création d\'une
  identité numérique complète en renseignant les informations d\'état
  civil, le numéro de CIN unique et les critères biométriques de base
  (sexe, statut vital).

- Capture d\'écran correspondante :

![](media/image15.png){width="2.5104166666666665in"
height="2.477777777777778in"}

- Explication technique du scénario : L\'écran « Nouveau Citoyen »
  illustre la transition directe entre l\'interface utilisateur et la
  couche de persistance relationnelle définie dans le script SQL :

  - Validation de l\'unicité : Lors de la saisie du champ « 302038044281
    » (Numéro CIN), le système prépare une requête vers la table
    Citoyen. Grâce à la contrainte UNIQUE sur l\'attribut numero_cin, le
    moteur InnoDB garantit qu\'aucune identité en doublon ne pourra être
    insérée dans le registre national, même en cas de tentatives
    multiples.

  - Optimisation par l\'algorithme Trie : Le champ « Lieu de naissance »
    (ici Antananarivo) est couplé à la structure de données Trie (Arbre
    de préfixes) isolée dans structures/trie.py. À chaque lettre saisie
    par l\'agent, l\'algorithme parcourt l\'arborescence des localités
    pour proposer une auto-complétion instantanée, réduisant ainsi les
    erreurs de saisie manuelles.

  - Intégrité des types de données : Les composants graphiques
    (sélecteur de date pour date_naissance, bouton bascule pour
    est_vivant et boutons de choix pour le sexe) forcent la saisie de
    données conformes aux types DATE, BOOLEAN et CHAR(1) définis en base
    de données.

  - Soumission asynchrone : Au clic sur le bouton Enregistrer, les
    données sont sérialisées en JSON et transmises au CitoyenController
    via une requête POST. En cas d\'absence de réseau, les données sont
    automatiquement poussées dans la file d\'attente de la table
    Synchro_File pour un traitement ultérieur.

  1.  **Scénario 3 :** Enregistrement d'actes et gestion de la file de
      synchronisation (Mode Offline)

<!-- -->

- Description du scénario : Face à une coupure ou une absence totale de
  connectivité Internet sur le terrain, l'agent saisit et enregistre un
  nouvel acte depuis son terminal mobile. L\'application bascule
  automatiquement en mode déconnecté (Offline) : elle valide localement
  la conformité des données, les stocke en mémoire locale sécurisée, et
  génère une alerte visuelle interactive permettant de relancer la
  synchronisation transactionnelle vers la base centrale dès le retour
  du réseau.

- Capture d\'écran correspondante :

![](media/image16.png){width="4.747916666666667in"
height="6.697916666666667in"}\
Explication technique du scénario : La capture d\'écran de l\'interface
« Registre des Actes » met en évidence le fonctionnement en tâche de
fond du mécanisme de persistance locale :

- Interception et Alerte Visuelle : L'apparition du bandeau jaune
  d\'avertissement « 1 acte(s) en attente de synchro. Tapotez pour
  réessayer. » démontre que la couche réseau a intercepté l\'échec de la
  requête HTTP POST vers l\'API FastAPI. Au lieu de bloquer l\'agent ou
  de perdre la saisie, l\'application a isolé le flux d\'informations.

- Sérialisation et File d\'Attente JSON : L\'acte non transmis est
  sérialisé sous forme d\'objet JSON et empilé localement dans le
  stockage persistant du smartphone via le module AsyncStorage. Cette
  file d\'attente locale correspond à la structure déconnectée
  temporaire qui alimentera la table globale Synchro_File du système.

- Indépendance des Registres Locaux : Comme illustré dans la liste, les
  actes déjà présents ou récupérés lors de la dernière connexion (tels
  que les actes de NAISSANCE ou de DECES) restent parfaitement
  consultables en cache local par l\'officier, garantissant une
  continuité complète du service public sur le terrain.

- Déclenchement Manuel ou Automatique : En « tapotant » sur le bandeau
  d\'alerte ou dès que le module NetInfo détecte le retour d\'un signal
  stable, le script de synchronisation parcourt la file locale à
  l\'envers, dépile l\'acte en attente et l\'envoie au serveur central
  qui l\'insère de manière sécurisée dans la base de données MySQL.

2.  **Perspectives d'amélioration**

Bien que la plateforme Vision 2035 réponde rigoureusement aux exigences
fonctionnelles et algorithmiques imposées par le cahier des charges,
plusieurs axes d'évolution technologique peuvent être envisagés pour
anticiper un déploiement à l\'échelle nationale.

1.  **Amélioration 1 : Optimisation des performances par l\'archivage
    historique des données (Gestion de la Base de Données)**

- Proposition d\'amélioration : À l\'horizon 2035, avec des millions de
  citoyens enregistrés, la table principale contenant les citoyens et
  leurs actes va devenir extrêmement lourde, ce qui risque de ralentir
  les recherches quotidiennes des agents. L\'amélioration consiste à
  mettre en place un système d\'archivage automatique pour séparer les
  données actives (les citoyens vivants et les actes récents) des
  données historiques (les personnes décédées ou les vieux actes
  modifiés).

- Impact attendu : En partitionnant ou en déplaçant les anciennes
  données vers une table d\'archive, on réduit considérablement le
  volume de la table principale. Les requêtes de recherche SQL
  quotidiennes s\'exécuteront beaucoup plus rapidement pour les agents
  de saisie, et le serveur consommera beaucoup moins de mémoire vive,
  garantissant la fluidité du système même après plusieurs années
  d\'existence.

**2.2. Amélioration 2 : Intégration d\'un module d\'analyse
démographique prédictif (Nouvelle fonctionnalité)**

- Proposition d\'amélioration : L\'objectif est d\'adjoindre au tableau
  de bord central de l\'administration un moteur d\'analyse prédictive.
  En exploitant l\'historique des flux d\'état civil (taux de natalité,
  de mortalité et flux migratoires inter-districts) enregistrés en base
  de données, ce module permettrait de projeter les courbes
  démographiques par commune.

- Impact attendu : Cela offrirait aux décideurs publics et aux
  ministères un outil d\'aide à la décision statistique précieux pour
  anticiper les infrastructures nécessaires (construction d\'écoles,
  centres de santé, allocation de budgets) selon l\'évolution réelle de
  la population de chaque localité.

**2.3. Amélioration 3 : Refonte de l\'IHM avec un mode sombre natif et
accessibilité accrue (Amélioration de l\'IHM)**

- Proposition d\'amélioration : Cette perspective vise à moderniser
  l\'interface utilisateur (Web et Mobile) en intégrant un système de
  thémisation dynamique (Mode Sombre / Mode Clair) géré par Tailwind
  CSS, ainsi que des fonctionnalités d\'accessibilité conformes aux
  normes WCAG (taille des polices adaptative, contrastes élevés,
  compatibilité avec les lecteurs d\'écran).

- Impact attendu : Le mode sombre réduira considérablement la fatigue
  visuelle des officiers d\'état civil et des agents de saisie qui
  passent de longues heures sur les écrans. De plus, une meilleure
  gestion des contrastes et de l\'accessibilité garantira une
  utilisation fluide de la plateforme par tous les agents, quelles que
  soient leurs conditions de travail sur le terrain.

**CONCLUSION**

La réalisation de ce projet transversal dédié à la conception de la
Plateforme Nationale d'Identité Civile Numérique (Vision 2035) a été une
étape très enrichissante de ma formation en deuxième année de SIO. Ce
travail m\'a permis d\'associer la théorie apprise en cours à la
pratique en construisant une application complète, sécurisée et adaptée
aux réalités du terrain.

Ce projet m\'a poussée à faire des recherches par moi-même et à
développer de nouvelles compétences, tant techniques que personnelles.
D\'abord, la logique et la programmation pure : développer des
algorithmes complexes comme l\'arbre AVL pour classer les données, le
Trie pour l\'auto-complétion ou l\'Union-Find pour les liens de parenté,
le tout de manière native et sans utiliser de fonctions toutes faites, a
renforcé ma logique de programmation et m\'a appris à écrire un code
plus propre, plus rapide et plus économe en mémoire. Ensuite, la
maîtrise du développement multi-support : c\'était un vrai défi de faire
communiquer un serveur (FastAPI) avec une application Web (React.js) et
une application mobile (Expo / React Native). Apprendre à gérer le mode
hors-ligne en stockant temporairement les données dans le téléphone
avant de les envoyer au serveur m\'a permis de comprendre comment rendre
une application fiable, même sans connexion Internet stable. Enfin, la
rigueur en base de données et système : travailler sur Linux pour
configurer mon environnement et concevoir une base de données MySQL
solide avec des contraintes strictes (moteur InnoDB, clés étrangères,
champs uniques) m\'a appris à quel point la structure des données est
importante pour éviter les erreurs et les doublons. Sur le plan
personnel, j\'ai appris à mieux organiser mon temps, à respecter un
cahier des charges précis et à trouver des solutions de manière autonome
face aux bugs et aux difficultés techniques.

Ce projet est un excellent tremplin pour mon avenir professionnel. En
tant que future informaticienne, la création d\'une architecture
découpée (séparation claire entre le Backend et le Frontend), la
sécurisation des formulaires (hachage des mots de passe) et
l\'optimisation des requêtes SQL sont des compétences clés directement
recherchées en entreprise. Savoir concevoir un système capable de gérer
des données aussi importantes que l\'état civil me donne une base solide
et la confiance nécessaire pour aborder de futurs projets professionnels
plus ambitieux.

Pour conclure, la plateforme Vision 2035 propose une solution moderne et
efficace pour centraliser et protéger l\'identité civile à Madagascar,
tout en restant utilisable dans les zones isolées grâce au mode
hors-ligne. Cependant, la technologie évolue très vite. À l\'avenir,
comment pourrions-nous intégrer des technologies de reconnaissance
biométrique encore plus poussées (comme les empreintes digitales ou la
reconnaissance faciale) directement dans l\'application mobile pour
sécuriser encore plus l\'identité des citoyens, tout en respectant la
confidentialité de leurs données personnelles ?

**BIBLIOGRAPHIE**

I. Cours présentiels

- Enseignante de UML (2025-2026) : Madame ANDRIAMANANJARA, SIO L2, École
  Supérieure de Management et d\'Informatique Appliquée.

- Enseignant en langage Python(2025-2026) : Monsieur RANDRIAPARAZATO,
  SIO L2, École Supérieure de Management et d\'Informatique Appliquée.

- Enseignant en programmation et gestion de projet
  informatique(2025-2026) : Monsieur RAZAFINDRAIBE, SIO L2, École
  Supérieure de Management et d\'Informatique Appliquée.

### II. Recherches personnelles et exercices

- Cahier d\'exercices personnels : Implémentation native des algorithmes
  AVL, Trie et Union-Find en Python.

- Projet personnel de programmation : Gestion de la file d\'attente JSON
  pour le mode hors-ligne.

### IV. Tutoriels YouTube

- Codeur Caméléon. (2024). Comprendre et implémenter les structures de
  données et algorithmes avancés \[Vidéo\]. YouTube.

- Programming with Mosh. (2023). FastAPI and React Full-Stack Course
  \[Vidéo\]. YouTube.

**ANNEXE**

> **ANNEXE A : Questionnaire**

1\. Quels sont les problèmes rencontrés dans la gestion actuelle de
l'état civil ?\
2. Combien de temps prend la recherche d'un acte papier ?\
3. Quels types de fraudes sont les plus fréquents ?\
4. Les agents disposent-ils d'une connexion internet stable ?\
5. Quelles informations doivent être protégées ?\
6. Quels utilisateurs auront accès au système ?

> **ANNEXE B : Extraits de code**
>
> La structure AVL :
>
> ![](media/image17.png){width="5.90625in" height="4.876388888888889in"}

![](media/image18.png){width="6.3in"
height="5.202083333333333in"}![](media/image19.png){width="5.88125in"
height="4.85625in"}

![](media/image20.png){width="4.791666666666667in" height="1.6875in"}

**La structure de Boyer-Moore :**

![](media/image21.png){width="5.885416666666667in"
height="5.614583333333333in"}

![](media/image22.png){width="6.177083333333333in"
height="4.739583333333333in"}

La structure du Trie :

![](media/image23.png){width="5.2340277777777775in"
height="5.122916666666667in"}![](media/image24.png){width="6.3in"
height="3.8618055555555557in"}

La structure de Union-Find :

![](media/image25.png){width="5.291666666666667in"
height="5.145833333333333in"}![](media/image26.png){width="5.15625in"
height="2.96875in"}

**TABLE DES MATIERES**

**SOMMAIRE.................................................................................\...00**

**RÉSUMÉ........................................................................................01**

**ABSTRACT....................................................................................02**

**INTRODUCTION
GÉNÉRALE...........................................................03**

**PARTIE I : ANALYSE ET CONCEPTION DU SYSTÈME**

**1. Analyse des
besoins..................................................................04**

**2. Fonctionnalités à
implémenter....................................................04**

**3. Modélisation du système
(UML)..................................................05**

**PARTIE II : ARCHITECTURE TECHNIQUE ET RÉALISATION**

**1. Technologies
utilisées............................................................\....10**

**2. Structure des dossiers
(Arborescence)..........................................12**

**3. Structure de la base de données
(SQL).......................................\...15**

### PARTIE III : RÉSULTATS EXPÉRIMENTAUX ET PERSPECTIVES

1.  Scénarios d\'utilisation et résultats
    obtenus**................................19**

<!-- -->

2.  Perspectives
    d'amélioration**................................................24**

**CONCLUSION
GÉNÉRALE.............................................................26**

**BIBLIOGRAPHIE........................................................................\...27**

**ANNEXES**

- ANNEXE A : Questionnaire
  terrain**.............................................\...28**

- ANNEXE B : Extraits de code source
  (Algorithmes)**...........................28**
