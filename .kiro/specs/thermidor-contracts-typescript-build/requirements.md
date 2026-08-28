# Requirements Document

## Introduction

`thermidor-contracts-typescript-build` crée un nouveau package `packages/thermidor-schema` publié sous l'identité `@coveo/thermidor-schema`. Ce package contient les entrées JSON Schema versionnées, la projection TypeScript/Zod, la source TypeScript générée interne, l'orchestration de build, les validations et la sortie `dist` reproduites depuis la référence externe `coveo-platform/thermidor-schema`. La référence de création est la PR externe n°17 au commit `b046dea970dcdb427065f9daf61c910d172fc31e`. Cette référence établit un flux TypeScript où la génération précède le build du package et où le package produit `dist`.

La fonctionnalité crée le package avec l'identité publique `@coveo/thermidor-schema`. `packages/thermidor-schema` est le propriétaire unique des entrées de schéma, des scripts de génération, de la source TypeScript générée, de la configuration de build, des validations et de `dist`. Les consommateurs d'exécution résolvent exclusivement l'API publique construite de `@coveo/thermidor-schema`. Le package existant `packages/thermidor-contracts` est explicitement hors périmètre : cette fonctionnalité ne le modifie pas, ne le supprime pas, ne le déprécie pas et ne le référence pas comme cible de migration.

L'implémentation par défaut est une Reproduction_Fidèle de Référence_TypeScript_Externe. Chaque divergence est une Adaptation_Nommée documentée appartenant à une Catégorie_d_Adaptation fermée. Les versions d'outillage du monorepo sont autoritatives et remplacent les déclarations externes.

La première intégration est TypeScript uniquement. Maven et Java sont hors périmètre, car la référence externe fournie ne contient ni module Maven ni générateur Maven. Toute cible Maven ultérieure exige une fonctionnalité distincte ou une extension explicitement approuvée. Cette phase définit uniquement des exigences : elle ne modifie aucun code, dépendance, catalogue de packages, lockfile, configuration d'espace de travail externe, échantillon ou spécification d'échantillon.

## Glossary

- **Package_Thermidor_Schema** : le nouveau package monorepo situé dans `packages/thermidor-schema` et publié sous l'identité exacte `@coveo/thermidor-schema`.
- **API_Publique_Schema** : l'ensemble des exports de valeur, exports de type, comportements de résolution et comportements d'acceptation ou de rejet de schéma disponibles depuis l'import exact `@coveo/thermidor-schema`.
- **Référence_TypeScript_Externe** : l'état de `coveo-platform/thermidor-schema` décrit par la PR n°17 au commit `b046dea970dcdb427065f9daf61c910d172fc31e`.
- **Artéfact_Reproduit** : un artéfact de Référence_TypeScript_Externe reproduit dans Package_Thermidor_Schema, limité à une Entrée_Schéma, un Script_de_Projection, une Source_TypeScript_Générée, une configuration de Build_Schema, une fixture de validation ou une Sortie_Dist.
- **Entrée_Schéma** : un fichier JSON Schema versionné dont le contenu participe à la projection des contrats.
- **Entrées_Schéma** : l'ensemble ordonné des Entrée_Schéma appartenant à Package_Thermidor_Schema.
- **ID_Schéma_Canonique** : la valeur absolue de l'identifiant `$id` déclarée par une Entrée_Schéma, conservée sans relativisation ni réécriture dans le contrat projeté.
- **Projection_TypeScript_Zod** : la transformation déterministe des Entrées_Schéma en déclarations TypeScript et schémas Zod.
- **Source_TypeScript_Générée** : l'artéfact TypeScript interne produit par Projection_TypeScript_Zod avant la construction de Sortie_Dist.
- **Script_de_Projection** : un script versionné, interne à Package_Thermidor_Schema, qui exécute Projection_TypeScript_Zod.
- **Validation_de_Schéma** : la validation déterministe de la structure, des références et des ID_Schéma_Canonique des Entrées_Schéma avant Projection_TypeScript_Zod.
- **Build_Schema** : la construction TypeScript de Package_Thermidor_Schema qui transforme la source de package, y compris Source_TypeScript_Générée, en Sortie_Dist.
- **Sortie_Dist** : les artefacts JavaScript et déclarations TypeScript produits exclusivement par Build_Schema sous `packages/thermidor-schema/dist`.
- **Graphe_de_Build** : l'ordre de dépendance déterministe Validation_de_Schéma, Projection_TypeScript_Zod, Validation_de_Fraîcheur de Source_TypeScript_Générée, Build_Schema, Validation_de_Fraîcheur de Sortie_Dist, Validation_de_Contrat, Validation_de_Package, puis build ou test des consommateurs qui résolvent API_Publique_Schema.
- **Validation_de_Fraîcheur** : la comparaison déterministe entre un artéfact présent et le résultat attendu de Validation_de_Schéma, Projection_TypeScript_Zod ou Build_Schema.
- **Inventaire_d_Exports_Publiés** : la liste ordonnée des exports de valeur et de type de la racine construite de Package_Thermidor_Schema.
- **Fixture_de_Comportement_de_Schéma** : une valeur versionnée et un résultat attendu `accepté` ou `rejeté` pour un schéma Zod publié.
- **Validation_de_Contrat** : la validation déterministe de Inventaire_d_Exports_Publiés, des Fixture_de_Comportement_de_Schéma, des ID_Schéma_Canonique, des Contrat_d_Exécution_de_Contrôleur, des frontières d'import et de Validation_de_Fraîcheur.
- **Contrat_d_Exécution_de_Contrôleur** : un schéma Zod et ses types publiés qui décrivent un contrôleur, son ID_Schéma_Canonique, son état et ses charges utiles d'action.
- **Contrat_de_Liste_de_Produits** : le Contrat_d_Exécution_de_Contrôleur dont l'ID_Schéma_Canonique est `https://schema.thermidor.coveo.com/controllers/product-list.schema.json`.
- **Contrat_de_Panier** : le Contrat_d_Exécution_de_Contrôleur dont l'ID_Schéma_Canonique est `https://schema.thermidor.coveo.com/controllers/cart.schema.json`.
- **État_de_Liste_de_Produits** : le schéma d'état publié de Contrat_de_Liste_de_Produits.
- **État_de_Panier** : le schéma d'état publié de Contrat_de_Panier.
- **Charge_Utile_d_Action_Imbriquée** : un schéma Zod publié qui valide la charge utile d'une action définie dans un Contrat_d_Exécution_de_Contrôleur.
- **Charge_Utile_Set_Items** : la Charge_Utile_d_Action_Imbriquée publiée pour l'action `setItems` de Contrat_de_Panier.
- **Charge_Utile_Update_Item_Quantity** : la Charge_Utile_d_Action_Imbriquée publiée pour l'action `updateItemQuantity` de Contrat_de_Panier.
- **Union_Discriminée_de_Contrôleurs** : le schéma Zod publié qui discrimine les Contrat_d_Exécution_de_Contrôleur par ID_Schéma_Canonique.
- **Validation_de_Package** : la validation déterministe qui empaquette Package_Thermidor_Schema et résout API_Publique_Schema depuis l'artefact empaqueté dans un consommateur isolé.
- **Consommateur_d_Exécution** : un package ou une application qui importe des contrats pendant son exécution, notamment Thermidor, les mocks et un futur échantillon.
- **Consommateur_de_Build** : un package ou une application dont le build ou les tests résolvent API_Publique_Schema.
- **Frontière_Interne_de_Build** : Entrées_Schéma, Script_de_Projection, Source_TypeScript_Générée, configuration de build et chemins internes de Package_Thermidor_Schema qui ne sont pas des imports d'exécution publics.
- **Référence_Interne** : une référence d'import, d'export ou de résolution qui cible Frontière_Interne_de_Build.
- **Reproduction_Fidèle** : la copie structurelle et fonctionnelle du contenu de Référence_TypeScript_Externe dans Package_Thermidor_Schema, où chaque fichier, structure de répertoire, script, schéma, fixture et source générée est reproduit sauf Adaptation_Nommée explicite.
- **Adaptation_Nommée** : une divergence documentée, identifiée par un nom unique, une justification et une Catégorie_d_Adaptation, entre le contenu de Référence_TypeScript_Externe et le contenu reproduit dans Package_Thermidor_Schema.
- **Catégorie_d_Adaptation** : une classification fermée des adaptations autorisées, limitée à : (a) Alignement_de_Version_Monorepo, (b) Intégration_Workspace_Monorepo.
- **Alignement_de_Version_Monorepo** : le remplacement d'une version d'outil déclarée par Référence_TypeScript_Externe par la version épinglée correspondante du monorepo.
- **Intégration_Workspace_Monorepo** : la modification d'un lockfile, fichier d'espace de travail, champ `engines`, champ `packageManager` ou configuration de gestionnaire de packages pour intégrer Package_Thermidor_Schema dans la configuration existante du monorepo sans modifier cette configuration pour les autres packages.
- **Registre_d_Adaptations** : le document versionné qui liste chaque Adaptation_Nommée avec son nom, sa Catégorie_d_Adaptation, sa justification, le contenu externe original et le contenu adapté.
- **Version_TypeScript_Monorepo** : la version de TypeScript épinglée dans le catalogue pnpm (`pnpm-workspace.yaml` section `catalog`) du monorepo.
- **Version_Pnpm_Monorepo** : la version de pnpm épinglée dans le champ `packageManager` de la racine du monorepo.
- **Version_Node_Monorepo** : la version de Node.js épinglée dans le fichier `.nvmrc` de la racine du monorepo.
- **Dépendance_Locale_de_Générateur** : une devDependency requise par Script_de_Projection qui n'existe pas dans Package_Catalog et est ajoutée uniquement dans `packages/thermidor-schema/package.json` après approbation via Porte_d_Approbation.
- **Incompatibilité_de_Version_Monorepo** : une situation où Script_de_Projection utilise une fonctionnalité absente de la version d'outil épinglée par le monorepo, nécessitant une Adaptation_Nommée approuvée avant implémentation.
- **Audit_de_Compatibilité** : l'analyse versionnée qui compare les outils, dépendances, versions, scripts, configuration de gestionnaire de packages et configuration de build de Référence_TypeScript_Externe avec les outils déjà présents dans le monorepo.
- **Comparaison_d_Audit** : un enregistrement versionné contenant une catégorie, une valeur externe, une valeur monorepo et le résultat de comparaison de Audit_de_Compatibilité.
- **Décision_d_Audit** : une conclusion versionnée unique pour une divergence de Comparaison_d_Audit, indiquant la réutilisation d'un outil existant ou la modification requise.
- **Porte_d_Approbation** : l'état explicite dans lequel une approbation de mainteneur est enregistrée avant toute modification de dépendance, de Package_Catalog, de Lockfile, de configuration de gestionnaire de packages, de configuration de build ou de version d'outil de build.
- **État_Antérieur** : le contenu versionné d'un fichier ou d'une configuration avant une demande de modification.
- **Package_Catalog** : la section `catalog` de `pnpm-workspace.yaml`.
- **Lockfile** : le fichier monorepo `pnpm-lock.yaml`.
- **Configuration_Externe** : un lockfile, fichier d'espace de travail, configuration de gestionnaire de packages ou configuration de build provenant de Référence_TypeScript_Externe.
- **Entrées_d_Audit_Fixes** : le contenu externe, l'état monorepo et les paramètres d'Audit_de_Compatibilité versionnés avant l'exécution.
- **Diagnostic_de_Build** : un enregistrement déterministe qui identifie une phase, un artéfact, une valeur attendue, une valeur observée et une cause.
- **Vitest** : le framework de test unitaire déjà disponible dans le monorepo.
- **Entrée_Fixe** : une donnée de test versionnée dont le contenu et le résultat attendu sont déterminés avant l'exécution de Vitest.
- **Validation_Vitest_Fixe** : une suite Vitest utilisant uniquement des Entrée_Fixe, un résultat attendu déterminé avant l'exécution et aucun test basé sur les propriétés.
- **Contrat_de_Handoff_Consommateur** : l'accord documenté permettant à un Consommateur_d_Exécution futur de dépendre de API_Publique_Schema construite après les validations de cette fonctionnalité.
- **Échantillon_React_Contractuel** : la future application décrite par `thermidor-demo-react-a2ui-schema-contract`.
- **Préoccupation_d_Exécution_d_Échantillon** : le rendu, les mocks, les scripts et la configuration de package appartenant exclusivement à Échantillon_React_Contractuel.
- **Périmètre_Maven** : tout module Maven, source Java, générateur Java, dépendance Maven ou commande Maven.
- **Extension_Maven_Approuvée** : une fonctionnalité distincte ou une extension explicitement approuvée qui décrit une cible Maven partageant éventuellement des Entrées_Schéma.
- **Validation_de_Conformité_Spot** : la vérification ponctuelle (non exécutée en runtime) qui compare les exports et comportements de schéma de `packages/thermidor-schema/dist` aux exports et comportements existants dans `packages/thermidor-contracts/src/generated/catalog-contracts.ts`.
- **Référence_Contrats_Existante** : le fichier `packages/thermidor-contracts/src/generated/catalog-contracts.ts` contenant la sortie du générateur externe précédemment copiée, utilisé uniquement comme cible de comparaison ponctuelle.

## Requirements

### Exigence 1 : création du package TypeScript et propriété unique

**User Story :** En tant que mainteneur de Thermidor, je veux créer un nouveau package TypeScript reproduisant la référence externe, afin que les contrats soient publiés sous une identité dédiée sans package générateur d'exécution distinct.

#### Critères d'acceptation

1. LORSQUE la reproduction de Référence_TypeScript_Externe est implémentée, LE Package_Thermidor_Schema DOIT contenir chaque Entrée_Schéma reproduite.
2. LORSQUE la reproduction de Référence_TypeScript_Externe est implémentée, LE Package_Thermidor_Schema DOIT contenir chaque Script_de_Projection reproduit.
3. LORSQUE la reproduction de Référence_TypeScript_Externe est implémentée, LE Package_Thermidor_Schema DOIT contenir chaque Source_TypeScript_Générée reproduite.
4. LORSQUE la reproduction de Référence_TypeScript_Externe est implémentée, LE Package_Thermidor_Schema DOIT contenir chaque configuration de Build_Schema reproduite.
5. LORSQUE la reproduction de Référence_TypeScript_Externe est implémentée, LE Package_Thermidor_Schema DOIT contenir chaque fixture de validation reproduite.
6. LORSQUE Build_Schema réussit, LE Package_Thermidor_Schema DOIT produire Sortie_Dist sous `packages/thermidor-schema/dist`.
7. LE Package_Thermidor_Schema DOIT utiliser Référence_TypeScript_Externe comme référence de création identifiée par la PR n°17 et le commit `b046dea970dcdb427065f9daf61c910d172fc31e`.
8. LE Package_Thermidor_Schema DOIT porter l'identité publique exacte `@coveo/thermidor-schema`.
9. LORSQUE Validation_de_Contrat inventorie un Artéfact_Reproduit, LA Validation_de_Contrat DOIT attribuer exactement une classification parmi Entrée_Schéma, Script_de_Projection, Source_TypeScript_Générée, configuration de Build_Schema, fixture de validation ou Sortie_Dist.
10. SI Validation_de_Contrat détecte un Artéfact_Reproduit hors de Package_Thermidor_Schema, ALORS LA Validation_de_Contrat DOIT échouer de manière déterministe avec le chemin, la classification attendue et aucun résultat de validation réussi.

### Exigence 2 : audit de compatibilité et porte d'approbation du monorepo

**User Story :** En tant que mainteneur du monorepo, je veux auditer la compatibilité de la référence externe avant son intégration, afin que les outils existants soient réutilisés sans importer une configuration ou une dépendance non approuvée.

#### Critères d'acceptation

1. LE Package_Thermidor_Schema DOIT conserver un Audit_de_Compatibilité de Référence_TypeScript_Externe.
2. LORSQUE Audit_de_Compatibilité est exécuté, L'Audit_de_Compatibilité DOIT enregistrer une Comparaison_d_Audit pour chaque dépendance de Référence_TypeScript_Externe et chaque dépendance disponible dans le monorepo correspondante.
3. LORSQUE Audit_de_Compatibilité est exécuté, L'Audit_de_Compatibilité DOIT enregistrer une Comparaison_d_Audit pour chaque version d'outil de Référence_TypeScript_Externe et chaque version monorepo correspondante.
4. LORSQUE Audit_de_Compatibilité est exécuté, L'Audit_de_Compatibilité DOIT enregistrer une Comparaison_d_Audit pour chaque script de génération ou de build de Référence_TypeScript_Externe et la configuration de Build_Schema correspondante.
5. LORSQUE Audit_de_Compatibilité est exécuté, L'Audit_de_Compatibilité DOIT enregistrer une Comparaison_d_Audit pour chaque configuration de gestionnaire de packages, configuration de build, fichier d'espace de travail ou lockfile de Référence_TypeScript_Externe et l'état monorepo correspondant.
6. LORSQUE Audit_de_Compatibilité détecte une divergence dans une Comparaison_d_Audit, L'Audit_de_Compatibilité DOIT produire exactement une Décision_d_Audit pour cette divergence.
7. LORSQUE une Décision_d_Audit détermine la compatibilité avec un outil monorepo existant, LE Package_Thermidor_Schema DOIT réutiliser cet outil monorepo sans ajouter un outil dupliqué.
8. SI une Décision_d_Audit requiert une dépendance nouvelle ou modifiée sans approbation enregistrée dans Porte_d_Approbation, ALORS LA Porte_d_Approbation DOIT refuser la modification et préserver État_Antérieur de la dépendance.
9. SI une Décision_d_Audit requiert une modification de Package_Catalog sans approbation enregistrée dans Porte_d_Approbation, ALORS LA Porte_d_Approbation DOIT refuser la modification et préserver État_Antérieur de Package_Catalog.
10. SI une Décision_d_Audit requiert une modification de Lockfile sans approbation enregistrée dans Porte_d_Approbation, ALORS LA Porte_d_Approbation DOIT refuser la modification et préserver État_Antérieur de Lockfile.
11. SI une Décision_d_Audit requiert une modification de version d'outil de build, de gestionnaire de packages ou de configuration de build sans approbation enregistrée dans Porte_d_Approbation, ALORS LA Porte_d_Approbation DOIT refuser la modification et préserver État_Antérieur de la valeur concernée.
12. SI une Configuration_Externe est proposée pour copie sans approbation spécifique enregistrée dans Porte_d_Approbation, ALORS LA Porte_d_Approbation DOIT bloquer la copie et préserver État_Antérieur du chemin de destination.
13. LORSQUE Audit_de_Compatibilité est exécuté deux fois avec les mêmes Entrées_d_Audit_Fixes, L'Audit_de_Compatibilité DOIT produire les mêmes Comparaison_d_Audit, les mêmes Décision_d_Audit et les mêmes Diagnostic_de_Build dans le même ordre.
14. LORSQUE Audit_de_Compatibilité classe une divergence, L'Audit_de_Compatibilité DOIT associer la Décision_d_Audit à exactement une Catégorie_d_Adaptation parmi Alignement_de_Version_Monorepo ou Intégration_Workspace_Monorepo.
15. SI une divergence ne correspond à aucune Catégorie_d_Adaptation définie, ALORS LA Porte_d_Approbation DOIT bloquer l'adaptation et exiger une approbation explicite avant implémentation.

### Exigence 3 : frontière TypeScript, sortie construite et API publique

**User Story :** En tant que développeur consommant des contrats Thermidor, je veux résoudre les contrats depuis un package public construit, afin que les détails de génération restent internes et que l'API soit clairement définie.

#### Critères d'acceptation

1. LE Package_Thermidor_Schema DOIT définir API_Publique_Schema depuis l'import exact `@coveo/thermidor-schema`.
2. LORSQUE un consommateur résout l'import JavaScript exact `@coveo/thermidor-schema`, LE Package_Thermidor_Schema DOIT résoudre cet import vers un artéfact JavaScript de Sortie_Dist.
3. LORSQUE un consommateur résout les déclarations TypeScript de l'import exact `@coveo/thermidor-schema`, LE Package_Thermidor_Schema DOIT résoudre ces déclarations vers un artéfact de déclaration TypeScript de Sortie_Dist.
4. LE Package_Thermidor_Schema DOIT réserver la production de Sortie_Dist à Build_Schema.
5. LE Package_Thermidor_Schema DOIT conserver Source_TypeScript_Générée hors de API_Publique_Schema.
6. LE Package_Thermidor_Schema DOIT traiter Source_TypeScript_Générée comme Frontière_Interne_de_Build.
7. LORSQUE un Consommateur_d_Exécution importe un contrat, LE Consommateur_d_Exécution DOIT importer le contrat exclusivement depuis `@coveo/thermidor-schema`.
8. SI un Consommateur_d_Exécution résout une Référence_Interne, ALORS Validation_de_Contrat DOIT échouer avec le consommateur et la référence résolue.
9. LE Package_Thermidor_Schema DOIT publier Inventaire_d_Exports_Publiés tel que défini par Référence_TypeScript_Externe.
10. LORSQUE la création est validée, LE Package_Thermidor_Schema DOIT exporter chaque export de valeur et export de type défini par Référence_TypeScript_Externe.
11. SI Inventaire_d_Exports_Publiés diffère des exports définis par Référence_TypeScript_Externe sans changement explicitement approuvé, ALORS Validation_de_Contrat DOIT échouer avec les exports attendus et les exports observés.

### Exigence 4 : graphe de build TypeScript déterministe et fraîcheur des artefacts

**User Story :** En tant que mainteneur de build, je veux un graphe de build ordonné et déterministe, afin que chaque consommateur utilise des contrats validés et construits à partir des schémas courants.

#### Critères d'acceptation

1. LORSQUE Graphe_de_Build s'exécute avec Validation_de_Schéma réussie, LE Graphe_de_Build DOIT démarrer Projection_TypeScript_Zod après Validation_de_Schéma.
2. LORSQUE Graphe_de_Build s'exécute avec Projection_TypeScript_Zod réussie, LE Graphe_de_Build DOIT démarrer Validation_de_Fraîcheur de Source_TypeScript_Générée après Projection_TypeScript_Zod.
3. LORSQUE Graphe_de_Build s'exécute avec Validation_de_Fraîcheur de Source_TypeScript_Générée réussie, LE Graphe_de_Build DOIT démarrer Build_Schema après Validation_de_Fraîcheur de Source_TypeScript_Générée.
4. LORSQUE Graphe_de_Build s'exécute avec Build_Schema réussi, LE Graphe_de_Build DOIT démarrer Validation_de_Fraîcheur de Sortie_Dist après Build_Schema.
5. LORSQUE Graphe_de_Build s'exécute avec Validation_de_Fraîcheur de Sortie_Dist réussie, LE Graphe_de_Build DOIT démarrer Validation_de_Contrat après Validation_de_Fraîcheur de Sortie_Dist.
6. LORSQUE Graphe_de_Build s'exécute avec Validation_de_Contrat réussie, LE Graphe_de_Build DOIT démarrer Validation_de_Package après Validation_de_Contrat.
7. LORSQUE Graphe_de_Build s'exécute avec Validation_de_Package réussie, LE Graphe_de_Build DOIT démarrer chaque build ou test de Consommateur_de_Build après Validation_de_Package.
8. LORSQUE Validation_de_Schéma reçoit les mêmes Entrées_Schéma versionnées, LA Validation_de_Schéma DOIT produire le même résultat et les mêmes Diagnostic_de_Build dans le même ordre.
9. LORSQUE Projection_TypeScript_Zod reçoit les mêmes Entrées_Schéma versionnées, LA Projection_TypeScript_Zod DOIT produire une Source_TypeScript_Générée identique octet par octet.
10. LORSQUE Build_Schema reçoit la même source de package versionnée, LE Build_Schema DOIT produire une Sortie_Dist identique octet par octet.
11. LORSQUE Graphe_de_Build reçoit les mêmes entrées versionnées, LE Graphe_de_Build DOIT produire les mêmes statuts de sortie et les mêmes Diagnostic_de_Build dans le même ordre.
12. SI Validation_de_Schéma échoue, ALORS LE Graphe_de_Build DOIT empêcher Projection_TypeScript_Zod, Validation_de_Fraîcheur de Source_TypeScript_Générée, Build_Schema, Validation_de_Fraîcheur de Sortie_Dist, Validation_de_Contrat, Validation_de_Package et les étapes de Consommateur_de_Build, et préserver les artéfacts non démarrés.
13. SI Projection_TypeScript_Zod échoue, ALORS LE Graphe_de_Build DOIT empêcher Validation_de_Fraîcheur de Source_TypeScript_Générée, Build_Schema, Validation_de_Fraîcheur de Sortie_Dist, Validation_de_Contrat, Validation_de_Package et les étapes de Consommateur_de_Build, et préserver les artéfacts non démarrés.
14. SI Validation_de_Fraîcheur de Source_TypeScript_Générée échoue, ALORS LE Graphe_de_Build DOIT empêcher Build_Schema, Validation_de_Fraîcheur de Sortie_Dist, Validation_de_Contrat, Validation_de_Package et les étapes de Consommateur_de_Build, et préserver les artéfacts non démarrés.
15. SI Build_Schema échoue, ALORS LE Graphe_de_Build DOIT empêcher Validation_de_Fraîcheur de Sortie_Dist, Validation_de_Contrat, Validation_de_Package et les étapes de Consommateur_de_Build, et préserver les artéfacts non démarrés.
16. SI Validation_de_Fraîcheur de Sortie_Dist, Validation_de_Contrat ou Validation_de_Package échoue, ALORS LE Graphe_de_Build DOIT empêcher chaque étape dépendante de Consommateur_de_Build et préserver les artéfacts non démarrés.
17. SI Source_TypeScript_Générée ou Sortie_Dist diffère du résultat attendu, ALORS Validation_de_Fraîcheur DOIT échouer avec le premier chemin divergent en ordre lexicographique, le contenu attendu et le contenu observé.
18. SI un générateur cible un chemin hors de Frontière_Interne_de_Build, ALORS Validation_de_Fraîcheur DOIT bloquer l'écriture avec le chemin déclaré et le chemin résolu sans modifier la cible.

### Exigence 5 : contrats de contrôleur et identifiants de schéma canoniques

**User Story :** En tant que développeur Thermidor, je veux des contrats de contrôleur publiés avec des identifiants canoniques et des actions typées, afin que les consommateurs d'exécution valident les états et actions sans schéma alternatif.

#### Critères d'acceptation

1. LE Package_Thermidor_Schema DOIT publier Contrat_de_Liste_de_Produits dans API_Publique_Schema.
2. LE Package_Thermidor_Schema DOIT publier Contrat_de_Panier dans API_Publique_Schema.
3. LE Package_Thermidor_Schema DOIT publier le littéral ID_Schéma_Canonique `https://schema.thermidor.coveo.com/controllers/product-list.schema.json` pour Contrat_de_Liste_de_Produits.
4. LE Package_Thermidor_Schema DOIT publier le littéral ID_Schéma_Canonique `https://schema.thermidor.coveo.com/controllers/cart.schema.json` pour Contrat_de_Panier.
5. LE Package_Thermidor_Schema DOIT publier État_de_Liste_de_Produits dans API_Publique_Schema.
6. LE Package_Thermidor_Schema DOIT publier État_de_Panier dans API_Publique_Schema.
7. LE Package_Thermidor_Schema DOIT publier Charge_Utile_Set_Items dans API_Publique_Schema.
8. LE Package_Thermidor_Schema DOIT publier Charge_Utile_Update_Item_Quantity dans API_Publique_Schema.
9. LE Package_Thermidor_Schema DOIT publier Union_Discriminée_de_Contrôleurs avec ID_Schéma_Canonique comme discriminateur.
10. LORSQUE Validation_de_Contrat exécute une Fixture_de_Comportement_de_Schéma valide de Contrat_de_Liste_de_Produits, LA Validation_de_Contrat DOIT produire le résultat `accepté`.
11. LORSQUE Validation_de_Contrat exécute une Fixture_de_Comportement_de_Schéma invalide de Contrat_de_Liste_de_Produits, LA Validation_de_Contrat DOIT produire le résultat `rejeté` et un Diagnostic_de_Build de rejet.
12. LORSQUE Validation_de_Contrat exécute une Fixture_de_Comportement_de_Schéma valide de Contrat_de_Panier, LA Validation_de_Contrat DOIT produire le résultat `accepté`.
13. LORSQUE Validation_de_Contrat exécute une Fixture_de_Comportement_de_Schéma invalide de Contrat_de_Panier, LA Validation_de_Contrat DOIT produire le résultat `rejeté` et un Diagnostic_de_Build de rejet.
14. LORSQUE Validation_de_Contrat exécute une Fixture_de_Comportement_de_Schéma valide de Charge_Utile_Set_Items, LA Validation_de_Contrat DOIT produire le résultat `accepté`.
15. LORSQUE Validation_de_Contrat exécute une Fixture_de_Comportement_de_Schéma invalide de Charge_Utile_Set_Items, LA Validation_de_Contrat DOIT produire le résultat `rejeté` et un Diagnostic_de_Build de rejet.
16. LORSQUE Validation_de_Contrat exécute une Fixture_de_Comportement_de_Schéma valide de Charge_Utile_Update_Item_Quantity, LA Validation_de_Contrat DOIT produire le résultat `accepté`.
17. LORSQUE Validation_de_Contrat exécute une Fixture_de_Comportement_de_Schéma invalide de Charge_Utile_Update_Item_Quantity, LA Validation_de_Contrat DOIT produire le résultat `rejeté` et un Diagnostic_de_Build de rejet.
18. SI un Contrat_d_Exécution_de_Contrôleur expose un ID_Schéma_Canonique relatif ou différent de son Entrée_Schéma, ALORS Validation_de_Contrat DOIT échouer avec l'ID attendu et l'ID observé.
19. SI Union_Discriminée_de_Contrôleurs accepte une valeur dont ID_Schéma_Canonique ne correspond ni à Contrat_de_Liste_de_Produits ni à Contrat_de_Panier, ALORS Validation_de_Contrat DOIT échouer avec la valeur et le discriminateur observé.

### Exigence 6 : validation fixe du package construit et isolement des consommateurs

**User Story :** En tant que mainteneur de contrats, je veux valider le package réellement construit et empaqueté avec des données fixes, afin que la résolution d'exécution et les contrats publiés soient reproductibles sans dépendance aux outils internes.

#### Critères d'acceptation

1. LORSQUE Validation_Vitest_Fixe exécute une Entrée_Fixe de Validation_de_Schéma structurellement valide, LA Validation_Vitest_Fixe DOIT produire le résultat attendu `accepté`.
2. LORSQUE Validation_Vitest_Fixe exécute une Entrée_Fixe de Validation_de_Schéma structurellement invalide, LA Validation_Vitest_Fixe DOIT produire le résultat attendu `rejeté`.
3. LORSQUE Validation_Vitest_Fixe exécute des Entrées_Schéma fixes de Projection_TypeScript_Zod, LA Validation_Vitest_Fixe DOIT produire la Source_TypeScript_Générée attendue octet par octet.
4. LORSQUE Validation_Vitest_Fixe exécute une Entrée_Fixe de Validation_de_Fraîcheur contenant un artéfact attendu identique, LA Validation_Vitest_Fixe DOIT produire le résultat attendu `accepté`.
5. LORSQUE Validation_Vitest_Fixe exécute une Entrée_Fixe de Validation_de_Fraîcheur contenant une divergence, LA Validation_Vitest_Fixe DOIT produire le résultat attendu `rejeté` avec le premier chemin divergent en ordre lexicographique.
6. LORSQUE Validation_Vitest_Fixe exécute une Entrée_Fixe de Inventaire_d_Exports_Publiés identique aux exports définis par Référence_TypeScript_Externe, LA Validation_Vitest_Fixe DOIT produire le résultat attendu `accepté`.
7. LORSQUE Validation_Vitest_Fixe exécute une Entrée_Fixe de Inventaire_d_Exports_Publiés différente des exports définis par Référence_TypeScript_Externe sans approbation, LA Validation_Vitest_Fixe DOIT produire le résultat attendu `rejeté`.
8. LORSQUE Validation_Vitest_Fixe exécute chaque Fixture_de_Comportement_de_Schéma fixée, LA Validation_Vitest_Fixe DOIT produire le résultat attendu `accepté` ou `rejeté` défini par la fixture.
9. LORSQUE Validation_Vitest_Fixe exécute une Entrée_Fixe de Contrat_d_Exécution_de_Contrôleur, LA Validation_Vitest_Fixe DOIT produire le résultat attendu de la fixture pour Contrat_de_Liste_de_Produits ou Contrat_de_Panier.
10. LORSQUE Validation_Vitest_Fixe exécute une Entrée_Fixe de chaque ID_Schéma_Canonique publié, LA Validation_Vitest_Fixe DOIT produire le résultat attendu `accepté` pour les littéraux canoniques exacts.
11. LORSQUE Validation_de_Package commence avec Build_Schema échoué, LA Validation_de_Package DOIT échouer sans empaqueter Package_Thermidor_Schema.
12. LORSQUE Validation_de_Package commence avec Build_Schema réussi, LA Validation_de_Package DOIT empaqueter Package_Thermidor_Schema et résoudre l'import JavaScript exact `@coveo/thermidor-schema` depuis l'artefact empaqueté.
13. LORSQUE Validation_de_Package commence avec Build_Schema réussi, LA Validation_de_Package DOIT résoudre les déclarations TypeScript de l'import exact `@coveo/thermidor-schema` depuis l'artefact empaqueté.
14. LORSQUE Validation_de_Package inspecte l'artefact empaqueté après Build_Schema réussi, LA Validation_de_Package DOIT trouver Sortie_Dist dans l'artefact empaqueté.
15. SI Validation_de_Package résout une Entrée_Schéma, un Script_de_Projection, une Source_TypeScript_Générée ou une Référence_Interne depuis l'artefact empaqueté, ALORS Validation_de_Package DOIT échouer avec le chemin résolu.
16. LORSQUE Validation_Vitest_Fixe est exécutée deux fois avec les mêmes Entrée_Fixe, LA Validation_Vitest_Fixe DOIT produire les mêmes résultats, les mêmes Diagnostic_de_Build et le même statut de sortie.
17. LE Package_Thermidor_Schema DOIT conserver l'absence de test basé sur les propriétés dans Validation_Vitest_Fixe.
18. LORSQUE Validation_de_Contrat détecte une divergence, LA Validation_de_Contrat DOIT produire un Diagnostic_de_Build contenant la phase, l'artéfact, la valeur attendue, la valeur observée et la cause.

### Exigence 7 : handoff du consommateur et non-objectif Maven explicite

**User Story :** En tant que mainteneur d'un futur consommateur de contrats, je veux un handoff construit et isolé, afin que l'échantillon, les mocks et Thermidor utilisent des contrats publiés sans devenir propriétaires de la génération.

#### Critères d'acceptation

1. LE Package_Thermidor_Schema DOIT conserver un Contrat_de_Handoff_Consommateur.
2. LE Contrat_de_Handoff_Consommateur DOIT identifier Validation_de_Schéma réussie comme précondition de consommation.
3. LE Contrat_de_Handoff_Consommateur DOIT identifier Projection_TypeScript_Zod réussie comme précondition de consommation.
4. LE Contrat_de_Handoff_Consommateur DOIT identifier Validation_de_Fraîcheur de Source_TypeScript_Générée réussie comme précondition de consommation.
5. LE Contrat_de_Handoff_Consommateur DOIT identifier Build_Schema réussi comme précondition de consommation.
6. LE Contrat_de_Handoff_Consommateur DOIT identifier Validation_de_Fraîcheur de Sortie_Dist réussie comme précondition de consommation.
7. LE Contrat_de_Handoff_Consommateur DOIT identifier Validation_de_Contrat réussie comme précondition de consommation.
8. LE Contrat_de_Handoff_Consommateur DOIT identifier Validation_de_Package réussie comme précondition de consommation.
9. LE Contrat_de_Handoff_Consommateur DOIT identifier Inventaire_d_Exports_Publiés validé comme précondition de consommation.
10. LORSQUE un Consommateur_de_Build résout API_Publique_Schema, LE Consommateur_de_Build DOIT attendre chaque précondition réussie de Contrat_de_Handoff_Consommateur avant son build ou ses tests.
11. LORSQUE Échantillon_React_Contractuel devient un Consommateur_d_Exécution, L'Échantillon_React_Contractuel DOIT importer Contrat_de_Liste_de_Produits, Contrat_de_Panier et leurs ID_Schéma_Canonique exclusivement depuis l'API_Publique_Schema construite de `@coveo/thermidor-schema`.
12. LORSQUE Échantillon_React_Contractuel devient un Consommateur_d_Exécution, L'Échantillon_React_Contractuel DOIT consommer la Sortie_Dist de `packages/thermidor-schema/dist`.
13. LORSQUE Échantillon_React_Contractuel devient un Consommateur_d_Exécution, L'Échantillon_React_Contractuel DOIT conserver uniquement Préoccupation_d_Exécution_d_Échantillon comme propriété fonctionnelle.
14. SI un Consommateur_d_Exécution possède une Entrée_Schéma, un Script_de_Projection, une Source_TypeScript_Générée, une configuration de Package_Thermidor_Schema ou une autre Frontière_Interne_de_Build, ALORS Validation_de_Contrat DOIT échouer avec le consommateur et l'artéfact possédé.
15. SI une implémentation de Périmètre_Maven est proposée dans cette fonctionnalité, ALORS Validation_de_Contrat DOIT échouer avec l'artéfact Maven et le périmètre exclu.
16. LE Package_Thermidor_Schema DOIT conserver l'absence de module Maven.
17. LE Package_Thermidor_Schema DOIT conserver l'absence de source Java.
18. LE Package_Thermidor_Schema DOIT conserver l'absence de générateur Java.
19. LE Package_Thermidor_Schema DOIT conserver l'absence de dépendance Maven.
20. LE Package_Thermidor_Schema DOIT conserver l'absence de commande Maven.
21. LORSQUE une cible Maven ultérieure est demandée, L'Extension_Maven_Approuvée DOIT définir une fonctionnalité distincte ou une extension explicitement approuvée avant le partage des Entrées_Schéma.

### Exigence 8 : reproduction fidèle de la PR comme source de vérité

**User Story :** En tant que mainteneur de Thermidor, je veux que l'implémentation reproduise fidèlement le contenu de la PR externe, afin que chaque divergence soit traçable, justifiée et limitée aux adaptations autorisées.

#### Critères d'acceptation

1. LE Package_Thermidor_Schema DOIT implémenter Reproduction_Fidèle de Référence_TypeScript_Externe comme comportement par défaut de la création.
2. LORSQUE la création copie un fichier de Référence_TypeScript_Externe, LE Package_Thermidor_Schema DOIT conserver le contenu, la structure de répertoire et le nom de fichier de Référence_TypeScript_Externe sauf Adaptation_Nommée explicite.
3. LORSQUE la création copie un Script_de_Projection de Référence_TypeScript_Externe, LE Package_Thermidor_Schema DOIT conserver la logique, les imports et les paramètres du script sauf Adaptation_Nommée explicite.
4. LORSQUE la création copie une Entrée_Schéma de Référence_TypeScript_Externe, LE Package_Thermidor_Schema DOIT conserver le contenu JSON Schema identique octet par octet sauf Adaptation_Nommée explicite.
5. LORSQUE la création copie une fixture de validation de Référence_TypeScript_Externe, LE Package_Thermidor_Schema DOIT conserver la fixture identique sauf Adaptation_Nommée explicite.
6. LORSQUE la création copie une configuration de Build_Schema de Référence_TypeScript_Externe, LE Package_Thermidor_Schema DOIT conserver la configuration sauf Adaptation_Nommée explicite.
7. LE Package_Thermidor_Schema DOIT conserver un Registre_d_Adaptations listant chaque Adaptation_Nommée appliquée.
8. LORSQUE une Adaptation_Nommée est enregistrée, LE Registre_d_Adaptations DOIT contenir le nom unique, la Catégorie_d_Adaptation, la justification, le contenu externe original et le contenu adapté.
9. LE Package_Thermidor_Schema DOIT limiter chaque Adaptation_Nommée à exactement une Catégorie_d_Adaptation parmi Alignement_de_Version_Monorepo ou Intégration_Workspace_Monorepo.
10. SI une divergence entre Référence_TypeScript_Externe et le contenu reproduit n'appartient à aucune Catégorie_d_Adaptation définie, ALORS LA Porte_d_Approbation DOIT bloquer l'implémentation de cette divergence et exiger une approbation explicite avant toute modification.
11. LORSQUE Validation_de_Contrat inspecte le contenu reproduit, LA Validation_de_Contrat DOIT vérifier que chaque divergence par rapport à Référence_TypeScript_Externe correspond à une Adaptation_Nommée enregistrée dans Registre_d_Adaptations.
12. SI Validation_de_Contrat détecte une divergence sans Adaptation_Nommée correspondante dans Registre_d_Adaptations, ALORS LA Validation_de_Contrat DOIT échouer avec le chemin du fichier divergent, le contenu externe attendu et le contenu observé.
13. LE Registre_d_Adaptations DOIT classifier le remplacement de versions d'outils externes par les versions monorepo comme Alignement_de_Version_Monorepo.
14. LE Registre_d_Adaptations DOIT classifier les modifications de lockfile, workspace, champs `engines` et `packageManager` comme Intégration_Workspace_Monorepo.

### Exigence 9 : autorité des versions d'outillage monorepo

**User Story :** En tant que mainteneur du monorepo, je veux que le package de contrats utilise les versions d'outils épinglées du monorepo, afin que l'intégration ne fragmente pas les versions et que le build reste cohérent avec les autres packages.

#### Critères d'acceptation

1. LE Package_Thermidor_Schema DOIT utiliser Version_TypeScript_Monorepo depuis le catalogue pnpm pour sa dépendance TypeScript.
2. LE Package_Thermidor_Schema DOIT utiliser Version_Pnpm_Monorepo depuis le champ `packageManager` de la racine du monorepo.
3. LE Package_Thermidor_Schema DOIT utiliser Version_Node_Monorepo depuis le fichier `.nvmrc` de la racine du monorepo.
4. LORSQUE Référence_TypeScript_Externe déclare un champ `engines` avec une version de Node différente de Version_Node_Monorepo, LE Package_Thermidor_Schema DOIT remplacer ce champ par la contrainte de Version_Node_Monorepo.
5. LORSQUE Référence_TypeScript_Externe déclare un champ `packageManager` différent de Version_Pnpm_Monorepo, LE Package_Thermidor_Schema DOIT omettre ce champ et hériter de la configuration racine du monorepo.
6. LORSQUE Référence_TypeScript_Externe déclare une version de TypeScript différente de Version_TypeScript_Monorepo, LE Package_Thermidor_Schema DOIT utiliser Version_TypeScript_Monorepo via la résolution du catalogue pnpm.
7. LORSQUE Référence_TypeScript_Externe déclare une version d'un outil partagé du monorepo différente de la version monorepo, LE Package_Thermidor_Schema DOIT utiliser la version monorepo existante et enregistrer une Adaptation_Nommée de catégorie Alignement_de_Version_Monorepo.
8. LE Package_Thermidor_Schema DOIT conserver l'absence de modification de Package_Catalog résultant de l'ajout de Dépendance_Locale_de_Générateur.
9. LORSQUE Script_de_Projection requiert une Dépendance_Locale_de_Générateur absente de Package_Catalog, LE Package_Thermidor_Schema DOIT ajouter cette dépendance uniquement dans `packages/thermidor-schema/package.json` en tant que devDependency après approbation via Porte_d_Approbation.
10. SI une Dépendance_Locale_de_Générateur est ajoutée sans approbation enregistrée dans Porte_d_Approbation, ALORS LA Porte_d_Approbation DOIT refuser l'ajout et préserver État_Antérieur de `packages/thermidor-schema/package.json`.
11. SI Script_de_Projection utilise une fonctionnalité absente de Version_TypeScript_Monorepo, ALORS LE Package_Thermidor_Schema DOIT enregistrer une Incompatibilité_de_Version_Monorepo et obtenir une approbation via Porte_d_Approbation avant implémentation de l'adaptation.
12. SI Script_de_Projection utilise une fonctionnalité absente de Version_Node_Monorepo, ALORS LE Package_Thermidor_Schema DOIT enregistrer une Incompatibilité_de_Version_Monorepo et obtenir une approbation via Porte_d_Approbation avant implémentation de l'adaptation.
13. LE Package_Thermidor_Schema DOIT conserver l'absence de déclaration `packageManager` locale différente de la racine du monorepo.
14. LE Package_Thermidor_Schema DOIT conserver l'absence de fichier `.nvmrc` local différent de la racine du monorepo.
15. LORSQUE Validation_de_Contrat inspecte Package_Thermidor_Schema, LA Validation_de_Contrat DOIT vérifier que la version de TypeScript résolue correspond à Version_TypeScript_Monorepo.
16. LORSQUE Validation_de_Contrat inspecte Package_Thermidor_Schema, LA Validation_de_Contrat DOIT vérifier l'absence de champ `engines` ou `packageManager` local qui contredit les valeurs de la racine du monorepo.

### Exigence 10 : validation ponctuelle de conformité avec les contrats existants

**User Story :** En tant que mainteneur de Thermidor, je veux comparer la sortie de la reproduction dans `packages/thermidor-schema` aux contrats déjà présents dans `packages/thermidor-contracts`, afin de vérifier ponctuellement que la reproduction produit des contrats équivalents sans exiger une sortie identique octet par octet.

#### Critères d'acceptation

1. LORSQUE la reproduction est validée, LA Validation_de_Conformité_Spot DOIT comparer les exports et comportements de schéma de `packages/thermidor-schema/dist` aux exports et comportements existants dans `packages/thermidor-contracts/src/generated/catalog-contracts.ts`.
2. SI les exports communs de `packages/thermidor-schema/dist` divergent des exports correspondants de `packages/thermidor-contracts/src/generated/catalog-contracts.ts`, ALORS LA Validation_de_Conformité_Spot DOIT signaler chaque export divergent avec le nom, la valeur attendue et la valeur observée.
3. LORSQUE Validation_de_Conformité_Spot compare les noms de schéma exportés, LA Validation_de_Conformité_Spot DOIT vérifier que chaque nom de schéma Zod exporté par Référence_Contrats_Existante est également exporté par `packages/thermidor-schema/dist`.
4. LORSQUE Validation_de_Conformité_Spot compare le comportement d'acceptation et de rejet, LA Validation_de_Conformité_Spot DOIT vérifier que chaque Fixture_de_Comportement_de_Schéma produit le même résultat `accepté` ou `rejeté` lorsqu'elle est évaluée contre le schéma de Référence_Contrats_Existante et contre le schéma correspondant de `packages/thermidor-schema/dist`.
5. LORSQUE Validation_de_Conformité_Spot compare la compatibilité de types, LA Validation_de_Conformité_Spot DOIT vérifier que les types inférés des schémas de `packages/thermidor-schema/dist` sont assignables aux types correspondants de Référence_Contrats_Existante.
6. LA Validation_de_Conformité_Spot DOIT fonctionner comme une vérification ponctuelle d'implémentation et non comme une dépendance d'exécution de Graphe_de_Build.
7. LA Validation_de_Conformité_Spot DOIT tolérer des différences de formatage, d'ordre de propriétés et de version de TypeScript entre les deux packages sans signaler de faux positif.

## Stratégie de validation

Toutes les validations de cette fonctionnalité utilisent Vitest en exécution unique, des Entrée_Fixe versionnées et des résultats attendus fixés avant l'exécution. Les suites couvrent la validation des JSON Schema, la projection TypeScript/Zod, la fraîcheur de Source_TypeScript_Générée et de Sortie_Dist, l'inventaire des exports publiés, les fixtures d'acceptation et de rejet, les ID_Schéma_Canonique, les deux contrats de contrôleur, l'union discriminée, l'empaquetage et la résolution depuis l'artefact empaqueté, l'ordre du Graphe_de_Build, les frontières d'import, Audit_de_Compatibilité, la conformité de Reproduction_Fidèle et le Registre_d_Adaptations. Les suites n'utilisent aucun générateur aléatoire, aucune horloge, aucun accès réseau et aucun test basé sur les propriétés.

Les vérifications de package exécutent le flux dans l'ordre suivant : Validation_de_Schéma, Projection_TypeScript_Zod, Validation_de_Fraîcheur de Source_TypeScript_Générée, Build_Schema, Validation_de_Fraîcheur de Sortie_Dist, Validation_de_Contrat, puis Validation_de_Package. Un Consommateur_de_Build ne démarre qu'après la réussite de toutes les préconditions de Contrat_de_Handoff_Consommateur.

## Limites de cette spécification

Cette spécification ne modifie pas `thermidor-demo-react-a2ui-schema-contract`, ne modifie pas `packages/thermidor-contracts`, et ne crée aucun document de tâches. `thermidor-demo-react-a2ui-schema-contract` reçoit uniquement le Contrat_de_Handoff_Consommateur défini ici lors d'une modification future distincte. Aucun changement de code, dépendance, Package_Catalog, Lockfile, configuration de gestionnaire de packages, configuration de build ou Configuration_Externe n'est réalisé sans approbation explicite enregistrée dans Porte_d_Approbation.
