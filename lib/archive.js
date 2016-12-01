"use strict";

/**
 * Archive module.
 * @module archive
 */

const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
const ProgressBar = require("progress");

const createError = require("./createError");

let partitionCmd = function(base, additions, maxLength) {
    let out = [];
    let temp = base;

    for (let i = 0, j = additions.length; i < j; ++i) {
        let _temp = `${temp} "${additions[i]}"`;

        if (_temp.length > maxLength) {
            out.push(temp);
            temp = `${base} "${additions[i]}"`;
        } else {
            temp = _temp;
        }
    }

    // Add the last part
    out.push(temp);

    return out;
};

/**
 * Compress a folder content to a .upack package
 *
 * @param {Array} cmd - The files to add to the archive.
 * @param cwd - The current working directory.
 * @param {requestCallbackStatus} callback - The callback that handles the response.
 */
let zip = (cmd, cwd, callback) => {
    let position = 0;
    const bar = new ProgressBar("  Compressing [:bar] :percent", {
        complete: "█",
        incomplete: ".",
        width: 20,
        total: cmd.length
    });

    function zipNext() {
        if (position < cmd.length) {
            exec(cmd[position], {cwd: cwd}, (err) => {
                if (err) {
                    callback(err);
                } else {
                    bar.tick(null, null);
                    ++position;
                    zipNext();
                }
            });
        } else {
            // Last bar tick
            bar.tick(null, null);

            callback(null);
        }
    }

    zipNext();
};

/**
 * Compress a folder content to a .upack package
 *
 * @param {string} dest - The folder in where the archive will be created.
 * @param {Array} files - The files to add to the archive.
 * @param cwd - The current working directory.
 * @param {requestCallback} callback - The callback that handles the response.
 */
let zipAll = (dest, files, cwd, callback) => {
    const tempName = (() => {
        return /^win/.test(process.platform) ? "~pubc_tmp.zip" : ".pubc_tmp.zip";
    })();
    const tempPath = path.join(cwd, tempName);

    // Delete the temp zip file from the list if there
    const zipFilePosition = files.indexOf(tempName);
    if (zipFilePosition !== -1) {
        files.splice(zipFilePosition, 1);
    }

    const cmd = partitionCmd(`7z a ${tempPath}`, files, 4000);

    zip(cmd, cwd, (err) => {
        if (err) {
            callback(err, null);
        } else {
            fs.rename(tempPath, dest, (err) => {
                if (err) {
                    if (err.code === "ENOENT") {
                        // Delete the archive
                        fs.unlink(tempPath, () => {
                            callback(err, null);
                        });
                    } else {
                        callback(err, null);
                    }
                } else {
                    callback(null, dest);
                }
            });
        }
    });
};

/**
 * Create a zip archive
 *
 * @param {string} destination - The folder in where the archive will be created.
 * @param {Array} files - The files to add to the archive.
 * @param {string} cwd - The current working directory.
 * @param {boolean} [force] - If the file must be deleted after.
 * @param {requestCallback} callback - The callback that handles the response.
 */
let archive = (destination, files, cwd, force, callback) => {
    force = force || false;

    files = files.map((el) => {
        return path.normalize(el);
    });

    fs.stat(destination, (err) => {
        if (!err && !force) {
            callback(createError(`The archive ${destination} already exist.`, "EEXIST"), null);
        } else {
            zipAll(destination, files, cwd, (err, data) => {
                callback(err, data);
            });
        }
    });
};

module.exports = archive;
