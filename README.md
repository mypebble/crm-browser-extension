# Magni Chrome Extension

Copyright S/F Software t/a PEBBLE 2017 All Rights Reserved.

This is the browser extension for Magni.

It adds access for certain functions

## Building

The extension is built using gulp. Run one of the following depending on the
environment:

* `npm run dev` -- CRM at http://crm.dev:8000
* `npm run staging` -- CRM at http://crm.pebblecloud.net
* `npm run prod` -- CRM at http://magni.mypebble.co.uk

These commands simply replace `{{ crm_location }}` in the extension code.

You can now use the "load unpacked extension" on the build directory.
