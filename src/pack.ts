"use strict";

import * as fs from "fs";
import * as path from "path";
import archive from "./archive";
import createError from "./createError";
import ErrorN from "./ErrorN";
import {createUpackJson, getBowerContent} from "./utils";

/**
 * Pack the folder content to a .upack archive
 */
const pack = (from: string, to: string, force: boolean, callback: Callback): void => {
    let upackPath;
    let upackJsonFile;
    let filesToPack;

    const promises = [
        createUpackJson(from).then(
            (data) => {
                upackPath = data.upack;
                upackJsonFile = data.json;
            }
        ),
        getBowerContent(from).then(
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
            fs.stat(to, (err?: ErrorN): void => {
                if (err && err.code === "ENOENT") {
                    callback(createError(
                        `The destination folder "${to}" don't exist. Please create it first.`,
                        "ENOENT"
                    ), null);
                } else if (err) {
                    callback(err, null);
                } else {
                    archive(path.join(to, upackPath), filesToPack, from, force, callback);
                }
            });
        },
        (err: Error) => {
            callback(err, null);
        }
    );
};

export default pack;
