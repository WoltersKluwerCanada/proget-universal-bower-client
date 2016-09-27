"use strict";

/**
 * Utilities module.
 * @module utils
 */

const fs = require("fs");
const path = require("path");
const ignore = require("ignore");
const Promise = require("bluebird");
const os = require("os");
const glob = require("glob");

const createError = require("./createError");

let regex = {
    npmPassword: {
        line: /\/\/.*:_password=.*/,
        header: /\/\/.*:_password=/
    },
    npmUsername: {
        line: /\/\/.*:username=.*/,
        header: /\/\/.*:username=/
    }
};

/**
 * Pretty stringify JSON
 *
 * @param {{}} data - The data to stringify
 * @return {string}
 */
function prettyJsonStringify(data) {
    return JSON.stringify(data, null, 2);
}

/**
 * Write in a file
 *
 * @param {string} filePath - The path of the file to create.
 * @param {boolean} replaceExist - If the file can be replace if it already exist.
 * @param {string} content - The content of the file.
 * @param {requestCallbackStatus} callback - The callback that handles the response.
 */
function writeFile(filePath, replaceExist, content, callback) {
    fs.stat(filePath, (err) => {
        // If the file exist and replaceExist
        if (err) {
            fs.writeFile(filePath, content, (err) => {
                callback(err);
            });
        } else {
            if (replaceExist) {
                fs.writeFile(filePath, content, (err) => {
                    callback(err);
                });
            } else {
                callback(createError(`The file ${filePath} already exist.`, "EEXIST"));
            }
        }
    });
}

/**
 * Validate that a file exist before return his content
 *
 * @param {string} filePath - The path of the file to read.
 * @param {boolean} ignoreENOENT - Ignore if the file don't exist.
 * @param {requestCallback} callback - The callback that handles the response.
 */
function readFile(filePath, ignoreENOENT, callback) {
    fs.stat(filePath, (err) => {
        if (err) {
            if (ignoreENOENT) {
                callback(null, null);
            } else {
                callback(err, null);
            }
        } else {
            fs.readFile(filePath, "utf8", (err, data) => {
                callback(err, data);
            });
        }
    });
}

/**
 * Parse the "ignore" section of the bower.json file
 *
 * @param {string} data - The content of the bower.json file.
 * @return {string} - The content of the bower.json "ignore" section
 */
function parseBowerIgnore(data) {
    let _data = JSON.parse(data);

    return _data.ignore || [];
}

/**
 * Read a file and pass it to the ignore module
 *
 * @param {string} filePath - The path to the ignore file.
 * @param {boolean} isBowerJson - If the file is the bower.json file.
 * @param {ignore} omittedFiles - The ignore object.
 * @return {Promise.<undefined|Error>}
 */
function parseIgnoreFile(filePath, isBowerJson, omittedFiles) {
    return new Promise((resolve, reject) => {
        readFile(filePath, true, (err, data) => {
            if (err) {
                reject(err);
            } else {
                if (isBowerJson && data) {
                    omittedFiles.add(parseBowerIgnore(data));
                } else if (data) {
                    omittedFiles.add(data);
                }
                process.nextTick(() => {
                    resolve();
                });
            }
        });
    });
}

/**
 * Create a ignore object with the files to ignore
 *
 * @param {string} from - The folder in which to found the bower.json file.
 * @param {requestCallback} callback - The callback that handles the response.
 */
function getIgnoredData(from, callback) {
    /**
     * @type ignore
     */
    let omittedFiles = ignore();

    let promises = [];

    // Add the content of the gitignore to the package
    //promises.push(parseIgnoreFile(path.join(from, ".gitignore"), false, omittedFiles));

    // Add the content of the bower ignore section
    promises.push(parseIgnoreFile(path.join(from, "bower.json"), true, omittedFiles));

    // Add basic ignores
    omittedFiles.add([".git", ".bowerrc", "*.upack", "!bower.json"]);

    Promise.all(promises).then(
        () => {
            // Safety to not overwrite the !ignore rules
            omittedFiles._rules.sort((a) => {
                return a.negative;
            });

            callback(null, omittedFiles);
        },
        (err) => {
            callback(err, null);
        }
    );
}

/**
 * List the content of the directory
 *
 * @param {string} from - The folder in which to found the bower.json file.
 * @param {requestCallback} callback - The callback that handles the response.
 */
function getFolderContent(from, callback) {
    glob("**/*", {dot: true, nodir: true, cwd: from}, (err, files) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, files);
        }
    });
}

/**
 * List the content to add to the Bower archive
 *
 * @return {Promise}
 */
function getBowerContent(from) {
    return new Promise((resolve, reject) => {
        let promises = [],
            toIgnore,
            content;

        promises.push(new Promise((_resolve, _reject) => {
            getIgnoredData(from, (err, data)=> {
                if (err) {
                    _reject(err);
                } else {
                    toIgnore = data;
                    _resolve();
                }
            });
        }));

        promises.push(new Promise((_resolve, _reject) => {
            getFolderContent(from, (err, data)=> {
                if (err) {
                    _reject(err);
                } else {
                    content = data;
                    _resolve();
                }
            });
        }));

        Promise.all(promises).then(
            () => {
                resolve(toIgnore.filter(content));
            },
            (err) => {
                reject(err);
            }
        );
    });
}

/**
 * Read the .npmrc file from the user home folder
 *
 * @param {requestCallback} callback - The callback that handles the response.
 */
function getNpmRc(callback) {
    let npmRcFilePath = path.join(os.homedir(), ".npmrc");

    fs.stat(npmRcFilePath, (err) => {
        if (err) {
            callback(err, null);
        } else {
            fs.readFile(npmRcFilePath, "utf8", (err, data) => {
                callback(err, data);
            });
        }
    });
}

/**
 * Read the credentials from the user .npmrc file
 *
 * @param {requestCallbackCred} callback - The callback that handles the response.
 */
function getNpmCredentials(callback) {
    getNpmRc((err, data) => {
        let errMsg = createError("Missing username or password in .npmrc; Please execute 'npm adduser' command", "ENODATA");

        if (err) {
            callback(err, null);
        } else {
            try {
                let pass = regex.npmPassword.line.exec(data).toString().replace(regex.npmPassword.header, "").replace(/"/g, ""),
                    usr = regex.npmUsername.line.exec(data).toString().replace(regex.npmUsername.header, "").replace(/"/g, "");

                if (pass.length > 0 && usr.length > 0) {
                    callback(null, {usr, pass});
                } else {
                    callback(errMsg, null);
                }
            } catch (e) {
                callback(errMsg, null);
            }
        }
    });
}

/**
 * Read and parse a JSON file
 *
 * @param {string} from - The folder in which to found the bower.json file.
 * @param {requestCallback|requestCallbackBowerRc} callback - The callback that handles the response.
 */
function readJsonFromFile(from, callback) {
    readFile(from, false, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            try {
                let out = JSON.parse(data);
                callback(null, out);
            } catch (e) {
                callback(e, null);
            }
        }
    });
}

/**
 * Validate that all the values pass as parameter were filled
 *
 * @param {string} name
 * @param {string} version
 * @param {string} group
 * @param {string} title
 * @param {string} description
 */
function validateUpackData(name, version, group, title, description) {
    let error = [];

    if (name == null) {
        error.push("name");
    }

    if (version == null) {
        error.push("version");
    }

    if (group == null) {
        error.push("group");
    }

    if (title == null) {
        error.push("title");
    }

    if (description == null) {
        error.push("description");
    }

    // If there is error
    if (error.length > 0) {
        throw createError(`Missing the data "${error.join(" & ")}" in the bower.json or .bowerrc file.`, "EMISSARG");
    }
}

/**
 * Read the content of the local bower config and the user global one
 *
 * @param {string} from - The folder in where the command was run
 * @param {requestCallback} callback - The callback that handles the response.
 */
function getBowerRcInformation(from, callback) {
    let userBowerRcData = {},
        out = {};

    // Read user bower.json file
    readJsonFromFile(path.join(os.homedir(), ".bowerrc"), (err, data) => {
        if (err && err.code !== "ENOENT") {
            callback(err, null);
        } else {
            userBowerRcData = data || {};

            // Read local bower.json file
            readJsonFromFile(path.join(from, ".bowerrc"), (err, data) => {
                if (err && err.code !== "ENOENT") {
                    callback(err, null);
                } else {
                    Object.assign(out, userBowerRcData, data);

                    callback(null, out);
                }
            });
        }
    });
}

/**
 * Create the upack.json file and return the name the package should have.
 *
 * @return {Promise}
 */
function createUpackJson(from) {
    return new Promise((resolve, reject) => {
        let bowerJsonData,
            bowerRcData,
            upackJson = {};

        readJsonFromFile(path.join(from, "bower.json"), (err, data) => {
            if (err) {
                throw err;
            } else {
                /**
                 * @type {{}}
                 * @property {string} name
                 * @property {string} version
                 * @property {string} description
                 */
                bowerJsonData = data;
                getBowerRcInformation(from, (err, data) => {
                    if (err) {
                        throw err;
                    } else {
                        /**
                         * @type {{}}
                         * @property {null|{}} proget
                         * @property {string} proget.group
                         */
                        bowerRcData = data;

                        upackJson.name = bowerJsonData.name;
                        upackJson.version = bowerJsonData.version;
                        upackJson.group = bowerRcData.proget.group || "bower";
                        upackJson.title = bowerJsonData.name;
                        upackJson.description = bowerJsonData.description || "";

                        validateUpackData(upackJson.name, upackJson.version, upackJson.group, upackJson.title, upackJson.description);

                        let upackJsonPath = path.join(from, "upack.json");

                        writeFile(upackJsonPath, true, prettyJsonStringify(upackJson), (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({
                                    upack: `${upackJson.name}.${upackJson.version}.upack`,
                                    json: "upack.json"
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}

/**
 * Change the version in the bower.json file.
 *
 * @param {string} from - The path to the bower.json file
 * @param {string} version - The new version
 * @param {requestCallbackStatus} callback - The callback that handles the response.
 */
function updateVersionBowerJson(from, version, callback) {
    readJsonFromFile(path.join(from, "bower.json"), (err, data) => {
        if (err) {
            callback(err);
        } else {
            data.version = version;

            writeFile(path.join(from, "bower.json"), true, JSON.stringify(data, null, 2), callback);
        }
    });
}

/**
 * Change the feed in the .bowerrc file.
 *
 * @param {string} from - The path to the bower.json file
 * @param {string} feed - The new feed
 * @param {requestCallbackStatus} callback - The callback that handles the response.
 */
function updateFeedBowerrc(from, feed, callback) {
    readJsonFromFile(path.join(from, ".bowerrc"), (err, data) => {
        if (err) {
            callback(err);
        } else {
            data.proget = data.proget || {};
            data.proget.feed = feed;

            writeFile(path.join(from, ".bowerrc"), true, JSON.stringify(data, null, 2), callback);
        }
    });
}

module.exports = {
    getIgnoredData,
    getFolderContent,
    getBowerContent,
    getNpmCredentials,
    readJsonFromFile,
    createUpackJson,
    updateVersionBowerJson,
    updateFeedBowerrc
};