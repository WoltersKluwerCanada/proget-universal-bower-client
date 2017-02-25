"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const request = require("request");
const createError_1 = require("./createError");
const communication = (src, url, usr, pass, callback) => {
    const readStream = fs.createReadStream(src);
    const uploadStream = request.defaults({
        auth: {
            pass: new Buffer(pass, "base64").toString(),
            user: usr
        },
        headers: {
            "content-type": "application/zip",
            "name": path.basename(src)
        },
        method: "POST"
    });
    let error = false;
    readStream.pipe(uploadStream(url)
        .on("response", (res) => {
        const status = res.statusCode;
        if ((status < 200 || status >= 304) && !error) {
            error = true;
            callback(createError_1.default(`Status code of ${status} when trying to upload to ${url}`, "EHTTP", {
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
    }));
    readStream
        .on("error", (err) => {
        if (!error) {
            error = true;
            callback(err);
        }
    });
};
exports.default = communication;
//# sourceMappingURL=communication.js.map