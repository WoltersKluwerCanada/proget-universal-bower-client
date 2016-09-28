"use strict";

// Add colors to output
require("colors");

const fs = require("fs");
const validate = require("semver").valid;

const createError = require("./createError");
const pack = require("./pack");
const push = require("./push");
const utils = require("./utils");

/**
 * Main module
 *
 * @module main
 */

/**
 * Validate if the string pass as parameter to Version is compatible with the semantic versioning
 *
 * @param {string} [element] - The parameter pass to the Version parameter
 * @param {program} program - The object that come from the commander module.
 * @return {string|boolean}
 */
function semverVersion(element, program) {
    if (element) {
        if (validate(element) || program.force) {
            return element;
        } else {
            return false;
        }
    }
}

/**
 * Terminate the application
 *
 * @param {Error} [err] - The error to return with the application.
 */
function close(err) {
    if (err) {
        console.error(`${err}`.red);

        if (err.details) {
            console.log("Details:".yellow);
            console.log(err.details);
        }

        process.exit(1);
    } else {
        console.log("Execution done with success!".green);
        process.exit(0);
    }
}

/**
 * Once the Version his treated, this section his executed
 *
 * @param {program} program - The object that come from the commander module.
 */
function mainExecution(program) {
    /**
     * Pack section
     *
     * @param {?string} forceOut - If specify, first choice for output the .upack archive
     * @param callback
     * @private
     */
    function _pack(forceOut, callback) {
        let outputDir = forceOut || program.outputDirectory || program.pack;

        pack(program.pack, outputDir, program.force || false, callback);
    }

    /**
     * Push section
     *
     * @param {?string} forceFrom - If specified, first choice for get the .upack archive form
     * @param callback
     * @private
     */
    function _push(forceFrom, callback) {
        push(forceFrom || program.push, program.source, program.deploy, callback);
    }

    // Detect the error in the format of the --Version parameter
    if (program.Version === false) {
        throw createError("Wrong --Version format. The input don't follow the semantic versioning", "EFORMAT");
    }

    if ((program.pack && program.push) || program.deploy) {
        let archiveFolder = process.env.HOME || process.env.USERPROFILE;

        // Source parameter is require with pack and push or deploy
        if (!program.source) {
            close(createError("You must specify a --source when calling --pack and --push or --deploy.", "ECOMMAND"));
        }

        // Be sure to have the destination folder in program.pack
        program.pack = program.pack || program.deploy;

        _pack(archiveFolder, (err, upackFileFolder) => {
            if (err) {
                // Error while pack
                close(err);
            } else {
                console.log("Pack of the package done.".cyan);
                _push(upackFileFolder, (err) => {
                    if (!err) {
                        console.log("Push of the package done.".cyan);
                    } else {
                        // Error while push
                        close(err);
                    }

                    fs.unlink(upackFileFolder, (err) => {
                        // May contain delete error
                        close(err);
                    });
                });
            }
        });
    } else if (program.pack) {
        _pack(null, (err, data) => {
            if (!err) {
                console.log(`Pack of the package done in ${data}.`.cyan);
            }

            close(err);
        });
    } else if (program.push) {
        // Source parameter is require with push
        if (!program.source) {
            close(createError("You must specify a --source when calling --push.", "ECOMMAND"));
        }

        _push(null, (err) => {
            if (!err) {
                console.log("Push of the package done.".cyan);
            }

            close(err);
        });
    } else if (program.Feed) {
        utils.updateFeedBowerrc(process.cwd(), program.Feed, (err) => {
            close(err);
        });
    } else {
        close(createError("None of the require command were called. Please use pack, push or deploy.", "ECOMMAND"));
    }
}

/**
 * Main module export
 *
 * @param {program} program - The object that come from the commander module.
 */
module.exports = (program) => {
    program.Version = semverVersion(program.Version, program);

    if (program.Version === false) {
        close(createError("The format of the Version parameter doesn't follow the semantic versioning.", "ECOMMAND"));
    } else {
        if (program.Feed && program.Version && (program.pack || program.deploy)) {
            // Update the feed in the .bowerrc file
            utils.updateFeedBowerrc(program.pack || process.cwd(), program.Feed, (err) => {
                if (err) {
                    close(err);
                } else {
                    // Update the version in the bower.json file
                    utils.updateVersionBowerJson(program.pack || process.cwd(), program.Version, (err) => {
                        if (err) {
                            close(err);
                        } else {
                            mainExecution(program);
                        }
                    });
                }
            });
        } else if (program.Feed && (program.pack || program.deploy)) {
            // Update the feed in the .bowerrc file
            utils.updateFeedBowerrc(program.pack || process.cwd(), program.Feed, (err) => {
                if (err) {
                    close(err);
                } else {
                    mainExecution(program);
                }
            });
        } else if (program.Version && (program.pack || program.deploy)) {
            // Update the version in the bower.json file
            utils.updateVersionBowerJson(program.pack || process.cwd(), program.Version, (err) => {
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

