"use strict";

import * as color from "colors/safe";
import * as fs from "fs";
import {valid} from "semver";
import createError from "./createError";
import ErrorN from "./ErrorN";
import pack from "./pack";
import push from "./push";
import {updateFeedBowerRc, updateVersionBowerJson} from "./utils";

/**
 * Validate if the string pass as parameter to Version is compatible with the semantic versioning
 */
const semverVersion = (element?: string, program?): string | boolean => {
    if (element) {
        if (valid(element) || program.force) {
            return element;
        } else {
            return false;
        }
    }
};

/**
 * Terminate the application
 */
const close = (err?: ErrorN) => {
    if (err) {
        process.stderr.write(color.red(`${err}\n`));

        if (err.details) {
            process.stderr.write(color.yellow("Details:\n"));
            process.stderr.write(`${err.details}\n`);
        }

        process.exit(1);
    } else {
        process.stdout.write(color.green("Execution done with success!\n"));
        process.exit(0);
    }
};

/**
 * Once the Version his treated, this section his executed
 */
const mainExecution = (program) => {
    /**
     * Pack section
     */
    const _pack = (forceOut: string | null, callback: Callback): void => {
        const outputDir = forceOut || program.outputDirectory || program.pack;

        pack(program.pack, outputDir, program.force || false, callback);
    };

    /**
     * Push section
     */
    const _push = (forceFrom: string|null, callback: ErrOnlyCallback): void => {
        push(forceFrom || program.push, program.source, program.deploy, callback);
    };

    // Detect the error in the format of the --Version parameter
    if (program.Version === false) {
        throw createError("Wrong --Version format. The input don't follow the semantic versioning", "EFORMAT");
    }

    if ((program.pack && program.push) || program.deploy) {
        const archiveFolder = process.env.HOME || process.env.USERPROFILE;

        // Source parameter is require with pack and push or deploy
        if (!program.source) {
            if (program.push) {
                close(createError("You must specify a --source when calling --push.", "ECOMMAND"));
            } else {
                close(createError("You must specify a --source when calling --deploy.", "ECOMMAND"));
            }
        }

        // Be sure to have the destination folder in program.pack
        program.pack = program.pack || program.deploy;

        _pack(archiveFolder, (err?: ErrorN, upackFileFolder?: string): void => {
            if (err) {
                // Error while pack
                close(err);
            } else {
                process.stdout.write(`${color.cyan("Pack of the package done.")}\n`);
                _push(upackFileFolder, (err_?: ErrorN) => {
                    if (!err_) {
                        process.stdout.write(`${color.cyan("Push of the package done.")}\n`);
                    } else {
                        // Error while push
                        close(err_);
                    }

                    fs.unlink(upackFileFolder, (err__?: ErrorN) => {
                        // May contain delete error
                        close(err__);
                    });
                });
            }
        });
    } else if (program.pack) {
        _pack(null, (err?: ErrorN, data?: string) => {
            if (!err) {
                process.stdout.write(color.cyan(`Pack of the package done in ${data}.\n`));
            }

            close(err);
        });
    } else if (program.push) {
        // Source parameter is require with push
        if (!program.source) {
            close(createError("You must specify a --source when calling --push.", "ECOMMAND"));
        }

        _push(null, (err?: ErrorN) => {
            if (!err) {
                process.stdout.write(`${color.cyan("Push of the package done.")}\n`);
            }

            close(err);
        });
    } else if (program.Feed) {
        updateFeedBowerRc(process.cwd(), program.Feed, (err?: ErrorN) => {
            close(err);
        });
    } else {
        close(createError("None of the require command were called. Please use pack, push or deploy.", "ECOMMAND"));
    }
};

/**
 * Main module export
 *
 * @param {program} program - The object that come from the commander module.
 */
const main = (program) => {
    program.Version = semverVersion(program.Version, program);

    if (program.Version === false) {
        close(createError("The format of the Version parameter doesn't follow the semantic versioning.", "ECOMMAND"));
    } else {
        const cwd = program.pack || program.deploy;

        if (program.Feed && program.Version && cwd) {
            // Update the feed in the .bowerrc file
            updateFeedBowerRc(cwd, program.Feed, (err?: ErrorN) => {
                if (err) {
                    close(err);
                } else {
                    // Update the version in the bower.json file
                    updateVersionBowerJson(cwd, program.Version, (err_?: ErrorN) => {
                        if (err_) {
                            close(err_);
                        } else {
                            mainExecution(program);
                        }
                    });
                }
            });
        } else if (program.Feed && cwd) {
            // Update the feed in the .bowerrc file
            updateFeedBowerRc(cwd, program.Feed, (err?: ErrorN) => {
                if (err) {
                    close(err);
                } else {
                    mainExecution(program);
                }
            });
        } else if (program.Version && cwd) {
            // Update the version in the bower.json file
            updateVersionBowerJson(cwd, program.Version, (err?: ErrorN) => {
                if (err) {
                    close(err);
                } else {
                    mainExecution(program);
                }
            });
        } else {
            mainExecution(program);
        }
    }
};

export default main;
