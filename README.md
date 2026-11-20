# Mustafa Umut Ozbek | Academic and engineering portfolio

This directory is a standalone GitHub Pages site. Open `index.html` to preview it locally. The site uses HTML, CSS, a small script for the opening scroll transition, and local image assets.

## Publish

Publish the contents of this directory at the root of the `mumutozbek/mumutozbek.github.io` repository, including `.nojekyll`. In repository settings under **Pages**, select **Deploy from a branch**, `main`, and `/ (root)`. Check that the Pages deployment succeeds before sharing the URL.

The canonical URLs, social preview, profile structured data, and sitemap assume `https://mumutozbek.github.io/`. Update them together if the public hostname changes.

## Content and assets

The public profile and CV reflect graduate research, nuclear engineering, teaching, and general industry experience. Publication and teaching details were checked against the public LinkedIn profile, arXiv, and conference materials.

- `assets/plant.jpg`: ImageGen illustration of a fictional civilian nuclear plant exterior across a lake at dusk.
- `assets/portrait.jpg`: Local high-resolution copy of the current LinkedIn portrait.
- `assets/cascon-toronto.jpg`: Solo photo from IEEE CASCON 2026 in Toronto.
- `assets/advanced-test-reactor-core.jpg`: Resized [Advanced Test Reactor core photograph](https://commons.wikimedia.org/wiki/File:Advanced_Test_Reactor.jpg), Argonne National Laboratory, [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/). Used as reference photography, not as an image of the author's simulation.
- `assets/qinshan-plant-training.jpg` and `assets/daya-bay-plant-training.jpg`: Resized solo plant-training photos from the author's collection.
- `assets/chalk-river-museum-portrait.jpg`: Portrait from the author's [LinkedIn post](https://www.linkedin.com/posts/mustafaumutozbek_candu-nuclearenergy-ugcPost-7526851310755905536-dFxi/) of the Canadian Nuclear Heritage Museum stop during the Chalk River trip.
- `assets/core-cutaway.webp`: Built-in image generation, a conceptual reactor cutaway for the academic index. Prompt: a landscape scientific illustration with an anonymous reactor core, simplified channels, silver vessel, and qualitative thermal colors, without dimensions, numerical results, labels, or plant-specific geometry.
- `assets/control-room-visit.webp`: Solo training photo from the author's local collection.
- `assets/recording-aware-results.webp` and `assets/recording-aware-preview.webp`: Figure 2 and panel 2a from the author's [recording-aware evaluation preprint](https://arxiv.org/abs/2610.24128), showing window-size sensitivity across evaluation protocols.
- `assets/ontario-tech-teaching.webp`: Solo simulator lab photo from the author's [Ontario Tech course-session post](https://www.linkedin.com/feed/update/urn:li:activity:7469888368735281152/).
- `assets/unoda-youth-leader.webp`: Solo portrait from the author's [UNODA study-visit recap](https://www.linkedin.com/feed/update/urn:li:activity:7479005596520697856/).
- `assets/iaea-icons-2024.webp`: Solo portrait from the author's [ICONS 2024 recap](https://www.linkedin.com/posts/mustafaumutozbek_icons2024-iaea-icons2024-activity-7199138746045255682-WIay), matched to the local original.

The Experience page links to the author's original Chalk River recap, the museum photo post, Ontario Tech's program coverage, and the public IEEE ACSAC workshop agenda. Project experience names the Akkuyu site and project, without implying direct employment by the plant.

When `cv.html` changes, regenerate `assets/mustafa-umut-ozbek-cv.pdf` with the browser's print-to-PDF option using Letter paper and disabled browser headers and footers. The public CV shares an academic email address and public profile links.

The homepage declares the site and the author's profile as structured data. Each content page has a self-referencing canonical and a plain HTML link from the site. For Google Search Console, use the URL-prefix property `https://mumutozbek.github.io/`, submit `sitemap.xml`, and inspect the live URLs and indexing status separately. The sitemap does not guarantee indexing.

Keep the Google Search Console verification HTML file at the site root, even after ownership is verified. It is not an indexable content page and is not listed in the sitemap.
