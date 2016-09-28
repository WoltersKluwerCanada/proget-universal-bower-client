[![dependencies Status](https://david-dm.org/WoltersKluwerCanada/proget-universal-bower-client/status.svg)](https://david-dm.org/WoltersKluwerCanada/proget-universal-bower-client) [![Build Status](https://travis-ci.org/WoltersKluwerCanada/proget-universal-bower-client.svg?branch=master)](https://travis-ci.org/WoltersKluwerCanada/proget-universal-bower-client)

# ProGet Universal Bower Client

This tool allow you to push Bower package to a Universal ProGet feed. You can after consume them using [proget-universal-bower-resolver](https://github.com/WoltersKluwerCanada/proget-universal-bower-resolver) 
and Bower to consume them back.

## Install

```
npm install -g proget-universal-bower-client
```

## Use

You can call the tool using the command `pubc` or `proget-universal-bower-client`.

> When publishing or deploying packages, you must specify the destination address in this format: 
>
> **http(s)://**`<server address>` **/upack/**`<universal feed name>`

### Parameters
To list the parameters call the tool using the `-h` parameter.
```
pubc -h
```

## Requirements

- Have 7zip install and available using command line. On windows, the easiest way is to use `Chocolatey` and this command: `choco install 7zip.commandline`
- Have setup his user in npm (command `npm adduser` ;; require you LDAP credentials).

## Ignore files

The next files were ignored:

- The content of the `.gitignore` file.
- The content of the `ignore` section of the `bower.json` file.
- The next files: `*.upack`.

## Upcoming

- More unit-test, the ones that were there now not offer a good cover and we disable some of them because they point to our real server.