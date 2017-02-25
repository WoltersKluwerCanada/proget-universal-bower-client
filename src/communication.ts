"use strict";
/**
 * Communication module.
 * @module communication
 */
import * as fs from "fs";
import * as path from "path";
import * as request from "request";
import createError from "./createError";

/**
 * Send a file to the server
 */
const communication = (src: string, url: string, usr: string, pass: string, callback: ErrOnlyCallback): void => {
    const readStream = fs.createReadStream(src);
    const uploadStream: any = request.defaults({
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
                callback(createError(`Status code of ${status} when trying to upload to ${url}`, "EHTTP", {
                    details: JSON.stringify(res, null, 2)
                }));
            }
        })
        .on("error", (err?: Error) => {
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
        .on("error", (err?: Error) => {
            if (!error) {
                error = true;
                callback(err);
            }
        });
};

export default communication;
