# SEO baseline P0 — websituation.ch

- **Date de la mesure** : 2026-11-03 (matin, heure de Genève)
- **Dépôt** : `Magaligator/Websituation` (privé), commit `9bd598b` du 2026-10-26, copie locale propre (aucune modification)
- **Production** : Vercel (région fra1), domaine canonique `https://www.websituation.ch`
- **Méthode** : `curl` sur le site en ligne + `grep` / script d'audit sur les 53 fichiers HTML du dépôt. Aucun fichier du site n'a été modifié.
- **Plan de référence** : `SEO-PLAN-websituation-3D.md` (audit du 3 novembre 2026, objectif « création de site internet 3D (Suisse) »). Le fichier a été fourni après la première mesure. La section 10 compare le plan et le constat.

## 1. Structure du dépôt

| Élément | Constat |
|---|---|
| Type de site | Statique pur HTML (aucun framework, pas de build) + 1 fonction Vercel `api/contact.js` (Resend) |
| Pages | 53 fichiers HTML : 27 FR à la racine, 26 EN dans `en/` (dont 2 pages 404) |
| Assets | `assets/site.min.css` (72 Ko), `assets/app.js` (19 Ko), `assets/img/` (241 fichiers AVIF/WebP), polices locales |
| Templates | Aucun : chaque page est un HTML autonome (pas de partials, donc une correction transversale se fait sur 53 fichiers) |
| Fichiers SEO | `robots.txt`, `sitemap.xml`, `llms.txt`, `vercel.json` (34 redirections, 1 rewrite, en-têtes de sécurité, cache `/assets/` 1 an) |
| Dossier `docs/` | Créé avec ce fichier (n'existait pas) |
| Plan 3D | Aucune page, aucun asset ni code 3D dans ce dépôt |

## 2. Domaine, HTTPS, redirections (live)

| Test | Résultat |
|---|---|
| `https://websituation.ch/` | 308 vers `https://www.websituation.ch/` |
| `http://www.websituation.ch/` | 308 vers HTTPS |
| `https://www.websituation.ch/` | 200, `text/html`, HSTS 2 ans |
| `/index.html` et `/en/index.html` | 308 vers `/` et `/en/` |
| `/en` (sans slash final) | 200 (pas de redirection) |
| URLs sans `.html` (`/services`, `/en/services`) | 404 (le site vit sur des URLs en `.html`) |
| Anciennes URLs Wix (`/blog`, `/nos-services`, …) | 308 vers les nouvelles pages (34 règles) |
| URL inconnue | 404 avec une page dédiée (`noindex,follow`) |
| En-têtes de sécurité | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS présents |
| Live vs dépôt | Accueil FR, accueil EN, `sitemap.xml` et `robots.txt` identiques au dépôt (aucune dérive de déploiement) |

## 3. robots.txt (live, identique au dépôt)

- `User-agent: *` : `Allow: /`, `Disallow: /api/`, `Disallow: /404.html`
- Robots IA de recherche et de citation autorisés nommément : OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User
- Robots d'entraînement (GPTBot, Google-Extended, Applebot-Extended) non nommés : ils suivent la règle générale (autorisés)
- `Sitemap: https://www.websituation.ch/sitemap.xml` déclaré
- `/llms.txt` : 200 (présent, 3 Ko)

## 4. sitemap.xml (live, identique au dépôt)

| Contrôle | Résultat |
|---|---|
| Content-Type | `application/xml`, 200 |
| Nombre d'URLs | 51, aucun doublon |
| Statut live des 51 URLs | 51 sur 51 en 200 |
| hreflang | 150 balises `xhtml:link` (3 par URL : fr, en, x-default) |
| `lastmod` | 3 valeurs : 2026-10-21, 2026-10-23, 2026-10-26 |
| Canonical de la page = `<loc>` | Oui pour les 51 |
| hreflang de la page = hreflang du sitemap | Oui pour 50 sur 51 (voir anomalie A1) |
| Pages hors sitemap | `404.html`, `en/404.html` (normal) et `blog-chatgpt-vs-gpt-openai.html` (servi sous une autre URL, voir A1) |
| Image sitemap | Namespace déclaré, mais pas d'`image:image` utilisé |

## 5. Accueil FR (`/`) et EN (`/en/`)

| Élément | FR | EN |
|---|---|---|
| `<html lang>` | `fr` | `en` |
| `<title>` | « Agence web et marketing digital à Genève \| Websituation » | « Web and digital marketing agency in Geneva \| Websituation » |
| Meta description | présente, dans la limite | présente, dans la limite |
| Canonical | `https://www.websituation.ch/` | `https://www.websituation.ch/en/` |
| hreflang | fr, en, x-default (réciproques) | identiques, x-default vers FR |
| Meta robots | `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1` | idem |
| Open Graph | complet : type, site_name, title, description, url, locale `fr_CH`, image 1200×630 + alt | idem, locale `en_GB` |
| Twitter Card | `summary_large_image` complet | idem |
| H1 | 1 (« Sites web à Genève qui … », mot rotatif) | 1 |
| JSON-LD | 1 bloc valide, `@graph` : Organization+ProfessionalService (`#org`), Person (`a-propos.html#magali`), WebSite (`#website`), WebPage (`#webpage`) | idem avec `/en/#webpage` |

## 6. Contrôles sur l'ensemble des 53 pages

| Contrôle | Résultat |
|---|---|
| Canonical (1 par page) | 53 sur 53 |
| `<title>` et description (1 par page) | 53 sur 53, aucun doublon |
| H1 unique | 53 sur 53 |
| Images sans `alt` | 0 |
| Liens internes cassés | 0 |
| JSON-LD présent | 51 sur 53 (absent des 2 pages 404, normal) ; tous les blocs sont du JSON valide |
| Types schema.org | Organization, ProfessionalService, Person, WebSite, WebPage, BreadcrumbList, FAQPage, Service, BlogPosting, CollectionPage, ItemList, ContactPage, AboutPage, CreativeWork |
| Titres supérieurs à 60 caractères | 1 : `blog-site-internet-ere-ia.html` (61) |
| Descriptions hors 70–160 caractères | `blog-site-internet-ere-ia.html` (181) ; les 2 pages 404 (42 et 43, sans conséquence) |
| Analytics / tracking | Aucun script GA4, GTM, Plausible, Clarity ni Meta Pixel détecté |
| Google Search Console | Balise `google-site-verification` présente sur l'accueil |

## 7. Anomalies et points à traiter

| # | Constat | Gravité | Détail |
|---|---|---|---|
| A1 | Article « ChatGPT vs GPT OpenAI » sans version EN ni hreflang réciproque | Moyenne | `blog-chatgpt-vs-gpt-openai.html` est servi par un rewrite sous `/post/difference-entre-chat-gpt-et-gpt-openai-un-guide-essentiel` (ancienne URL Wix). Le sitemap n'y met que l'URL `/post/…`, sans balises hreflang. La page n'a qu'1 hreflang. Les 25 autres paires FR/EN sont complètes. |
| A2 | Aucune mesure d'audience | Moyenne | Aucun analytics détecté : impossible de mesurer trafic, conversions ou clics avant/après (voir la note « analytics en attente » de la mémoire du 22/10). |
| A3 | `/en` sans slash final répond 200 | Faible | Deux URLs répondent pour la même page (`/en` et `/en/`). Le canonical limite le risque. |
| A4 | Titre de 61 caractères et description de 181 caractères sur `blog-site-internet-ere-ia.html` | Faible | Risque de troncature dans les résultats Google. |
| A5 | `lastmod` figé (21/10, 23/10, 26/10) | Faible | À tenir à jour à chaque vraie modification. |
| A6 | Namespace `image:` déclaré dans le sitemap mais inutilisé | Faible | Soit l'exploiter, soit le retirer. |
| A7 | Aucun template partagé (53 HTML autonomes) | Information | Toute correction transversale (balises, schema, nav) doit être scriptée ou répétée sur 53 fichiers. |


## 8. Performance — Lighthouse 12.8.2, mobile émulé, site en ligne

| Mesure | Accueil `/` | `creation-site-internet-geneve.html` | Seuil du plan |
|---|---|---|---|
| Performance | **83** | 98 | ≥ 85 |
| Accessibilité | 96 | 100 | |
| Bonnes pratiques | 100 | 100 | |
| SEO | 100 | 100 | |
| FCP | 1,8 s | 1,4 s | |
| **LCP** | **3,7 s** | 2,2 s | ≤ 2,5 s |
| TBT (proxy de l'INP) | 270 ms | 0 ms | INP ≤ 200 ms (non mesurable en lab) |
| CLS | 0 | 0,003 | ≤ 0,1 |
| Poids total | 494 Ko | 276 Ko | |
| Requêtes | 13 | 11 | |
| Ressource bloquante | `site.min.css` (une seule) | idem | |
| Élément LCP | un paragraphe `p.lead` du héro | l'image de couverture du service (AVIF) | |
| Échecs d'audit | contraste des couleurs, nom accessible différent du libellé visible | nom accessible différent du libellé visible | |

Lecture : le site est léger (moins de 500 Ko, un seul CSS bloquant, aucun JS lourd). L'accueil est pourtant **hors seuil sur le LCP (3,7 s)** et sous 85 sur la performance, alors que c'est la page qui devra recevoir la 3D. La mesure est en lab (une seule exécution) : les données terrain CrUX et une moyenne de plusieurs passes restent à relever.

## 9. Hors périmètre de cette P0 (non mesuré)

- Core Web Vitals terrain (CrUX) et INP réel : le lab Lighthouse est en section 8, le terrain reste à relever.
- Données Search Console (indexation, requêtes, positions) : accès à confirmer.
- Positionnement actuel sur « agence web Genève », « création site internet Genève », « référencement SEO Genève » : à relever.
- Backlinks et Google Business Profile.
- Rendu des pages avec JavaScript (le contenu est en HTML statique, donc risque faible).
- Export Search Console 3 mois, propriété domaine, soumission du sitemap (accès requis, voir section 10).

## 10. Rapprochement avec le plan `SEO-PLAN-websituation-3D.md`

### Étapes P0 du plan

| Étape du plan | État |
|---|---|
| `robots.txt`, `sitemap.xml`, hreflang / JSON-LD / canonical sur l'accueil | Fait (sections 3 à 5) |
| `Sitemap:` dans `robots.txt` et toutes les URL FR + EN avec hreflang | Fait : 51 URLs, 50 paires complètes, voir A1 |
| hreflang réciproques + x-default sur chaque paire | Fait : OK sauf l'article GPT (A1) |
| Lighthouse mobile accueil + service création | Fait (section 8) |
| Corriger l'URL `/post/difference-entre-chat-gpt-…` | **Non fait : modification du site en attente de ta validation** |
| Export Search Console, propriété domaine, soumission du sitemap | **Non fait : demande un accès à ton compte Google** |
| « Done quand » : `docs/seo-baseline.md` avec les valeurs avant modifications | Atteint, sous réserve des deux lignes ci-dessus |

### Écarts entre le plan et ce que j'ai vérifié

| Sujet | Le plan dit | Constat |
|---|---|---|
| Item 6 : URL `/post/…` | « vestige probable d'une ancienne plateforme : vérifier redirections / canonical » | Ce n'est pas une redirection cassée. Le fichier `blog-chatgpt-vs-gpt-openai.html` est servi à l'URL `/post/…` par un **rewrite** Vercel (200), le canonical pointe sur cette URL `/post/…`, et le sitemap et `blog.html` l'utilisent aussi. La page est cohérente, mais elle n'a ni version EN ni hreflang réciproque. Option A : rewrite remplacé par une redirection 301 vers `/blog-chatgpt-vs-gpt-openai.html` avec canonical, sitemap et liens alignés. Option B : on garde l'URL `/post/…` (elle a de l'ancienneté) et on ajoute la paire EN. À toi de choisir. |
| GA4 | « Vérifier GA4 + événements `contact_click`, `rdv_submit` » (P5) | Aucun script GA4, GTM ni autre outil de mesure n'est installé. Les événements `contact_click` et `rdv_submit` n'existent donc pas. |
| Balises de base | « propres sur toutes les pages auditées » | Confirmé sur les 53 pages. |
| Cube du héro | « savoir-faire 3D jamais décrit » | Le cube est en **CSS 3D** (`transform-style: preserve-3d`), pas du WebGL ni du Three.js. Aucun `<canvas>` sur le site. C'est à connaître avant de le présenter comme preuve d'un savoir-faire « Three.js / WebGL » (voir TODO(client) du plan). |
| Mentions de la 3D | Aucune | Confirmé : 2 pages (les accueils FR et EN) contiennent « 3D », uniquement dans le texte d'aide du cube. |
| Blog | 6 articles, aucun sur la 3D | Confirmé : 6 articles. |
| Chiffres de l'accueil | « +50 », « 100 % », « 30 % » non étayés | Présents sur l'accueil. Le plan demande de ne pas inventer de preuves : ils devront être justifiés par toi. |
| Risque LCP du héro | Risque à mesurer | Confirmé : LCP 3,7 s sur l'accueil, hors du seuil de 2,5 s, avant même l'ajout de 3D (section 8). |

### Points qui nécessitent ta décision avant la P1

1. Sort de l'URL `/post/…` (option A ou B ci-dessus).
2. Accès Search Console (export 3 mois, soumission du sitemap), ou export CSV de ta part.
3. Prix, délais, technologies maîtrisées et projet 3D de preuve (les `TODO(client)` du plan, section 5). Sans eux, la page P1 sera publiée avec des `TODO(client)` visibles dans le source.

## 11. Corrections appliquées à la fin de la P0 (branche `seo-3d`, non déployées)

| Correction | Détail | Effet mesuré (Lighthouse mobile, accueil, 3 passes, serveur local compressé en Brotli) |
|---|---|---|
| Images sous le héro | `magalai-dev-desktop.jpg` (199 Ko) avait `fetchpriority="high"` sans `lazy` ; les 2 images print n'étaient pas en `lazy`. Corrigé sur `index.html` et `en/index.html`. | Cause principale du LCP : avant, 4,4 s (local sans compression) ; après, 3,0 à 3,1 s |
| Héro visible au premier rendu | `.hero .rv` n'est plus à `opacity:0` en attendant le JS ; animation de translation seule, désactivée si `prefers-reduced-motion`. | Aucun gain mesurable seul, gain de robustesse |
| Version des assets | `?v=u25` remplacé par `?v=u26` sur les 53 pages (les assets sont en cache immuable 1 an). | |
| URL de l'article GPT (option A du plan) | Le rewrite `/post/…` est remplacé par une redirection permanente vers `/blog-chatgpt-vs-gpt-openai.html`. Les 6 redirections Wix qui visaient `/post/…` pointent directement sur la nouvelle URL (pas de chaîne). Canonical, `og:url`, JSON-LD, sitemap et `blog.html` alignés. | À vérifier en production après déploiement |
| **Résultat accueil** | | Performance **97**, LCP **2,5 à 2,6 s**, FCP 1,5 s, TBT 0 ms, CLS 0 (contre 83 et 3,7 s en production avant correction) |

Réserve : le LCP est tout juste à la limite de 2,5 s en lab. La mesure officielle reste celle de la production après déploiement. L'article GPT reste sans version EN (aucun hreflang, ce qui est valide pour une page unique en français).

## 12. P1 — page service 3D (branche `seo-3d`, non déployée)

| Livrable | Détail |
|---|---|
| Page FR | `creation-site-internet-3d-suisse.html` : title « Création de site internet 3D en Suisse \| Websituation » (53 car.), description de 131 car., H1 unique, 9 sections H2 conformes au plan, sommaire, « À retenir », FAQ de 8 questions (environ 1 180 mots avec la FAQ) |
| Page EN | `en/3d-website-design-switzerland.html` : title 47 car., description 108 car., mêmes sections et FAQ (environ 1 050 mots) |
| Balises | canonical, hreflang fr / en / x-default réciproques, Open Graph et Twitter (image `og-image.png` existante), lien de langue FR ↔ EN |
| JSON-LD | `Service` (fournisseur = l'`Organization` existante, `areaServed` = pays Suisse), `BreadcrumbList`, `FAQPage`, `WebPage`, plus le graphe commun Organization, Person, WebSite. Blocs valides. |
| Sitemap | 53 URLs (+2), 156 balises hreflang, réciprocité contrôlée, `lastmod` du 2026-11-03 pour les pages modifiées |
| `llms.txt` | Ligne ajoutée dans les services |
| Maillage entrant | Lien dans le pied de page des 55 pages ; phrase de contexte sur l'accueil FR et EN, `services`, `creation-site-internet-geneve`, `site-vitrine-responsive-geneve`, `site-ecommerce-geneve` et `referencement-seo-geneve` (FR et EN). Soit 6 liens contextuels par langue, hors pied de page. |
| Maillage sortant | Création Genève, site vitrine, e-commerce, SEO, abonnements, contact, accueil, études de cas |
| Contrôle global | 55 pages : 0 titre ou description en double, 0 lien interne cassé, 1 seul H1, 0 image sans `alt`, tous les JSON-LD valides |
| Lighthouse mobile (serveur local compressé) | Page FR : performance 97, accessibilité 100, SEO 100, LCP 2,4 s, CLS 0,003, TBT 0 ms. Page EN : performance 97, LCP 2,6 s. |

### Ce qui n'est pas fait, par choix

- **Aucune donnée inventée** : pas de prix, de délai, de résultat, de client ni de technologie nommée. Chaque manque est un commentaire `TODO(client)` dans le source (4 par page) et n'apparaît pas à l'écran.
- **Texte légal** (mentions, confidentialité) non touché.
- **Titre et H1 de l'accueil** non modifiés : c'est la P2 du plan, qui touche le positionnement de la marque.
- **Test des résultats enrichis Google** : à lancer sur l'URL publiée (l'outil exige une page en ligne).
- **Objectif de 8 liens entrants contextuels** (P2) : 6 en place, hors pied de page.

### TODO(client) à fournir

1. Fourchettes de prix d'un site 3D et délais habituels (section « Combien coûte… »).
2. Au moins un projet 3D, client ou démo propre à l'agence, avec capture, technologies et résultats (section « Un exemple de 3D… »). Aujourd'hui seul le cube de l'accueil est cité, comme exemple de 3D en CSS.
3. Technologies réellement maîtrisées (Three.js, Spline, WebGL, autre) et qui produit les modèles 3D.
4. Résultats mesurés sur un projet 3D (section « Ce que la 3D apporte »).
5. Justification des chiffres de l'accueil « +50 structures », « 100 % satisfaits », « 30 % de temps gagné ».
6. Nouveaux avis Google.


## 13. P2, P3 et GEO : état au 16 novembre 2026 (branche `modifs-site`)

| Tâche du plan | État | Preuve |
|---|---|---|
| Accueil : 3D dans le title, la description et le sous-titre (FR/EN), sans toucher au H1 « Genève » | Fait | `index.html`, `en/index.html` |
| Étude de cas 3D (projet vitrine propre à l'agence : le cube de l'accueil), FR/EN | Fait | `etude-de-cas-cube-3d-websituation.html`, `en/case-study-websituation-3d-cube.html`, bandeau dans `sites.html` / `en/websites.html` |
| Guide blog « créer un site internet 3D » (1 500+ mots FR), FR/EN | Fait | `blog-creer-site-internet-3d.html`, `en/blog-create-3d-website.html` |
| 3 articles satellites (SEO, configurateur, prix), FR/EN | Fait | `blog-site-3d-seo.html`, `blog-configurateur-3d-produit.html`, `blog-prix-site-internet-3d-suisse.html` et versions `en/` |
| `blog.html` : intro et cartes 3D (FR/EN) | Fait | `blog.html`, `en/blog.html` |
| Page 3D : liens vers guide, satellites, étude de cas, prix ; `TODO(client)` retirés | Fait | `creation-site-internet-3d-suisse.html`, `en/3d-website-design-switzerland.html` |
| Maillage : au moins 8 liens contextuels vers la page 3D | Fait | 6 pages de services + guide, 3 satellites, étude de cas, blog |
| Sitemap, hreflang, JSON-LD (BlogPosting/Article, FAQPage, BreadcrumbList) des 10 nouvelles pages | Fait | `sitemap.xml` (63 URL), pages `blog-*3d*`, validation 0 erreur |
| `Organization` : `hasMap` (fiche Google) ajouté, `sameAs` conservé | Fait | JSON-LD de toutes les pages |
| `llms.txt` : nouvelles pages FR/EN | Fait | `llms.txt` |
| P3 : canvas différé, glTF/Draco | Sans objet | le cube est en CSS 3D, sans canvas ni modèle (voir l'étude de cas) |
| P3 : `prefers-reduced-motion`, texte hors de la scène, repli | Fait pour le cube | `assets/app.js`, étude de cas |
| Chiffres de l'accueil : « 30 % » et « 100 % » justifiés par une note, repère externe Picmim 2026 | Fait | notes sous les chiffres de l'accueil et de À propos (FR/EN) ; « +50 structures » reste à justifier |
| P4 : fiche Google Business, annuaires, backlinks, avis | À faire (hors site) | actions de la propriétaire de la fiche |
| P0/P1/P5 : Search Console (export, envoi du sitemap), test des résultats enrichis, GA4, suivi, tests moteurs IA | À faire (hors dépôt) | après mise en ligne |

Contrôle automatique du dépôt (66 pages) : un seul H1, titres et descriptions uniques, JSON-LD valides, 0 lien interne cassé, 0 image sans `alt`, hreflang réciproques, toutes les pages dans le sitemap. L'article « vitesse » (`blog-vitesse-site-internet.html`) n'est pas inclus : son hreflang EN pointe vers une page inexistante.
