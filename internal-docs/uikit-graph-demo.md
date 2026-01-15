# GraphRAG dans UI-Kit
Voir si je pouvais ajouter Graphe de Connaissance (Knowledge Graph) couplé à un mécanisme de Retrieval-Augmented-Generation (RAG) pour permettre à l'AI de mieux raisonner sur le repo ui-kit. d'autant plus qu'il risque de continuer à grossir et que l'agent n'est pas tous les fichiers en context.


## Partie 1 : Le « Pourquoi » (2 minutes)

### Le Problème que Nous Résolvons

Chaque fois qu'on fait des requêtes qui exigent de traverser plusieurs couches de profondeurs (ou qui contiennent bcp de relations), du genre

- *« If I modify `executeSearch` action, what's the full blast radius ? »*
- *« If I deprecate `buildSearchBox`, what breaks? »*

C'est sure que
### Pourquoi Ne Pas Simplement Demander à Claude/Opus ?

Les modèles avancé comme Cloud Opus vont arriver à une réponse acceptable. Mais pour ça le model doit lire tous les fichiers concernés dans le repo et la reponse est pas deterministe. 

en plus:
Cout: Énorme (consomme plus de token)
latence: minutes
Risque: Peut se perdre au milieu avec le context qui grossis. Et il risque d'oublier des élémnts

Approche GraphRAG:
L'agent execute des requetes spécifiques à la database
Cost: Coute moins de token
Latency: millisecondes, secondes.
Resultat: deterministe.

---
<!-- 
## Partie 2 : Qu'est-ce que ce Graphe ? (1 minute)
### Comment C'est Construit

Run un script qui analyse le code source en utilisant l'AST TypeScript (ts-morph) et qui creer
1. **Les Nœuds** sont créés pour : components, controllers, Actions, Reducers, Packages, samples
2. **Les Relations** sont créées basées sur : imports, décorateurs, appels dispatch, handlers de reducers


3. **Requêtes via MCP** - Ajout du MCP dans UI kit
 -->

---

## Partie 3 : Démos en Direct (7 minutes)

### Démo 1 : Analyse du Rayon d'Impact

**Question :** *« If I modify `executeSearch` action, what's the full blast radius»*

**Sans graphe :** L'agent passe 2+ minutes à essentiellement executer des commandes grep et de filtrage. Il rate des contrôleurs, donne une réponse incomplète.

**Avec graphe :** Une seule requête, résultat précis instantané (en quelques secondes).

**Résultat :** Sans le graph, il y avait des controlleurs manquant comme le categoryFacet.

---

### Démo 2 : Impact de Dépréciation

**Question :** *« If I deprecate `buildSearchBox`, what breaks? »*

**Sans graphe (4 minutes) :**
- Trouve les usages directs
- Rate les exemples SSR (pck arrive pas a facilement faire le lien entre buildSearchBox dans headless -> defineSearchbox dans headless -> headless-react -> commerce-react-router )

**Avec graphe (quelque secondes) :**
- Trouve tous les usages + les exemples SSR qui casseraient
- Liste les reducers qui ne seraient plus dispatchés

**Découverte bonus :** `samples/headless-ssr/commerce-react-router/` casserait - quelque chose que grep a raté !

---

### Démo 3 : Trouver du Code Mort

**Question :** *« Quelles actions sont dispatchées mais jamais gérées par aucun reducer ? »*

**Orphelins trouvés :**
| Action | Dispatchers |
|--------|-------------|
| `executeToggleRangeFacetSelect` | (action dispatché mais qui fait rien) |
| `executeToggleRangeFacetExclude` | (action dispatché mais qui fait rien) |
| `unregisterQuerySuggest` | (le reducer gere l'action mais elle est jamais dispatché. pas exporté publiquement) |
| `updateSearchAction` | (le reducer gere l'action mais elle est jamais dispatché. pas exporté publiquement) |

---


## Référence Rapide

### Quand Utiliser le Graphe

| Situation | Utiliser le Graphe ? |
|-----------|---------------------|
| Trouver une chaîne dans les fichiers | Non, utilisez grep |
| Trouver une définition de fonction | Non, utilisez LSP |
| **Tracer relation complexe Composant → Contrôleur → Action → Reducer** | **Oui** |
| **Analyse d'impact pour dépréciation** | **Oui** |
| **Trouver les dépendances partagées** | **Oui** |
| **Détecter le code mort/orphelin** | **Oui** |

### Graphe vs LLM vs Grep

| Type de Requête | Grep | LLM | Graphe |
|-----------------|------|-----|--------|
| Recherche de texte simple | Rapide | Lent | Excessif |
| Compter les relations | Manuel | Devine | **Exact** |
| Traversée multi-sauts | Impossible | Sujet aux erreurs | **Natif** |
| Opérations ensemblistes | Impossible | Ne peut pas calculer | **Natif** |
| Détection de cycles | Impossible | Ne peut pas calculer | **Natif** |

---

## Comment L'Utiliser

### Option 1 : Demander à l'Agent IA

L'agent a accès aux outils MCP `uikit-graph` :

```
"Utilise le graphe de connaissances pour trouver ce qui casse si je modifie SearchStatus"
"Trace atomic-search-box vers tous les reducers qu'il affecte"
"Trouve les composants qui partagent 3+ contrôleurs"
```

### Option 2 : Exécuter Cypher Directement

```bash
# Via l'outil MCP
uikit-graph_run_cypher(query: "MATCH (c:Component) RETURN count(c)")

# Ou dans le Navigateur Neo4j (http://localhost:7474)
```

### Option 3 : Utiliser la Compétence

```
/analyzing-architecture
```

---

## The "Killer Feature": Graphe de Connaissance dans le CI

Skip avec precision les tests qui ne sont pas affecté avec plus de granularité de TUrbo repo. TurboRepo opère sur un niveau des packages. il se base sur le hashage des fichiers mais il a pas la compréhension sémantique pour savoir pourquoi un fichier a changé.

Ça fait un bout, j'vais un script pour determiner la selection de test en fonction des fichiers changé mais c'est un peu bobche. 

Scenario: You change a documentation file in headless.

au lieu de rebuilder Rebuilds Headless -> Rebuilds Atomic -> Rebuilds Samples. et runner tous les test pck un fichier dans headless a été touché

Avec un graph: L'agent query le graph et regarde s'il y a une dependance

<!-- ### Analogie avec Turborepo ?

| Outil | Ce qu'il Sait | Ce qu'il Ne Sait Pas |
|------|---------------|---------------------|
| **Turborepo** | Package A dépend de Package B | Quels *composants* utilisent quels *contrôleurs* |
| **Turborepo** | Ordre de build | Quelles *actions* affectent quels *reducers* |

**Turborepo opère au niveau des packages. Notre graphe opère au niveau du code.**

Turborepo dit : *« atomic dépend de headless »*
Notre graphe dit : *« atomic-search-box utilise le contrôleur SearchBox qui dispatche executeSearch qui affecte 25 reducers »* -->

## UI generator using semantic understanding

Dédale , Inventeur, sculpeur, architecte légendaire


@daedalus Construit une search page qui utilise des tabs dont les resulats contiennent quickview.
le 1er Tab montre des pdf. 
le 2e un FAQ avec des smart snippets,
et le 3 Tab, montre du contenu multimedia
Le user doit pouvoir clicker sur des recent queries

avec Daedalus, il a été capable de me generer une search page quand meme solide sans halluciner des component atomic alors que sans le graph, il a eu de la misere a construire 

par example au lieu de `atomic-quickview`, il a écrit
```html
<div class="quickview-button">
    <atomic-result-quickview></atomic-result-quickview>
</div>
```

il a inventer le nouveau component `<atomic-tab-label>`