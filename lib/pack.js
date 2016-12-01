"use strict";

/**
 * Pack module.
 * @module pack
 */

const fs = require("fs");
const Promise = require("bluebird");
const path = require("path");

const archive = require("./archive");
const createError = require("./createError");
const utils = require("./utils");

/**
 * Pack the folder content to a .upack archive
 *
 * @param {string} from - The folder to pack
 * @param {string} to - The destination of the archive.
 * @param {boolean} force - If the archive already exist should it be replace.
 * @param {requestCallback} callback - The callback that handles the response.
 */
let pack = (from, to, force, callback) => {
    let upackPath;
    let upackJsonFile;
    let filesToPack;

    const promises = [
        utils.createUpackJson(from).then(
            (data) => {
                upackPath = data.upack;
                upackJsonFile = data.json;
            }
        ),
        utils.getBowerContent(from).then(
            (data) => {
                filesToPack = data;
            }
        )
    ];

    Promise.all(promises).then(
        () => {
            // On Windows, fix path
            upackJsonFile = upackJsonFile.replace(/\\/g, "/");

            // Since createUpackJson and getBowerContent were async, we can't be sure that the
            // file upack.json will be in the list of files, so we need to add it now
            if (filesToPack.indexOf(upackJsonFile) === -1) {
                filesToPack.push(upackJsonFile);
            }

            // Validate that the destination folder exist
            fs.stat(to, (err) => {
                if (err && err.code == "ENOENT") {
                    callback(createError(`The destination folder "${to}" don't exist. Please create it first.`, "ENOENT"), null);
                } else if (err) {
                    callback(err, null);
                } else {
                    archive(path.join(to, upackPath), filesToPack, from, force, callback);
                }
            });
        },
        (err) => {
            callback(err, null);
        }
    );
};

module.exports = pack;
