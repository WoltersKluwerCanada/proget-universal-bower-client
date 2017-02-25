"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const archive_1 = require("./archive");
const createError_1 = require("./createError");
const utils_1 = require("./utils");
const pack = (from, to, force, callback) => {
    let upackPath;
    let upackJsonFile;
    let filesToPack;
    const promises = [
        utils_1.createUpackJson(from).then((data) => {
            upackPath = data.upack;
            upackJsonFile = data.json;
        }),
        utils_1.getBowerContent(from).then((data) => {
            filesToPack = data;
        })
    ];
    Promise.all(promises).then(() => {
        upackJsonFile = upackJsonFile.replace(/\\/g, "/");
        if (filesToPack.indexOf(upackJsonFile) === -1) {
            filesToPack.push(upackJsonFile);
        }
        fs.stat(to, (err) => {
            if (err && err.code === "ENOENT") {
                callback(createError_1.default(`The destination folder "${to}" don't exist. Please create it first.`, "ENOENT"), null);
            }
            else if (err) {
                callback(err, null);
            }
            else {
                archive_1.default(path.join(to, upackPath), filesToPack, from, force, callback);
            }
        });
    }, (err) => {
        callback(err, null);
    });
};
exports.default = pack;
//# sourceMappingURL=pack.js.map