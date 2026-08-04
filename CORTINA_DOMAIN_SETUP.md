# Cortina domain setup

The public payment route is `/pay?machine=<public_machine_token>`. Configure the production host to rewrite `/pay` to `index.html` so direct browser visits load the React app.

## iOS

Deploy `public/.well-known/apple-app-site-association` at:

`https://cleanstreamlaundry.com/.well-known/apple-app-site-association`

It must return HTTP 200 with `application/json` and no redirect. The checked-in app ID uses Apple Team ID `3843FZGZ7T` and the current production bundle ID `com.cleanstreamlaundrysolutions.clenaStreamLaundryApp`.

## Android

1. Obtain the SHA-256 fingerprint for every production Play/App Signing certificate.
2. Replace the placeholder in `assetlinks.json.template`.
3. Deploy the completed file as `public/.well-known/assetlinks.json`.
4. Confirm it returns HTTP 200 with `application/json` and no redirect.

Do not deploy the placeholder file. Android verified links remain incomplete until the release fingerprint is supplied.
