# Changelog

## v0.4.1 - 2017-08-02

- Internally: Update TsLint version.
- Internally: Change the way TypeScript build.
- Internally: Make changes for NPM v5.
- Internally: Make changes for new TypeScript, Mocha and TsLint version.
- Internally: Add Node.js v8 as test environment.

## v0.4.0 - 2017-04-06

- Add: Now you can `push` package specifying a glob star (`*`).

## v0.3.1 - 2017-03-07

- Fix: Now we support user name with all "visible" character. (With the last version, a username with a `-` in it would have been truncated.)

## v0.3.0 - 2017-03-07

- Add: Support redirection.
- Fix: Support of using `'` and `"` when specifying path using CLI.
- Internally: Use the same authentication module as `proget-universla-bower-resolver`;
- Internally: Convert the source code to TypeScript. 

## v0.2.4 - 2016-12-19

- Remove: Since our resolver `proget-universal-bower-resolver` stop support user to supply `group`, we remove this from the packager too.

## v0.2.3 - 2016-12-07

- Fix: Now the tool support space(s) in the path to the output `.upack` file.

## v0.2.2 - 2016-12-01

- Add: New error message when the destination folder doesn't exist.
- Add: Now the archive generated is deleted if the full process doesn't pass completely.
- Fix: In some circumstance, the archive can contain old version of itself.
- Internally: The tool dependency on the module `mout` has been removed.

## v0.2.1 - 2016-11-09

- Fix: Error when calling the parameters `--deploy` and `--version` where the current working directory will not be the one specified after `--deploy`.
- Fix: The HTTP header information when pushing the package to the server now contain the file name.

## v0.2.0 - 2016-09-28

- Major change: Remove the parsing of the `.gitignore` as ignored files. Now all ignored files must be in the `bower.json` `ignore` section.

## v0.1.2 - 2016-09-27

- Add: Support for path with spaces in archive.
- Add: The combination of `--Version` and `--force` now ignore wrong Semantic Versioning format.

## v0.1.1 - 2016-09-27

- Internally: Better use of the module `glob`.
- Fix: Some problem with files ignore.
- Change: Do not ignore `node_modules` and `bower_components` folders by default.

## v0.1.0 - 2016-09-25

- Initial deploy.
