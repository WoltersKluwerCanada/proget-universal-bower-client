"use strict";

import {exec} from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as ProgressBar from "progress";
import createError from "./createError";
import ErrorN from "./ErrorN";

const partitionCmd = (base: string, additions: string[], maxLength: number): string[] => {
    const out = [];
    let temp = base;

    for (const addition of additions) {
        const _temp = `${temp} "${addition}"`;

        if (_temp.length > maxLength) {
            out.push(temp);
            temp = `${base} "${addition}"`;
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
 */
const zip = (cmd: string[], cwd: string, callback: ErrOnlyCallback): void => {
    let position = 0;
    const bar = new ProgressBar("  Compressing [:bar] :percent", {
        complete: "█",
        incomplete: ".",
        total: cmd.length,
        width: 20
    });

    const zipNext = () => {
        if (position < cmd.length) {
            exec(cmd[position], {cwd}, (err) => {
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
    };

    zipNext();
};

/**
 * Compress a folder content to a .upack package
 */
const zipAll = (dest: string, files: string[], cwd: string, callback: Callback): void => {
    const tempName = ((): string => {
        return /^win/.test(process.platform) ? "~pubc_tmp.zip" : ".pubc_tmp.zip";
    })();
    const tempPath = path.join(cwd, tempName);

    // Delete the temp zip file from the list if there
    const zipFilePosition = files.indexOf(tempName);
    if (zipFilePosition !== -1) {
        files.splice(zipFilePosition, 1);
    }

    const cmd = partitionCmd(`7z a "${tempPath}"`, files, 4000);

    zip(cmd, cwd, (err?: Error) => {
        if (err) {
            callback(err, null);
        } else {
            fs.rename(tempPath, dest, (err_?: ErrorN) => {
                if (err_) {
                    if (err_.code === "ENOENT") {
                        // Delete the archive
                        fs.unlink(tempPath, () => {
                            callback(err_, null);
                        });
                    } else {
                        callback(err_, null);
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
 */
const archive = (destination: string, files: string[], cwd: string, force: boolean, callback: Callback): void => {
    force = force || false;

    files = files.map((el) => {
        return path.normalize(el);
    });

    fs.stat(destination, (err?: Error) => {
        if (!err && !force) {
            callback(createError(`The archive ${destination} already exist.`, "EEXIST"), null);
        } else {
            zipAll(destination, files, cwd, (err_?: ErrorN, data?: string) => {
                callback(err_, data);
            });
        }
    });
};

export default archive;
