# Cortina domain setup

The public payment route is `/pay?machine=<public_machine_token>`. Configure the production host to rewrite `/pay` to `index.html` so direct browser visits load the React app.

## iOS

Deploy `public/.well-known/apple-app-site-association` at:

`https://cleanstreamlaundry.com/.well-known/apple-app-site-association`

It must return HTTP 200 with `application/json` and no redirect. The checked-in app ID uses Apple Team ID `3843FZGZ7T` and the current production bundle ID `com.cleanstreamlaundrysolutions.clenaStreamLaundryApp`.

## Android

The deployed `public/.well-known/assetlinks.json` currently contains the Clean Stream test-build certificate so the connected Samsung can verify `/pay` during live-device testing.

Before the Play release:

1. Obtain the SHA-256 fingerprint for every production Play/App Signing certificate.
2. Add each production fingerprint to `sha256_cert_fingerprints` without removing the test fingerprint until device testing is complete.
3. Confirm the file returns HTTP 200 with `application/json` and no redirect.
4. Remove the test fingerprint after production builds have replaced the test build on field devices.
