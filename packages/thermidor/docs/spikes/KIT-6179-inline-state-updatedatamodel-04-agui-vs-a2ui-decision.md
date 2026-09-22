# Annexe KIT-6179 — Les données de composant : via AG-UI ou via A2-UI ? Aide à la décision

- **Type :** Note d'aide à la décision.
- **Accompagne :** le spike (`-02-`, « est-ce qu'`updateDataModel` fonctionne ? » — oui) et l'annexe agnostic (`-03-`, « comment consommer Thermidor depuis tout framework ? »).
- **But :** aider à trancher un seul choix — **par quel protocole transitent les données de composant** : AG-UI (comme aujourd'hui) ou A2-UI (`updateDataModel`, dans le même protocole que la composition) ? AG-UI reste le canal du flux agentique (turns, messages, tool calls, lifecycle) dans tous les cas — il n'est pas question de l'abandonner. On teste d'abord l'argument qu'on croyait décisif (l'interop multi-consommateurs), puis on isole le critère qui départage réellement. On raisonne sur des faits vérifiés dans le code, pas sur la rhétorique du spike.

## L'hypothèse de départ : l'interop trancherait

Thermidor n'est pas le seul consommateur du backend génératif de Coveo. On pourrait donc croire que le choix se décide sur l'interop : quel protocole expose l'état de la façon la plus réutilisable par un autre client (app mobile, CLI, API publique) ? C'est l'intuition naturelle — et on va la tester. On verra (section « Observations ») qu'elle **ne tranche pas** : un consommateur qui ne veut que la donnée relève d'un endpoint dédié, hors du canal d'UI. L'interop écartée, le vrai critère apparaît ailleurs.

## Le cadrage : le débat ne porte que sur les données de composant

AG-UI n'est pas remis en cause. Fait vérifié dans la branche actuelle : les deux protocoles cohabitent déjà. Les tool calls (`route_bundle`, `coveo_commerce_search`, `store_render_plan`...), les messages texte et le lifecycle (`RUN_STARTED` / `RUN_FINISHED`) passent par des events **AG-UI** ; l'état de composant passe par **A2-UI** (`updateDataModel`, porté dans les activités `a2ui-surface`). Le seul objet du choix ci-dessous est donc le transport de l'**état de composant** — le reste (flux agentique) reste en AG-UI quel que soit le verdict.

## La vision des schémas

L'architecture a évolué d'un modèle « un contrôleur par composant, codé à la main » vers un modèle « tout est dicté par les schémas » :

- **Avant : des `*Controller` custom, un par composant.** (`pagination-controller`, `sort-controller`, `cart-controller`, etc.) Chacun portait sa logique et ses **sélecteurs** pour extraire, d'un state, l'information pertinente à ce composant.
- **Après : un `RemoteController` générique.** Un seul contrôleur, dont le state et les actions sont **typés par les schémas** (`RemoteController<T, TContracts>` ; `dispatch<A>(action, payload: ActionPayloadFor<...>)`). Plus de contrôleur écrit à la main par composant.
- **Conséquence directe.** Pour qu'un `RemoteController` **générique** fonctionne sans sélecteur écrit à la main, la réponse doit arriver **1-pour-1 avec le composant** : le contrôleur lit `response.state.components[componentId]` et le valide contre le contrat du composant. Il n'y a plus de code qui saurait extraire, d'un state métier, les morceaux pertinents à tel composant — ce code (les sélecteurs) a précisément été supprimé.

Autrement dit : la généricité du `RemoteController` a un prix implicite — elle **impose** que les données arrivent déjà découpées par composant.

## AG-UI : un transport de données indépendant

AG-UI (`STATE_SNAPSHOT` / `STATE_DELTA`) est le protocole événementiel que Thermidor utilise déjà pour le flux agentique.

- Dans la situation 1-pour-1 qu'impose le `RemoteController`, l'état AG-UI doit porter un **champ d'identité** (`componentId`) pour relier chaque morceau d'état au composant A2-UI correspondant. C'est le pont `componentId` ↔ état.
- AG-UI peut transporter **n'importe quel état d'agent**, y compris de l'état non relié à un composant (état de conversation, métadonnées, données intermédiaires). C'est déjà le cas aujourd'hui pour le flux agentique — messages texte de l'assistant, tool calls, lifecycle — qui n'a pas de composant A2-UI associé et transite en AG-UI.

## A2-UI : un transport de données via `updateDataModel`

A2-UI propose `updateDataModel` comme mécanisme d'état, dans le même protocole que la composition.

- `updateDataModel` pousse et met à jour les données des composants directement via le protocole A2-UI ; le renderer résout les liaisons `{ path }` contre le data model peuplé.
- Il retourne des données **reliées à un composant** que le renderer monte. Corollaire honnête : un état qui n'a aucun composant à monter (état de session pur, préférence, contexte sans représentation) ne s'exprime pas naturellement en A2-UI — le renderer monte ce que le catalogue déclare, on ne contrôle pas « ceci ne s'affiche pas ». C'est précisément là qu'AG-UI, qui transporte de l'état libre, garde un usage propre.
- Il utilise un système de **pointeurs JSON (JSON Pointer, RFC 6901)** pour indiquer où se trouve la donnée dans le `dataModel`. La forme de ces pointeurs n'est **pas** dictée par le standard.

## Observations reliées à la prémisse

Trois observations découlent de ce qui précède — et la troisième corrige une conclusion trop rapide :

- **AG-UI avec `componentId` : inconsommable par un tiers.** L'état est indexé par des identifiants de composants d'UI (`components["pagination-2"]` plutôt que `search.pagination`) : aucun repère métier. Un tiers ne saurait pas quoi lire. L'état est taillé pour l'UI de Thermidor.
- **A2-UI, même avec un état métier, reste un flux d'UI.** On peut organiser le `dataModel` en **état métier** (`/search/results`, `/commerce/cart`) et se servir des pointeurs comme de **sélecteurs** — c'est plus lisible qu'un scope par composant. Mais un tiers qui consomme ce flux consomme quand même de l'A2-UI : des surfaces, des composants, un catalogue. Un consommateur qui ne veut QUE la donnée devrait comprendre un protocole d'UI pour l'en extraire. Ce n'est pas sa place.
- **Conséquence : la prémisse ne tranche pas ce débat.** Un tiers qui ne veut que le state métier, sans UI, relève d'un **endpoint dédié** du backend — une API de données découplée du canal d'UI — ni AG-UI ni A2-UI, qui sont tous deux des canaux d'UI. L'interop « data-only » n'est donc pas un argument pour choisir A2-UI plutôt qu'AG-UI comme transport de l'état de composant. Ce choix doit se justifier sur d'autres critères (cohérence du modèle, simplicité, alignement sur le state que le backend conserve déjà).

## Le vrai critère : pont `componentId` vs corrélation native

L'interop écartée, il reste un départage concret entre les deux protocoles pour le transport de l'état de composant — et il tient à la corrélation entre un composant et son état :

- **AG-UI impose un pont `componentId`.** Le `RemoteController` générique lit `response.state.components[componentId]` ; l'état AG-UI doit donc porter cet identifiant, et une couche relie l'état (AG-UI) au composant (A2-UI). Deux protocoles à corréler par un identifiant.
- **A2-UI corrèle nativement.** L'état vit sous `/state/<id>` dans le **même** protocole que les liaisons `{ path }` des props du composant. La correspondance composant vers état est portée par le message lui-même — aucun pont à maintenir.

C'est le seul argument technique, vérifié et non-rhétorique, qui départage les deux pour l'état de composant : A2-UI supprime une couche de corrélation qu'AG-UI rend nécessaire. L'avantage est réel mais circonscrit — il ne dit rien de la forme du data model (question distincte, plus bas), ni du flux agentique (qui reste en AG-UI de toute façon).

## Est-ce qu'on pourrait avoir un état métier avec AG-UI en conservant l'abstraction générique du `RemoteController` ?

En théorie oui, mais on retombe sur le problème que la vision des schémas a justement voulu éliminer.

Pour qu'un état AG-UI **métier** alimente un `RemoteController` générique, il faut savoir, pour chaque composant, **quel morceau du state lire**. Deux façons, aucune satisfaisante :

- **Un sélecteur côté client** — c'est réintroduire le code custom par composant qu'on vient précisément de supprimer.
- **Un pointeur côté protocole** (le message A2-UI indique le chemin dans le state) — mais c'est alors, à la structure près, ce que fait déjà `updateDataModel`, à ceci près que le state resterait en AG-UI au lieu d'A2-UI. On scinde ainsi le pointeur (A2-UI) et sa cible (AG-UI) en deux protocoles, avec une corrélation à maintenir entre eux.

Ce montage « pointeur A2-UI vers state AG-UI » n'aurait qu'un intérêt : permettre à un tiers de consommer le state AG-UI **seul, sans UI**. Mais ce tiers serait mieux servi par un **endpoint de données dédié** — le but de Thermidor est de générer de l'UI, pas d'être une API de données. **Plus simple : deux chemins séparés** — le chemin UI (Thermidor) et le chemin données (endpoint dédié), plutôt qu'un pointeur inter-protocoles qui tord l'architecture pour un besoin qui n'est pas celui de Thermidor.

## Comment modéliser `updateDataModel` pour consommer un état métier ?

L'idée : le `dataModel` d'une surface n'est plus une collection d'états par composant, mais un **modèle métier**, et les props des composants sont des **liaisons** (`{ path }`) vers ce modèle.

- Aujourd'hui (forme par composant) : `path = /state/<componentId>/<field>`. Le `path` est l'état du nœud, en 1-pour-1. C'est ce que le spike a mis en place, et ce qui rend le wrapper dynamique typé si direct (type du composant → son `XxxState` → son `/state/<id>`, sans sélecteur).
- Forme métier : `path = /search/results`, `/search/pagination`, `/commerce/cart`. Le composant `Pagination` lierait ses props à `/search/pagination` ; un `ProductGrid` à `/search/results`. Le composant ne possède plus la donnée, il **observe** une partie du modèle — un sélecteur exprimé en JSON Pointer, proche d'un data-binding MVVM.

Reste à choisir le bon niveau de granularité : un modèle **métier**, stable et reconnaissable (ex. `search.results`, `search.pagination`), ni un modèle de persistance trop bas niveau, ni un modèle calqué sur l'UI. Un test simple pour le situer : un tiers reconnaît-il naturellement ce nœud sans connaître l'UI de Thermidor ? `search.results` — oui ; `productGrid.data` — non.

Le coût honnête de cette forme : chaque composant doit déclarer quel chemin métier il observe (une liaison à définir et à maintenir), et le mapping 1-pour-1 typé — type du composant → son `XxxState` → `/state/<id>` — se complexifie : l'état d'un composant n'est plus « son » nœud, mais le résultat d'une liaison vers un sous-arbre métier partagé.

## Quel est l'état actuel du backend qui est stateful ?

Fait vérifié : **le backend conserve un state métier, pas un state par composant.** Côté `agent-smith`, `context.state` est un dictionnaire indexé par des concepts métier — `query`, `render_plan`, `response_plan` (voir `graph_runtime.py` et `PredictStateMapping`, qui mappe un argument de tool vers un `state_key` métier). L'exemple le plus simple observé est `{ "query": "boots" }`.

Conséquences :

- La forme métier (section précédente) n'est **pas** un modèle à inventer : elle réaligne le transport sur ce que le backend détient déjà.
- Le lien `componentId` que porte l'état aujourd'hui a été introduit de **notre** côté (frontend et sample, avec des mocks), pour satisfaire le `RemoteController` générique. Ce n'est pas la nature du state backend.
- Le backend reste, à ce sujet, en retard sur la vision — volontairement. La vision (schémas, contrat agnostic) a été travaillée côté frontend avec des données mockées ; l'émission backend alignée sur un modèle métier reste à faire.

## Conclusion

Le doc est parti d'une intuition — l'interop trancherait — et l'a écartée : un tiers qui ne veut que la donnée relève d'un endpoint dédié, pas du canal d'UI. Ni AG-UI ni A2-UI ne sont faits pour ça. L'interop ne départage donc pas les deux protocoles.

Une fois cette fausse piste retirée, il reste **un** critère concret pour le transport de l'état de composant : la corrélation composant vers état. AG-UI l'exige via un pont `componentId` (le `RemoteController` générique lit `response.state.components[componentId]`) ; A2-UI la porte nativement (`/state/<id>` dans le même protocole que les liaisons). **A2-UI supprime une couche que AG-UI rend nécessaire.** C'est un avantage réel, mais modeste et circonscrit à l'état de composant.

Décision, donc : pour le **transport de l'état de composant**, A2-UI (`updateDataModel`) est le choix le plus simple — une corrélation en moins. Le **flux agentique** (turns, messages, tool calls, lifecycle) reste en AG-UI dans tous les cas. Et un tiers **data-only** relèverait d'un **endpoint dédié**, indépendant de ce choix.

Ce qui reste ouvert — et qui est une décision **distincte**, à ne pas confondre avec le choix de protocole :

- **La forme du data model A2-UI.** Par composant (`/state/<id>`, DX simple, mapping typé 1-pour-1 — la forme actuelle) ou métier (`/search/results`, aligné sur le state que le backend conserve déjà, mais liaisons composant vers chemin à maintenir) ? C'est un choix de modèle de domaine qui engage le contrat émis par le backend, pas le protocole.
- **Le calendrier backend.** Le backend conserve déjà un state métier mais émet, volontairement, un état par composant côté mocks. Aligner l'émission sur la forme retenue reste à planifier.

En somme : le choix de protocole pour l'état de composant est tranché et à faible enjeu (A2-UI, corrélation native) ; la vraie décision structurante — la forme du data model — reste ouverte et mérite son propre cadrage.
