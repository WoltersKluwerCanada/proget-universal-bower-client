"use strict";

import * as fs from "fs";
import * as glob from "glob";
import * as ignore from "ignore";
import * as os from "os";
import * as path from "path";
import createError from "./createError";

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

/**
 * Pretty stringify JSON
 */
const prettyJsonStringify = (data: {}): string => {
    return JSON.stringify(data, null, 2);
};

/**
 * Write in a file
 */
const writeFile = (filePath: string, replaceExist: boolean, content: string, callback: ErrOnlyCallback): void => {
    fs.stat(filePath, (err?: Error) => {
        // If the file exist and replaceExist
        if (err) {
            fs.writeFile(filePath, content, (err_?: Error) => {
                callback(err_);
            });
        } else {
            if (replaceExist) {
                fs.writeFile(filePath, content, (err__?: Error) => {
                    callback(err__);
                });
            } else {
                callback(createError(`The file ${filePath} already exist.`, "EEXIST"));
            }
        }
    });
};

/**
 * Validate that a file exist before return his content
 */
const readFile = (filePath: string, ignoreENOENT: boolean, callback: Callback): void => {
    fs.stat(filePath, (err?: Error) => {
        if (err) {
            if (ignoreENOENT) {
                callback(null, null);
            } else {
                callback(err, null);
            }
        } else {
            fs.readFile(filePath, "utf8", (err_?: Error, data?: string) => {
                callback(err_, data);
            });
        }
    });
};

/**
 * Read a file and pass it to the ignore module
 */
const parseIgnoreFile = (filePath: string, omittedFiles): Promise<any> => {
    return new Promise((resolve, reject) => {
        readFile(filePath, true, (err?: Error, data?: string) => {
            if (err) {
                reject(err);
            } else {
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

/**
 * Create a ignore object with the files to ignore
 */
const getIgnoredData = (from: string, callback: (err: Error | null, data: Ignore | null) => void): void => {
    const omittedFiles: Ignore = ignore();

    // Add basic ignores
    omittedFiles.add([".git", ".bowerrc", "*.upack", "!bower.json"]);

    // Add the content of the bower ignore section
    parseIgnoreFile(path.join(from, "bower.json"), omittedFiles).then(
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
};

/**
 * List the content of the directory
 */
const getFolderContent = (from: string, callback: Callback): void => {
    glob("**/*", {dot: true, nodir: true, cwd: from}, (err?: Error, files?: string[]) => {
        callback(err, files || null);
    });
};

/**
 * List the content to add to the Bower archive
 */
const getBowerContent = (from: string): Promise<any> => {
    return new Promise((resolve: Function, reject: Function) => {
        const promises = [];
        let toIgnore;
        let content;

        promises.push(new Promise((_resolve: Function, _reject: Function) => {
            getIgnoredData(from, (err?: Error, data?: Ignore) => {
                if (err) {
                    _reject(err);
                } else {
                    toIgnore = data;
                    _resolve();
                }
            });
        }));

        promises.push(new Promise((_resolve: Function, _reject: Function) => {
            getFolderContent(from, (err?: Error, data?: string[]) => {
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
};

/**
 * Read the .npmrc file from the user home folder
 */
const getNpmRc = (callback: Callback): void => {
    const npmRcFilePath = ((): string => {
        if (process.env.TEST_FOLDER_PUBC) {
            return path.join(process.env.TEST_FOLDER_PUBC, "data", ".npmrc");
        } else {
            return path.join(os.homedir(), ".npmrc");
        }
    })();

    fs.stat(npmRcFilePath, (err?: Error) => {
        if (err) {
            callback(err, null);
        } else {
            fs.readFile(npmRcFilePath, "utf8", (err_?: Error, data?: string) => {
                callback(err_, data);
            });
        }
    });
};

/**
 * Read the credentials from the user .npmrc file
 */
const getNpmCredentials = (callback: Callback): void => {
    getNpmRc((err?: Error, data?: string) => {
        const errMsg = createError(
            "Missing username or password in .npmrc; Please execute 'npm adduser' command",
            "ENODATA"
        );

        if (err) {
            callback(err, null);
        } else {
            try {
                const pass = regex.npmPassword.line.exec(data).toString()
                    .replace(regex.npmPassword.header, "").replace(/"/g, "");
                const usr = regex.npmUsername.line.exec(data).toString()
                    .replace(regex.npmUsername.header, "").replace(/"/g, "");

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
};

/**
 * Read and parse a JSON file
 */
const readJsonFromFile = (from: string, callback: Callback): void => {
    readFile(from, false, (err?: Error, data?: string) => {
        if (err) {
            callback(err, null);
        } else {
            try {
                const out = JSON.parse(data);
                callback(null, out);
            } catch (e) {
                callback(e, null);
            }
        }
    });
};

/**
 * Validate that all the values pass as parameter were filled
 */
const validateUpackData = (name: string, version: string, group: string, description: string): void => {
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

    // If there is error
    if (error.length > 0) {
        throw createError(`Missing the data "${error.join(" & ")}" in the bower.json or .bowerrc file.`, "EMISSARG");
    }
};

/**
 * Create the upack.json file and return the name the package should have.
 */
const createUpackJson = (from: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        readJsonFromFile(path.join(from, "bower.json"), (err?: Error, data?: BowerJSON) => {
            if (err) {
                throw err;
            } else {
                const bowerJsonData = data;
                const upackJson = {
                    description: bowerJsonData.description || "",
                    group: "bower",
                    name: bowerJsonData.name,
                    version: bowerJsonData.version
                };

                validateUpackData(upackJson.name, upackJson.version, upackJson.group, upackJson.description);

                const upackJsonPath = path.join(from, "upack.json");

                writeFile(upackJsonPath, true, prettyJsonStringify(upackJson), (err_?: Error) => {
                    if (err_) {
                        reject(err_);
                    } else {
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

/**
 * Change the version in the bower.json file.
 */
const updateVersionBowerJson = (from: string, version: string, callback: ErrOnlyCallback): void => {
    readJsonFromFile(path.join(from, "bower.json"), (err?: Error, data?: BowerJSON) => {
        if (err) {
            callback(err);
        } else {
            data.version = version;

            writeFile(path.join(from, "bower.json"), true, JSON.stringify(data, null, 2), callback);
        }
    });
};

/**
 * Change the feed in the .bowerrc file.
 */
const updateFeedBowerRc = (from: string, feed: string, callback: ErrOnlyCallback): void => {
    readJsonFromFile(path.join(from, ".bowerrc"), (err?: Error, data?: BowerJSON) => {
        if (err) {
            callback(err);
        } else {
            data.proget = data.proget || {};
            data.proget.feed = feed;

            writeFile(path.join(from, ".bowerrc"), true, JSON.stringify(data, null, 2), callback);
        }
    });
};

export {
    getIgnoredData,
    getFolderContent,
    getBowerContent,
    getNpmCredentials,
    readJsonFromFile,
    createUpackJson,
    updateVersionBowerJson,
    updateFeedBowerRc
};
