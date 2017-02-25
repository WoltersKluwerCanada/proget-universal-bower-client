"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color = require("colors/safe");
const fs = require("fs");
const semver_1 = require("semver");
const createError_1 = require("./createError");
const pack_1 = require("./pack");
const push_1 = require("./push");
const utils_1 = require("./utils");
const semverVersion = (element, program) => {
    if (element) {
        if (semver_1.valid(element) || program.force) {
            return element;
        }
        else {
            return false;
        }
    }
};
const close = (err) => {
    if (err) {
        process.stderr.write(color.red(`${err}\n`));
        if (err.details) {
            process.stderr.write(color.yellow("Details:\n"));
            process.stderr.write(`${err.details}\n`);
        }
        process.exit(1);
    }
    else {
        process.stdout.write(color.green("Execution done with success!\n"));
        process.exit(0);
    }
};
const mainExecution = (program) => {
    const _pack = (forceOut, callback) => {
        const outputDir = forceOut || program.outputDirectory || program.pack;
        pack_1.default(program.pack, outputDir, program.force || false, callback);
    };
    const _push = (forceFrom, callback) => {
        push_1.default(forceFrom || program.push, program.source, program.deploy, callback);
    };
    if (program.Version === false) {
        throw createError_1.default("Wrong --Version format. The input don't follow the semantic versioning", "EFORMAT");
    }
    if ((program.pack && program.push) || program.deploy) {
        const archiveFolder = process.env["HOME"] || process.env["USERPROFILE"];
        if (!program.source) {
            if (program.push) {
                close(createError_1.default("You must specify a --source when calling --push.", "ECOMMAND"));
            }
            else {
                close(createError_1.default("You must specify a --source when calling --deploy.", "ECOMMAND"));
            }
        }
        program.pack = program.pack || program.deploy;
        _pack(archiveFolder, (err, upackFileFolder) => {
            if (err) {
                close(err);
            }
            else {
                process.stdout.write(`${color.cyan("Pack of the package done.")}\n`);
                _push(upackFileFolder, (err_) => {
                    if (!err_) {
                        process.stdout.write(`${color.cyan("Push of the package done.")}\n`);
                    }
                    else {
                        close(err_);
                    }
                    fs.unlink(upackFileFolder, (err__) => {
                        close(err__);
                    });
                });
            }
        });
    }
    else if (program.pack) {
        _pack(null, (err, data) => {
            if (!err) {
                process.stdout.write(color.cyan(`Pack of the package done in ${data}.\n`));
            }
            close(err);
        });
    }
    else if (program.push) {
        if (!program.source) {
            close(createError_1.default("You must specify a --source when calling --push.", "ECOMMAND"));
        }
        _push(null, (err) => {
            if (!err) {
                process.stdout.write(`${color.cyan("Push of the package done.")}\n`);
            }
            close(err);
        });
    }
    else if (program.Feed) {
        utils_1.updateFeedBowerRc(process.cwd(), program.Feed, (err) => {
            close(err);
        });
    }
    else {
        close(createError_1.default("None of the require command were called. Please use pack, push or deploy.", "ECOMMAND"));
    }
};
const main = (program) => {
    program.Version = semverVersion(program.Version, program);
    if (program.Version === false) {
        close(createError_1.default("The format of the Version parameter doesn't follow the semantic versioning.", "ECOMMAND"));
    }
    else {
        const cwd = program.pack || program.deploy;
        if (program.Feed && program.Version && cwd) {
            utils_1.updateFeedBowerRc(cwd, program.Feed, (err) => {
                if (err) {
                    close(err);
                }
                else {
                    utils_1.updateVersionBowerJson(cwd, program.Version, (err_) => {
                        if (err_) {
                            close(err_);
                        }
                        else {
                            mainExecution(program);
                        }
                    });
                }
            });
        }
        else if (program.Feed && cwd) {
            utils_1.updateFeedBowerRc(cwd, program.Feed, (err) => {
                if (err) {
                    close(err);
                }
                else {
                    mainExecution(program);
                }
            });
        }
        else if (program.Version && cwd) {
            utils_1.updateVersionBowerJson(cwd, program.Version, (err) => {
                if (err) {
                    close(err);
                }
                else {
                    mainExecution(program);
                }
            });
        }
        else {
            mainExecution(program);
        }
    }
};
exports.default = main;
//# sourceMappingURL=main.js.map