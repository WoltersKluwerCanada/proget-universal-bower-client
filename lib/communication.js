"use strict";

/**
 * Communication module.
 * @module communication
 */

const fs = require("fs");
const request = require("request");
const path = require("path");

const createError = require("./createError");

/**
 * Send a file to the server
 *
 * @param {string} src - The path to the file to send to the server.
 * @param {string} url - The server address to communicate with.
 * @param {string} usr - Username.
 * @param {string} pass - Base64 encoded password.
 * @param {requestCallbackStatus} callback - The callback that handles the response.
 */
let communication = (src, url, usr, pass, callback) => {
    let readStream = fs.createReadStream(src);
    let uploadStream = request.defaults({
        auth: {
            "user": usr,
            "pass": new Buffer(pass, "base64").toString()
        },
        method: "POST",
        headers: {
            "content-type": "application/zip",
            "name": path.basename(src)
        }
    });
    let error = false;

    readStream.pipe(uploadStream(url)
        .on("response", (res) => {
            let status = res.statusCode;

            if ((status < 200 || status >= 300) && !error) {
                error = true;
                callback(createError(`Status code of ${status} when trying to upload to ${url}`, "EHTTP", {
                    details: JSON.stringify(res, null, 2)
                }));
            }
        })
        .on("error", (err) => {
            if (!error) {
                error = true;
                callback(err);
            }
        })
        .on("end", () => {
            if (!error) {
                callback(null);
            }
        })
    );

    readStream
        .on("error", (err) => {
            if (!error) {
                error = true;
                callback(err);
            }
        });
};

module.exports = communication;
