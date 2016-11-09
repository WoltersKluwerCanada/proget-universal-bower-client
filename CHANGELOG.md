# Changelog

## v0.2.1 - 2016-11-09

- Fix error when calling the parameters `--deploy` and `--version` where the current working directory will not be the one specified after `--deploy`.
- Fix the HTTP header information when pushing the package to the server.

## v0.2.0 - 2016-09-28

- Remove the parsing of the `.gitignore` as ignored files. Now all ignored files must be in the `bower.json` `ignore` section (breaking change).

## v0.1.2 - 2016-09-27

- Add: Support for path with spaces in archive.
- Add: The combination of `--Version` and `--force` now ignore wrong Semantic Versioning format.

## v0.1.1 - 2016-09-27

- Internally: Better use of the module `glob`.
- Fix: Some problem with files ignore.
- Do not ignore `node_modules` and `bower_components` folders by default.

## v0.1.0 - 2016-09-25

- Initial deploy.
