# [Lifted Subaru](https://liftedsubaru.github.io)
An archive for subaru offroading enthusiasts.

Found this helpful?

[![Donate a buck](https://img.shields.io/badge/☕-Buy%20me%20a%20coffee-blue.svg)](https://www.paypal.me/devgorilla/1)

## Features
Searchable tiling for articles linked to raw sources with a PDF archive of the thread or build writeup.

Renderer Directory builds the static files from configs and handlebars templates

Create a sitemap and update file via www.xml-sitemaps.com

```

  cd renderer
  node index.js <-- builds html from json found in renderer/detail-pages

```

I'm doing it this way to keep the site free and static serving from Github Pages

## Detail Pages Config Format

```
{
  "title": "title with spaces and thing's",
  "description": "title with spaces and thing's",
  "category":"ea82",
  "url": "title with spaces and shit's",
  "author": "Loyale 2.7 Turbo",
  "author_link": "https://www.ultimatesubaru.org/forum/profile/13502-loyale-27-turbo",
  "original_url": "https://www.google.com",
  "archive_url": "/static/archive",
  "img":"",
  "content": "<p> stuff stuff stuff</p>"
}

```
