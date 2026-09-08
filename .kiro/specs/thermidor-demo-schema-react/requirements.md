# Requirements Document

## Introduction

`thermidor-demo-schema-react` crée un nouvel échantillon React situé dans `samples/thermidor/demo-schema-react`, publié sous l'identité privée `@samples/thermidor-demo-schema-react`. Cet échantillon est une copie structurelle de `samples/thermidor/demo-react` (la Référence_Échantillon immutable) refactorisée pour consommer les contrats de contrôleur depuis `@coveo/thermidor-schema` via un rendu contractuel A2-UI v0.9.

L'échantillon démontre le rendu piloté par contrat : les composants (ProductCarousel, Cart) sont rendus à partir de STATE_SNAPSHOT publiés par des Remote Controllers liés aux contrats de contrôleur publiés (product-list, cart) avec leurs ID_Schéma_Canonique. Un catalogue A2-UI local (`A2UI_Catalog`) identifié par `https://schema.thermidor.coveo.com/a2-ui/catalog.json` résout les composants de surface. Les actions contractuelles transitent par le pont d'action du Converse controller unifié.

Cette spécification est la deuxième partie d'un plan en deux étapes :
- Spec 1 (`thermidor-contracts-typescript-build`) : crée `packages/thermidor-schema` avec l'identité `@coveo/thermidor-schema` — déjà complète.
- Spec 2 (CETTE SPEC) : crée l'échantillon consommateur qui dépend de la sortie construite de `packages/thermidor-schema`.

L'échantillon consomme exclusivement la `/dist` de `packages/thermidor-schema`. Il n'importe aucun chemin interne, ne possède pas les schémas, ne modifie pas `demo-react`, ne modifie pas `packages/thermidor-contracts`, ne modifie pas le backend distant et ne modifie pas le protocole A2-UI. La validation utilise Vitest en exécution unique avec des fixtures fixes et aucun test basé sur les propriétés.

## Glossary

- **Échantillon_Demo_Schema_React** : le nouvel échantillon situé dans `samples/thermidor/demo-schema-react` publié sous l'identité privée `@samples/thermidor-demo-schema-react`.
- **Référence_Échantillon** : l'échantillon immutable `samples/thermidor/demo-react` (`@samples/thermidor-demo-react`) servant de source structurelle pour la copie initiale.
- **Package_Thermidor_Schema** : le package `packages/thermidor-schema` publié sous `@coveo/thermidor-schema`, créé par la spec 1.
- **API_Publique_Schema** : l'ensemble des exports de valeur (`CartItemSchema`, `CartControllerContractSchema`, `CartStateSchema`, `ControllerContractsSchema`, `ProductListControllerContractSchema`, `ProductListStateSchema`, `ProductSchema`, `SetItemsPayloadSchema`, `UpdateItemQuantityPayloadSchema`) et de type (`CartItem`, `CartControllerContract`, `CartState`, `ControllerContracts`, `Product`, `ProductListControllerContract`, `ProductListState`, `SetItemsPayload`, `UpdateItemQuantityPayload`) disponibles depuis l'import exact `@coveo/thermidor-schema`. Aucun schéma de props de catalogue (productCarouselPropsSchema, cartPropsSchema) n'est exporté.
- **Sortie_Dist_Schema** : les artéfacts JavaScript et déclarations TypeScript sous `packages/thermidor-schema/dist`.
- **A2UI_Catalog** : le catalogue local de composants A2-UI v0.9 enregistré avec l'identifiant `https://schema.thermidor.coveo.com/a2-ui/catalog.json`.
- **ID_Catalogue_A2UI** : la valeur littérale `https://schema.thermidor.coveo.com/a2-ui/catalog.json` identifiant A2UI_Catalog.
- **Composant_Catalogue** : un composant React enregistré dans A2UI_Catalog qui rend un état de contrôleur validé.
- **Composant_ProductCarousel** : le Composant_Catalogue qui rend l'état du contrôleur product-list.
- **Composant_Cart** : le Composant_Catalogue qui rend l'état du contrôleur cart.
- **Remote_Controller** : un contrôleur distant construit via `buildRemoteController` de `@coveo/thermidor`, lié à un contrat de contrôleur publié.
- **Remote_Controller_ProductList** : le Remote_Controller lié au contrat product-list avec l'ID_Schéma_Canonique `https://schema.thermidor.coveo.com/controllers/product-list.schema.json`.
- **Remote_Controller_Cart** : le Remote_Controller lié au contrat cart avec l'ID_Schéma_Canonique `https://schema.thermidor.coveo.com/controllers/cart.schema.json`.
- **ID_Schéma_Canonique** : la valeur absolue d'identifiant `$id` d'un contrat de contrôleur, utilisée comme discriminateur.
- **STATE_SNAPSHOT** : l'instantané d'état publié par un Remote_Controller représentant l'état courant du contrôleur serveur.
- **Pont_d_Action_Converse** : le mécanisme par lequel les actions contractuelles (setItems, updateItemQuantity) sont soumises via le Converse controller unifié.
- **Converse_Controller_Unifié** : le contrôleur `buildConverseController` de `@coveo/thermidor` qui gère la conversation et les actions.
- **Opération_A2UI** : une opération du protocole A2-UI v0.9 (createSurface, updateComponents, updateDataModel, deleteSurface, actionResponse, replace).
- **Surface_A2UI** : une instance de surface créée par une opération createSurface, identifiée par un surfaceId.
- **Rendu_Contractuel** : le processus de résolution d'un Composant_Catalogue depuis A2UI_Catalog à partir des données de Surface_A2UI.
- **Mock_Converse_API** : le serveur mock local écoutant sur `localhost:3456` qui fournit les réponses Converse pour l'exercice local.
- **Fixture_Mock** : un scénario de réponse fixe servi par Mock_Converse_API pour un prompt donné.
- **Parité_Fonctionnelle** : l'équivalence des comportements observables entre Échantillon_Demo_Schema_React et Référence_Échantillon pour tous les scénarios couverts.
- **Parité_Visuelle** : l'équivalence de la structure DOM, du layout et des styles entre Échantillon_Demo_Schema_React et Référence_Échantillon pour tous les scénarios couverts.
- **Scénario_Couvert** : un scénario fonctionnel pour lequel Parité_Fonctionnelle et Parité_Visuelle sont exigées.
- **Validation_Vitest_Fixe** : une suite Vitest en exécution unique utilisant des fixtures fixes et des résultats attendus déterminés avant l'exécution.
- **Frontière_d_Import** : la contrainte selon laquelle Échantillon_Demo_Schema_React importe les contrats exclusivement depuis `@coveo/thermidor-schema` et non depuis des chemins internes.
- **Porte_Prérequis_Action** : le prérequis matériel selon lequel le pont d'action Converse unifié doit être implémenté avant l'exécution des scénarios d'action.
- **Total_Panier** : la somme calculée localement comme `sum(price × quantity)` pour chaque article validé de l'état du cart.
- **Ingress_Invalide** : une opération A2-UI ou un STATE_SNAPSHOT qui échoue la validation Zod du contrat correspondant.
- **Référence_Pattern_Catalogue** : l'échantillon `samples/thermidor/schema-contract-react` servant de référence architecturale pour l'implémentation du catalogue A2-UI, du hook `useAdvertisedController`, de la construction des Remote Controllers via `buildRemoteController`, et de la structure des renderers de catalogue. Échantillon_Demo_Schema_React ADAPTE ce pattern pour le format v2 de `@coveo/thermidor-schema` : le discriminateur est `controllerSchema` (au lieu de `schemaId` dans v1), les actions sont imbriquées sous le champ `actions` (au lieu d'être au niveau supérieur), et les props schemas de catalogue sont définis localement (au lieu d'être importés depuis le package de contrats).
- **Props_Schema_Local** : un schéma Zod défini localement dans Échantillon_Demo_Schema_React décrivant la forme d'advertisement de contrôleur attendue par chaque Composant_Catalogue (structure `{controllers: {<controllerKey>: {controllerId: string, controllerSchema: <literal>}}}`). Ces schémas ne sont PAS exportés par `@coveo/thermidor-schema` et doivent être créés dans l'échantillon.
- **Discriminateur_V2** : le champ `controllerSchema` utilisé comme discriminateur dans le type `ControllerContracts` de `@coveo/thermidor-schema`, remplaçant le champ `schemaId` utilisé dans l'ancienne version `@coveo/thermidor-contracts`.
- **Actions_Imbriquées** : dans le format v2 de `@coveo/thermidor-schema`, les actions du contrôleur sont accessibles via `contract.actions.<actionName>.payload` au lieu d'être au niveau supérieur du contrat (`contract.<actionName>`).

## Requirements

### Exigence 1 : prérequis et copie isolée depuis demo-react

**User Story :** En tant que mainteneur de Thermidor, je veux créer un échantillon isolé par duplication de demo-react, afin que le nouvel échantillon contractuel n'altère pas la référence existante et que ses dépendances soient clairement établies.

#### Critères d'acceptation

1. LORSQUE la création de Échantillon_Demo_Schema_React est initiée, L'Échantillon_Demo_Schema_React DOIT être une copie structurelle de Référence_Échantillon dans le répertoire `samples/thermidor/demo-schema-react`.
2. LE Échantillon_Demo_Schema_React DOIT porter l'identité privée exacte `@samples/thermidor-demo-schema-react` dans son `package.json`.
3. LE Échantillon_Demo_Schema_React DOIT déclarer `@coveo/thermidor-schema` comme dépendance dans son `package.json`.
4. LE Échantillon_Demo_Schema_React DOIT déclarer `@coveo/thermidor` comme dépendance dans son `package.json`.
5. LE Échantillon_Demo_Schema_React DOIT déclarer `zod` comme dépendance dans son `package.json`.
6. LE Échantillon_Demo_Schema_React DOIT exclure `@coveo/thermidor-contracts` de ses dépendances directes et transitives dans son `package.json`.
7. LORSQUE la création est validée, LA Référence_Échantillon DOIT rester inchangée (aucune modification de fichier, dépendance ou configuration dans `samples/thermidor/demo-react`).
8. LORSQUE la création est validée, LE Package_Thermidor_Schema DOIT rester inchangé (aucune modification dans `packages/thermidor-schema`).
9. LORSQUE la création est validée, LE package `packages/thermidor-contracts` DOIT rester inchangé.
10. LE Échantillon_Demo_Schema_React DOIT dépendre de Sortie_Dist_Schema via la résolution workspace de `@coveo/thermidor-schema`.
11. LE Échantillon_Demo_Schema_React DOIT conserver l'absence de module Maven, source Java, ou dépendance Maven.
12. LORSQUE le build de Échantillon_Demo_Schema_React est exécuté, LE build DOIT réussir via `pnpm --filter @samples/thermidor-demo-schema-react build`.
13. LORSQUE les tests de Échantillon_Demo_Schema_React sont exécutés, LES tests DOIVENT réussir via `pnpm --filter @samples/thermidor-demo-schema-react test`.

### Exigence 2 : parité fonctionnelle et visuelle complète de l'expérience

**User Story :** En tant que développeur évaluant la migration vers les contrats, je veux que l'échantillon contractuel produise la même expérience que demo-react, afin que la migration soit transparente pour l'utilisateur final.

#### Critères d'acceptation

1. LE Échantillon_Demo_Schema_React DOIT fournir un EngineProvider identique à celui de Référence_Échantillon.
2. LE Échantillon_Demo_Schema_React DOIT fournir un GenerativeInterfaceProvider identique à celui de Référence_Échantillon.
3. LORSQUE un utilisateur soumet un prompt, LE Échantillon_Demo_Schema_React DOIT afficher un tour de conversation avec le streaming progressif du texte agent.
4. LORSQUE le streaming d'un tour est en cours, LE Échantillon_Demo_Schema_React DOIT afficher des skeletons pour les surfaces annoncées non encore rendues.
5. LORSQUE le streaming d'un tour se termine, LE Échantillon_Demo_Schema_React DOIT remplacer les skeletons par les composants rendus avec les données finales.
6. LORSQUE un utilisateur effectue un reset de conversation, LE Échantillon_Demo_Schema_React DOIT effacer toutes les surfaces et l'historique de tour.
7. LORSQUE un utilisateur navigue entre pages (landing, conversation, résultats), LE Échantillon_Demo_Schema_React DOIT préserver le comportement de navigation de Référence_Échantillon.
8. LE Échantillon_Demo_Schema_React DOIT produire une structure DOM équivalente à Référence_Échantillon pour chaque Scénario_Couvert.
9. LE Échantillon_Demo_Schema_React DOIT produire un layout CSS équivalent à Référence_Échantillon pour chaque Scénario_Couvert.
10. LE Échantillon_Demo_Schema_React DOIT produire des styles visuels équivalents à Référence_Échantillon pour chaque Scénario_Couvert.
11. LORSQUE le texte agent contient du markdown, LE Échantillon_Demo_Schema_React DOIT le rendre en HTML sanitisé identiquement à Référence_Échantillon.
12. LORSQUE des suggestions sont disponibles, LE Échantillon_Demo_Schema_React DOIT les afficher et les rendre interactives identiquement à Référence_Échantillon.

### Exigence 3 : rendu contractuel depuis @coveo/thermidor-schema

**User Story :** En tant que développeur Thermidor, je veux que l'échantillon rende ses composants à partir des contrats publiés par `@coveo/thermidor-schema`, afin que le rendu soit piloté par l'état validé des contrôleurs sans schéma alternatif ni fallback.

#### Critères d'acceptation

1. LE Échantillon_Demo_Schema_React DOIT créer un A2UI_Catalog identifié par le littéral ID_Catalogue_A2UI `https://schema.thermidor.coveo.com/a2-ui/catalog.json`.
2. LE A2UI_Catalog DOIT enregistrer Composant_ProductCarousel avec un Props_Schema_Local défini dans l'échantillon, décrivant la forme `{controllers: {productListController: {controllerId: string, controllerSchema: literal("https://schema.thermidor.coveo.com/controllers/product-list.schema.json")}}}`.
3. LE A2UI_Catalog DOIT enregistrer Composant_Cart avec un Props_Schema_Local défini dans l'échantillon, décrivant la forme `{controllers: {cartController: {controllerId: string, controllerSchema: literal("https://schema.thermidor.coveo.com/controllers/cart.schema.json")}}}`.
4. LORSQUE une Surface_A2UI est créée avec un composant dont le type correspond à un Composant_Catalogue, LE Rendu_Contractuel DOIT résoudre et rendre ce composant depuis A2UI_Catalog.
5. LORSQUE Composant_ProductCarousel reçoit un STATE_SNAPSHOT, LE Composant_ProductCarousel DOIT rendre la liste de produits à partir de l'état validé du Remote_Controller_ProductList.
6. LORSQUE Composant_Cart reçoit un STATE_SNAPSHOT, LE Composant_Cart DOIT rendre les articles du panier et le Total_Panier à partir de l'état validé du Remote_Controller_Cart.
7. LE Composant_Cart DOIT calculer le Total_Panier comme `sum(price × quantity)` pour chaque article de l'état validé.
8. LORSQUE une opération createSurface est reçue, LE Échantillon_Demo_Schema_React DOIT créer la Surface_A2UI correspondante.
9. LORSQUE une opération updateComponents est reçue, LE Échantillon_Demo_Schema_React DOIT mettre à jour les composants de la Surface_A2UI ciblée.
10. LORSQUE une opération deleteSurface est reçue, LE Échantillon_Demo_Schema_React DOIT supprimer la Surface_A2UI ciblée.
11. LORSQUE une opération replace est reçue, LE Échantillon_Demo_Schema_React DOIT effacer toutes les surfaces précédentes du tour avant de traiter les nouvelles opérations.
12. LE Échantillon_Demo_Schema_React DOIT traiter les Opération_A2UI dans l'ordre séquentiel local du tour (turn-local ordered).
13. SI une Surface_A2UI référence un composant absent de A2UI_Catalog, ALORS LE Échantillon_Demo_Schema_React DOIT ignorer cette surface sans fallback ni rendu alternatif.
14. SI un Ingress_Invalide est reçu (STATE_SNAPSHOT échouant la validation Zod du contrat), ALORS LE Échantillon_Demo_Schema_React DOIT rejeter cet ingress sans fallback ni état partiel.
15. LE Échantillon_Demo_Schema_React DOIT importer `ProductListControllerContractSchema`, `CartControllerContractSchema`, `ControllerContractsSchema`, `ProductListStateSchema`, `CartStateSchema`, `ProductSchema`, `CartItemSchema`, `SetItemsPayloadSchema`, `UpdateItemQuantityPayloadSchema` et leurs types associés (`ControllerContracts`, `ProductListControllerContract`, `CartControllerContract`, `ProductListState`, `CartState`, `Product`, `CartItem`, `SetItemsPayload`, `UpdateItemQuantityPayload`) exclusivement depuis `@coveo/thermidor-schema`.
16. LE Échantillon_Demo_Schema_React DOIT adapter le pattern architectural de Référence_Pattern_Catalogue pour le format v2 de `@coveo/thermidor-schema`, en utilisant `createCatalog` depuis `@copilotkit/a2ui-renderer` avec un objet `CatalogDefinitions` dont les props schemas sont définis localement comme Props_Schema_Local.
17. LE Échantillon_Demo_Schema_React DOIT adapter le pattern du hook `useAdvertisedController` de Référence_Pattern_Catalogue en utilisant `ControllerContracts['controllerSchema']` (Discriminateur_V2) au lieu de `ControllerContracts['schemaId']` comme type de schéma de contrôleur.
18. LE Échantillon_Demo_Schema_React DOIT structurer ses renderers de catalogue comme un objet satisfaisant le type `CatalogRenderers<typeof catalogDefinitions>`, conformément au pattern de Référence_Pattern_Catalogue.
19. LE Échantillon_Demo_Schema_React DOIT définir les Props_Schema_Local dans le fichier `src/a2ui/components.tsx` en utilisant `z` importé depuis `zod`, en réutilisant les littéraux d'ID_Schéma_Canonique issus des contrats exportés par `@coveo/thermidor-schema` (via les champs `.shape.controllerSchema.value` des schemas de contrat).

### Exigence 4 : Remote Controllers et porte de prérequis du pont d'action

**User Story :** En tant que développeur Thermidor, je veux que l'échantillon lie les composants à des Remote Controllers contractuels et soumette les actions via le Converse controller unifié, afin que l'état serveur soit autoritatif et que les mutations transitent par le canal conversationnel.

#### Critères d'acceptation

1. LE Échantillon_Demo_Schema_React DOIT construire Remote_Controller_ProductList via `buildRemoteController` de `@coveo/thermidor` avec le contrat `productListControllerContract` et l'ID_Schéma_Canonique `https://schema.thermidor.coveo.com/controllers/product-list.schema.json`.
2. LE Échantillon_Demo_Schema_React DOIT construire Remote_Controller_Cart via `buildRemoteController` de `@coveo/thermidor` avec le contrat `cartControllerContract` et l'ID_Schéma_Canonique `https://schema.thermidor.coveo.com/controllers/cart.schema.json`.
3. LORSQUE Remote_Controller_ProductList reçoit un STATE_SNAPSHOT, LE Remote_Controller_ProductList DOIT exposer l'état validé au Composant_ProductCarousel.
4. LORSQUE Remote_Controller_Cart reçoit un STATE_SNAPSHOT, LE Remote_Controller_Cart DOIT exposer l'état validé au Composant_Cart.
5. LORSQUE une action contractuelle (setItems, updateItemQuantity) est déclenchée par un Composant_Catalogue, L'action DOIT être soumise via le Pont_d_Action_Converse du Converse_Controller_Unifié avec la structure Actions_Imbriquées du format v2 (`actions.<actionName>.payload`).
6. LE Échantillon_Demo_Schema_React DOIT utiliser le Converse_Controller_Unifié comme unique canal de soumission d'actions contractuelles.
7. LORSQUE le Pont_d_Action_Converse n'est pas implémenté, LA Porte_Prérequis_Action DOIT empêcher l'exécution des scénarios d'action dans Échantillon_Demo_Schema_React.
8. LE Échantillon_Demo_Schema_React DOIT propager les mises à jour d'état depuis les Remote Controllers vers les Composant_Catalogue via le mécanisme de souscription standard de `@coveo/thermidor`.
9. LE Échantillon_Demo_Schema_React DOIT passer le controllerId annoncé par les données de Surface_A2UI au constructeur de chaque Remote_Controller.
10. LE Échantillon_Demo_Schema_React DOIT suivre le pattern de construction des Remote Controllers de Référence_Pattern_Catalogue, en utilisant le hook `useAdvertisedController` qui encapsule `buildRemoteController` de `@coveo/thermidor` avec un `ControllerAdvertisement` typé contenant `controllerId` et `controllerSchema` (Discriminateur_V2, type `ControllerContracts['controllerSchema']`).

### Exigence 5 : fixtures mock locales et exercice local

**User Story :** En tant que développeur exerçant l'échantillon localement, je veux un mock API local fournissant des scénarios fixes, afin que l'échantillon soit testable sans backend distant.

#### Critères d'acceptation

1. LE Échantillon_Demo_Schema_React DOIT supporter le mode mock via la commande `pnpm dev:mock` configurée avec `VITE_COVEO_ENDPOINT=http://localhost:3456`.
2. LORSQUE le mode mock est actif, LE Échantillon_Demo_Schema_React DOIT diriger toutes les requêtes Converse vers Mock_Converse_API à `localhost:3456`.
3. LE Mock_Converse_API DOIT fournir au minimum une Fixture_Mock couvrant le scénario ProductCarousel (réponse avec createSurface + STATE_SNAPSHOT product-list).
4. LE Mock_Converse_API DOIT fournir au minimum une Fixture_Mock couvrant le scénario Cart (réponse avec createSurface + STATE_SNAPSHOT cart).
5. LE Mock_Converse_API DOIT fournir au minimum une Fixture_Mock couvrant le scénario combiné (ProductCarousel + Cart dans le même tour).
6. LORSQUE Échantillon_Demo_Schema_React est exercé avec les Fixture_Mock, LE rendu DOIT produire des composants identiques en structure et données à ceux produits par Référence_Échantillon pour les mêmes scénarios.
7. LE Échantillon_Demo_Schema_React DOIT conserver un fichier `.env.example` documentant les variables d'environnement requises.
8. LE Échantillon_Demo_Schema_React DOIT supporter le proxy Vite pour le développement local de la même manière que Référence_Échantillon.
9. LORSQUE les Fixture_Mock couvrent un scénario avec streaming progressif, LE Mock_Converse_API DOIT simuler le streaming avec des chunks SSE séquentiels.
10. LE Mock_Converse_API DOIT servir des réponses déterministes pour le même prompt d'entrée.

### Exigence 6 : validation déterministe de parité

**User Story :** En tant que mainteneur, je veux des tests Vitest déterministes validant la parité, afin que la non-régression soit prouvable sans exécution manuelle.

#### Critères d'acceptation

1. LE Échantillon_Demo_Schema_React DOIT conserver une suite Validation_Vitest_Fixe utilisant uniquement des fixtures fixes et des résultats attendus déterminés avant l'exécution.
2. LORSQUE Validation_Vitest_Fixe exécute un scénario ProductCarousel avec une fixture fixe, LA Validation_Vitest_Fixe DOIT vérifier que Composant_ProductCarousel rend la liste de produits attendue.
3. LORSQUE Validation_Vitest_Fixe exécute un scénario Cart avec une fixture fixe, LA Validation_Vitest_Fixe DOIT vérifier que Composant_Cart rend les articles et le Total_Panier attendus.
4. LORSQUE Validation_Vitest_Fixe exécute un scénario de calcul de Total_Panier, LA Validation_Vitest_Fixe DOIT vérifier que le total affiché correspond à `sum(price × quantity)` des articles de la fixture.
5. LORSQUE Validation_Vitest_Fixe exécute un scénario d'Ingress_Invalide, LA Validation_Vitest_Fixe DOIT vérifier que le composant rejette l'état sans fallback.
6. LORSQUE Validation_Vitest_Fixe exécute un scénario d'opérations A2-UI ordonnées, LA Validation_Vitest_Fixe DOIT vérifier que les surfaces sont créées, mises à jour et supprimées dans l'ordre attendu.
7. LORSQUE Validation_Vitest_Fixe exécute un scénario replace, LA Validation_Vitest_Fixe DOIT vérifier que les surfaces précédentes sont effacées avant le traitement des nouvelles opérations.
8. LORSQUE Validation_Vitest_Fixe est exécutée deux fois avec les mêmes fixtures, LA Validation_Vitest_Fixe DOIT produire les mêmes résultats et le même statut de sortie.
9. LE Échantillon_Demo_Schema_React DOIT conserver l'absence de test basé sur les propriétés dans Validation_Vitest_Fixe.
10. LE Échantillon_Demo_Schema_React DOIT conserver l'absence d'accès réseau, de générateur aléatoire et d'horloge dans Validation_Vitest_Fixe.
11. LORSQUE Validation_Vitest_Fixe valide le catalogue A2-UI, LA Validation_Vitest_Fixe DOIT vérifier que A2UI_Catalog est enregistré avec le littéral ID_Catalogue_A2UI exact.
12. LORSQUE Validation_Vitest_Fixe valide les Remote Controllers, LA Validation_Vitest_Fixe DOIT vérifier que chaque Remote_Controller est construit avec le contrat et l'ID_Schéma_Canonique attendus.

### Exigence 7 : frontière d'import et isolement des dépendances

**User Story :** En tant que mainteneur de contrats, je veux que l'échantillon importe exclusivement depuis l'API publique de `@coveo/thermidor-schema`, afin que les détails de génération restent internes et que la frontière soit vérifiable.

#### Critères d'acceptation

1. LE Échantillon_Demo_Schema_React DOIT importer tous les contrats de contrôleur, schémas d'état, types et valeurs de contrat exclusivement depuis le spécificateur d'import `@coveo/thermidor-schema`. Les schémas de props de catalogue (Props_Schema_Local) sont définis localement et n'ont pas de source d'import externe.
2. SI un fichier source de Échantillon_Demo_Schema_React importe depuis un chemin interne de `packages/thermidor-schema` (src/, schema/, scripts/, generated/), ALORS LA Validation_Vitest_Fixe DOIT échouer avec le fichier et le chemin d'import violant.
3. SI un fichier source de Échantillon_Demo_Schema_React importe depuis `@coveo/thermidor-contracts`, ALORS LA Validation_Vitest_Fixe DOIT échouer avec le fichier et le spécificateur d'import violant.
4. LE Échantillon_Demo_Schema_React DOIT résoudre les imports `@coveo/thermidor-schema` vers Sortie_Dist_Schema (artéfacts `.js` et `.d.ts` sous `packages/thermidor-schema/dist`).
5. LORSQUE Validation_Vitest_Fixe valide la frontière d'import, LA Validation_Vitest_Fixe DOIT scanner tous les fichiers source `.ts` et `.tsx` de Échantillon_Demo_Schema_React pour détecter les imports non conformes.
6. LE Échantillon_Demo_Schema_React DOIT conserver l'absence d'import de `packages/thermidor-contracts` sous quelque forme que ce soit.
7. LE Échantillon_Demo_Schema_React DOIT conserver l'absence d'import de chemins relatifs pointant vers `packages/thermidor-schema/src`, `packages/thermidor-schema/schema` ou `packages/thermidor-schema/scripts`.
8. LE Échantillon_Demo_Schema_React DOIT utiliser les versions d'outillage du monorepo (TypeScript, Vitest, Vite, React) via la résolution du catalogue pnpm.

## Stratégie de validation

Toutes les validations de cette fonctionnalité utilisent Vitest en exécution unique (`vitest run`), des fixtures fixes versionnées et des résultats attendus fixés avant l'exécution. Les suites couvrent :

- Le rendu de Composant_ProductCarousel avec des fixtures product-list valides et invalides
- Le rendu de Composant_Cart avec des fixtures cart valides et invalides, y compris le calcul de Total_Panier
- Le traitement ordonné des Opération_A2UI (createSurface, updateComponents, deleteSurface, replace)
- Le rejet d'Ingress_Invalide sans fallback
- La création et résolution de A2UI_Catalog avec ID_Catalogue_A2UI exact
- La construction de Remote Controllers avec contrats et ID_Schéma_Canonique corrects
- La frontière d'import (scan statique des spécificateurs d'import non conformes)
- Le build complet (`vite build`) et l'exécution des tests (`vitest run`)

Les suites n'utilisent aucun générateur aléatoire, aucune horloge, aucun accès réseau et aucun test basé sur les propriétés. Les fixtures mock sont locales, déterministes et versionnées aux côtés des tests.
