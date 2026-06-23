# SP Ventilation — site (maquette)

Site vitrine one-page pour SP Ventilation Sàrl. **100 % statique** : HTML + CSS + JavaScript, aucune installation, aucun build, aucune dépendance à installer.

---

## Lancer le site

**Le plus simple :** double-clique sur `index.html` → il s'ouvre dans ton navigateur.

**Recommandé (rendu 100 % fidèle)** : sers-le via un petit serveur local, ça évite les restrictions du mode `file://`.
```bash
# depuis le dossier du site :
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```
(ou l'extension « Live Server » de VS Code → clic droit sur index.html → Open with Live Server)

---

## Structure

```
sp-ventilation/
├── index.html              ← toute la page (contenu + structure)
└── assets/
    ├── styles.css          ← tout le design (couleurs, mise en page, animations)
    ├── main.js             ← interactions (smooth scroll, reveals au scroll, menu, formulaire)
    ├── vendor/lenis.min.js ← lib de smooth scroll (locale, rien à installer)
    ├── hero.jpg            ← image de fond du hero (le loft + gaines)
    ├── full-*.jpg          ← photos des prestations
    ├── proj-*.jpg          ← photos des réalisations
    ├── act-*.jpg           ← photos (entretien / dépannage / dégraissage)
    └── logos/              ← logos clients (CERN, CHUV, Coop, etc.)
```

---

## Modifier le contenu

- **Textes, titres, coordonnées, sections** : tout est dans `index.html`, lisible et commenté (`<!-- ===== SECTION ===== -->`).
- **Téléphone / email / WhatsApp** : cherche `0800 000 175`, `contact@sp-ventilation.ch`, `wa.me/41796949554` dans `index.html`.
- **Image du hero** : remplace `assets/hero.jpg` par une autre image (même nom) → c'est fait.
- **Logos / photos** : remplace les fichiers dans `assets/` (garde les mêmes noms), ou change les `src=""` dans `index.html`.

## Modifier le design

Presque tout est piloté par des **variables CSS** en haut de `assets/styles.css` (bloc `:root`) :
- `--accent` (#3E9FE6) = la couleur bleue de la marque (boutons, accents). Change-la, tout suit.
- `--accent-deep` (#1E72B8) = la version lisible du bleu sur fond clair.
- `--bg-page`, `--surface-*` = les fonds sombres (hero, contact, footer).
- `--light-bg`, `--light-surface-*`, `--ink-*` = le thème clair (sections du milieu).
- Polices : **Clash Display** (titres) + **General Sans** (texte), chargées depuis Fontshare (voir ci-dessous).

Le site alterne **sections sombres** (hero, band, contact, footer) et **sections claires** (logos, entreprise, prestations, réalisations, pourquoi, agences). Une section devient claire en ajoutant la classe `lt` à sa balise `<section>`.

## Animations

- **Smooth scroll** : librairie Lenis (`assets/vendor/lenis.min.js`), initialisée dans `main.js`.
- **Apparitions au scroll** : attribut `data-anim` (`rise`, `clip-up`, `focus`, `float-in`…) + IntersectionObserver dans `main.js`. Les valeurs/timings sont dans `styles.css` (bloc `[data-anim]`).
- **Respect de l'accessibilité** : si l'utilisateur a activé « réduire les animations » dans son OS, tout le mouvement est désactivé automatiquement (`prefers-reduced-motion`).
- Si Lenis ne charge pas, le site reste 100 % fonctionnel en scroll natif (dégradation propre).

---

## ⚠️ À savoir avant une mise en production

1. **Formulaire de contact** : il est en **démo** (pas de back-end). Pour qu'il envoie vraiment, branche-le sur un service (Formspree, Netlify Forms, un endpoint email…) dans `main.js` (fonction du `submit`).
2. **Images & logos** : récupérés depuis le site actuel sp-ventilation.ch pour la maquette. Pour la prod, utilise des visuels dont SP Ventilation détient les droits.
3. **Badge « MEMBRE SIA »** : présent dans le hero (repris d'une référence visuelle). À **vérifier / corriger** selon les vraies certifications de l'entreprise (SICC / suissetec sont souvent plus pertinents pour la ventilation).
4. **Retirer les marqueurs de démo** dans `index.html` : le bandeau `class="demo-badge"` (en bas) et la mention « Maquette de refonte — proposée par … » dans le `footer`.
5. **Polices** : chargées depuis `api.fontshare.com` (nécessite internet). Pour un site 100 % autonome, télécharge les fichiers de police et héberge-les localement (puis remplace le `<link>` Fontshare dans `index.html` par un `@font-face`).
6. **Hébergement** : étant 100 % statique, il se met en ligne gratuitement en 2 min sur **Netlify**, **Vercel** ou **GitHub Pages** (glisser-déposer le dossier).

---

Maquette de départ. Libre à toi de la reprendre et de l'améliorer.
