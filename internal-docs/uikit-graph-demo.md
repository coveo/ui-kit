# GraphRAG dans UI-Kit
VOir si je pouvais ajouter Graphe de Connaissance (Knowledge Graph) couplé à un mécanisme de Retrieval-Augmented-Generation (RAG) pour permettre à l'AI de mieux raisonner sur le repo ui-kit. d'autant plus qu'il risque de continuer à grossir

## Partie 1 : Le « Pourquoi » (2 minutes)

### Le Problème que Nous Résolvons

Chaque fois qu'on fait donne des requêtes à qui exigent de traverser plusieurs couches de profondeurs qui contiennent énormément de relation, le pure LLM a ses limites. Par exemple

- *« If I modify `executeSearch` action, what's the full blast radius ? »*
- *« If I deprecate `buildSearchBox`, what breaks? »*

### Pourquoi Ne Pas Simplement Demander à Claude/Opus ?

Les modèles avancé comme Cloud Opus vont arriver à une réponse presque similaire. Mais pour ça le model doit lire tous les fichiers concernés dans le repo

Approche LLM:
Cout: Énorme (consomme plus de token)
latence: minutes
Risque: Peut se perdre au milieu avec le context qui grandit. Et il risque d'oublier des élémnts

Approche GraphRAG:
L'agent execute des requetes spécifiques à la database
Cost: Coute moins de token
Latency: millisecondes, secondes.
Resultat: deterministe.

---

## Partie 2 : Qu'est-ce que ce Graphe ? (1 minute)
### Comment C'est Construit

Run un script qui analyse le code source en utilisant l'AST TypeScript (ts-morph) et qui creer
1. **Les Nœuds** sont créés pour : components, controllers, Actions, Reducers, Packages, samples
2. **Les Relations** sont créées basées sur : imports, décorateurs, appels dispatch, handlers de reducers


3. **Requêtes via MCP** - Ajout du MCP dans UI kit


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


### Démo 5 : Couplage de Composants

**Question :** *« Quels composants sont architecturalement similaires ? »*

```cypher
MATCH (c1:Component)-[:CONSUMES]->(ctrl:Controller)<-[:CONSUMES]-(c2:Component)
WHERE c1.tag < c2.tag
WITH c1.tag as comp1, c2.tag as comp2, count(ctrl) as shared
WHERE shared >= 3
RETURN comp1, comp2, shared
ORDER BY shared DESC
LIMIT 5
```

| Composant 1 | Composant 2 | Contrôleurs Partagés |
|-------------|-------------|---------------------|
| atomic-numeric-facet | atomic-rating-range-facet | 7 |
| atomic-color-facet | atomic-segmented-facet | 6 |
| atomic-facet | atomic-segmented-facet | 6 |

**Insight :** Ces paires de composants partagent une logique significative. Refactoriser l'un ? Vérifiez l'autre.

---

## Référence Rapide

### Quand Utiliser le Graphe

| Situation | Utiliser le Graphe ? |
|-----------|---------------------|
| Trouver une chaîne dans les fichiers | Non, utilisez grep |
| Trouver une définition de fonction | Non, utilisez LSP |
| **Compter tous les usages de X** | **Oui** |
| **Tracer Composant → Contrôleur → Action → Reducer** | **Oui** |
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

Skip avec precision les tests qui ne sont pas affectés utilisant un approach par graph avec plus de granularité de TUrbo repo. TurboRepo opère sur un niveau des packages alors qu'avec un system avec un systeme. il se base sur le hashage des fichiers mais il a pas la compréhension sémantique pour savoir pourquoi un fichier a changé.

En ce moment, ya un script pour determiner la selection de test en fonction des fichiers changé mais c'est un peu bobche. 
Scenario: You change a documentation file in headless.

Turborepo (Standard): Sees a file change in the package inputs -> Invalidates cache -> Rebuilds Headless -> Rebuilds Atomic -> Rebuilds Samples. Waste of compute.

Epsilon (Predictive): The Agent queries the Graph: "Does any code depend on README.md?" The answer is No. The Agent then instructs the CI pipeline to skip the atomic and sample build stages entirely for this PR.

<!-- ### Analogie avec Turborepo ?

| Outil | Ce qu'il Sait | Ce qu'il Ne Sait Pas |
|------|---------------|---------------------|
| **Turborepo** | Package A dépend de Package B | Quels *composants* utilisent quels *contrôleurs* |
| **Turborepo** | Ordre de build | Quelles *actions* affectent quels *reducers* |

**Turborepo opère au niveau des packages. Notre graphe opère au niveau du code.**

Turborepo dit : *« atomic dépend de headless »*
Notre graphe dit : *« atomic-search-box utilise le contrôleur SearchBox qui dispatche executeSearch qui affecte 25 reducers »* -->