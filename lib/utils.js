"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const glob = require("glob");
const ignore = require("ignore");
const os = require("os");
const path = require("path");
const createError_1 = require("./createError");
const regex = {
    npmPassword: {
        header: /\/\/.*:_password=/,
        line: /\/\/.*:_password=.*/
    },
    npmUsername: {
        header: /\/\/.*:username=/,
        line: /\/\/.*:username=.*/
    }
};
const prettyJsonStringify = (data) => {
    return JSON.stringify(data, null, 2);
};
const writeFile = (filePath, replaceExist, content, callback) => {
    fs.stat(filePath, (err) => {
        if (err) {
            fs.writeFile(filePath, content, (err_) => {
                callback(err_);
            });
        }
        else {
            if (replaceExist) {
                fs.writeFile(filePath, content, (err__) => {
                    callback(err__);
                });
            }
            else {
                callback(createError_1.default(`The file ${filePath} already exist.`, "EEXIST"));
            }
        }
    });
};
const readFile = (filePath, ignoreENOENT, callback) => {
    fs.stat(filePath, (err) => {
        if (err) {
            if (ignoreENOENT) {
                callback(null, null);
            }
            else {
                callback(err, null);
            }
        }
        else {
            fs.readFile(filePath, "utf8", (err_, data) => {
                callback(err_, data);
            });
        }
    });
};
const parseIgnoreFile = (filePath, omittedFiles) => {
    return new Promise((resolve, reject) => {
        readFile(filePath, true, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                if (data) {
                    omittedFiles.add(JSON.parse(data).ignore || []);
                }
                process.nextTick(() => {
                    resolve();
                });
            }
        });
    });
};
const getIgnoredData = (from, callback) => {
    const omittedFiles = ignore();
    omittedFiles.add([".git", ".bowerrc", "*.upack", "!bower.json"]);
    parseIgnoreFile(path.join(from, "bower.json"), omittedFiles).then(() => {
        omittedFiles._rules.sort((a) => {
            return a.negative;
        });
        callback(null, omittedFiles);
    }, (err) => {
        callback(err, null);
    });
};
exports.getIgnoredData = getIgnoredData;
const getFolderContent = (from, callback) => {
    glob("**/*", { dot: true, nodir: true, cwd: from }, (err, files) => {
        callback(err, files || null);
    });
};
exports.getFolderContent = getFolderContent;
const getBowerContent = (from) => {
    return new Promise((resolve, reject) => {
        const promises = [];
        let toIgnore;
        let content;
        promises.push(new Promise((_resolve, _reject) => {
            getIgnoredData(from, (err, data) => {
                if (err) {
                    _reject(err);
                }
                else {
                    toIgnore = data;
                    _resolve();
                }
            });
        }));
        promises.push(new Promise((_resolve, _reject) => {
            getFolderContent(from, (err, data) => {
                if (err) {
                    _reject(err);
                }
                else {
                    content = data;
                    _resolve();
                }
            });
        }));
        Promise.all(promises).then(() => {
            resolve(toIgnore.filter(content));
        }, (err) => {
            reject(err);
        });
    });
};
exports.getBowerContent = getBowerContent;
const getNpmRc = (callback) => {
    const npmRcFilePath = (() => {
        if (process.env["NODE_ENV"] !== "test") {
            return path.join(os.homedir(), ".npmrc");
        }
        else {
            return path.join(__dirname, "..", "test/data/.npmrc");
        }
    })();
    fs.stat(npmRcFilePath, (err) => {
        if (err) {
            callback(err, null);
        }
        else {
            fs.readFile(npmRcFilePath, "utf8", (err_, data) => {
                callback(err_, data);
            });
        }
    });
};
const getNpmCredentials = (callback) => {
    getNpmRc((err, data) => {
        const errMsg = createError_1.default("Missing username or password in .npmrc; Please execute 'npm adduser' command", "ENODATA");
        if (err) {
            callback(err, null);
        }
        else {
            try {
                const pass = regex.npmPassword.line.exec(data).toString()
                    .replace(regex.npmPassword.header, "").replace(/"/g, "");
                const usr = regex.npmUsername.line.exec(data).toString()
                    .replace(regex.npmUsername.header, "").replace(/"/g, "");
                if (pass.length > 0 && usr.length > 0) {
                    callback(null, { usr, pass });
                }
                else {
                    callback(errMsg, null);
                }
            }
            catch (e) {
                callback(errMsg, null);
            }
        }
    });
};
exports.getNpmCredentials = getNpmCredentials;
const readJsonFromFile = (from, callback) => {
    readFile(from, false, (err, data) => {
        if (err) {
            callback(err, null);
        }
        else {
            try {
                const out = JSON.parse(data);
                callback(null, out);
            }
            catch (e) {
                callback(e, null);
            }
        }
    });
};
exports.readJsonFromFile = readJsonFromFile;
const validateUpackData = (name, version, group, description) => {
    const error = [];
    if (name == null) {
        error.push("name");
    }
    if (version == null) {
        error.push("version");
    }
    if (group == null) {
        error.push("group");
    }
    if (description == null) {
        error.push("description");
    }
    if (error.length > 0) {
        throw createError_1.default(`Missing the data "${error.join(" & ")}" in the bower.json or .bowerrc file.`, "EMISSARG");
    }
};
const createUpackJson = (from) => {
    return new Promise((resolve, reject) => {
        readJsonFromFile(path.join(from, "bower.json"), (err, data) => {
            if (err) {
                throw err;
            }
            else {
                const bowerJsonData = data;
                const upackJson = {
                    description: bowerJsonData.description || "",
                    group: "bower",
                    name: bowerJsonData.name,
                    version: bowerJsonData.version
                };
                validateUpackData(upackJson.name, upackJson.version, upackJson.group, upackJson.description);
                const upackJsonPath = path.join(from, "upack.json");
                writeFile(upackJsonPath, true, prettyJsonStringify(upackJson), (err_) => {
                    if (err_) {
                        reject(err_);
                    }
                    else {
                        resolve({
                            json: "upack.json",
                            upack: `${upackJson.name}.${upackJson.version}.upack`
                        });
                    }
                });
            }
        });
    });
};
exports.createUpackJson = createUpackJson;
const updateVersionBowerJson = (from, version, callback) => {
    readJsonFromFile(path.join(from, "bower.json"), (err, data) => {
        if (err) {
            callback(err);
        }
        else {
            data.version = version;
            writeFile(path.join(from, "bower.json"), true, JSON.stringify(data, null, 2), callback);
        }
    });
};
exports.updateVersionBowerJson = updateVersionBowerJson;
const updateFeedBowerRc = (from, feed, callback) => {
    readJsonFromFile(path.join(from, ".bowerrc"), (err, data) => {
        if (err) {
            callback(err);
        }
        else {
            data.proget = data.proget || {};
            data.proget.feed = feed;
            writeFile(path.join(from, ".bowerrc"), true, JSON.stringify(data, null, 2), callback);
        }
    });
};
exports.updateFeedBowerRc = updateFeedBowerRc;
//# sourceMappingURL=utils.js.map