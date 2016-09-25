"use strict";

/**
 * Push module.
 * @module push
 */

const fs = require("fs");

const createError = require("./createError");
const comm = require("./communication");
const utils = require("./utils");

/**
 * Prepare the package to be send to the server
 *
 * @param {string} from - The path to the file to send to the server.
 * @param {string} to - The server address to communicate with.
 * @param {string|null} deploy - If call by the deploy command will contain a string
 * @param {requestCallbackStatus} callback - The callback that handles the response.
 */
let push = (from, to, deploy, callback) => {
    to = `${to}/upload`;

    fs.stat(from, (err) => {
        if (err) {
            callback(createError(`The file ${from} doesn't exist.`, "ENOENT"));
        } else {
            utils.getNpmCredentials((err, data) => {
                if (err) {
                    callback(err);
                } else {
                    comm(from, to, data.usr, data.pass, (err) => {
                        // If the transmission failed, delete the package if from command deploy
                        if(err && deploy) {
                            fs.unlink(from, () => {
                                callback(err);
                            });
                        } else {
                            callback(err);
                        }
                    });
                }
            });
        }
    });
};

module.exports = push;