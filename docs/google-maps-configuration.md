# Google Maps runtime configuration

The browser obtains its Maps key from `/maps-config.json` at startup. Both map
integrations use this runtime value. Real keys must not be embedded in source,
environment variables compiled into JavaScript, or committed build files.

For development, copy `maps-config.example.json` to `public/maps-config.json`
and enter a separate key restricted to the local origin. This file and
`dist/maps-config.json` are ignored by Git. Do not package local runtime config.

Production keeps the file outside the web root at
`/data/configs/admin.g-hoost.com/maps-config.json`. Nginx serves it through an
exact `/maps-config.json` location with `Cache-Control: no-store`. A new `dist`
deployment must preserve this file and the existing `config.json`.

Run `npm run check:maps-secrets` before publishing. Production builds run it
automatically and fail if a Google API key literal is found in publishable files
or a runtime configuration file has been tracked.

Browser keys remain visible in network requests. Runtime configuration keeps
them out of Git; it is not encryption or access control. In Google Cloud,
restrict the production key to `https://admin.g-hoost.com/*` and to Maps
JavaScript API, Places API (New), and Geocoding API. Inspect actual usage before
restricting or replacing production keys.

Current-file removal does not remove old commits, cached GitHub views, forks,
or existing clones. Historical exposure needs separate cleanup, and key
restrictions remain necessary after cleanup.
