"use strict";

import * as fs from "fs";
import * as path from "path";
import * as request from "request";
import createError from "./createError";

const upload = (src: string, uploadStream, hasRetry: boolean, url: string, credentials, cb: ErrOnlyCallback): void => {
    const readStream = fs.createReadStream(src);
    let stopped = false;

    readStream.pipe(uploadStream(url)
        .on("response", (res): void => {
            const status = res.statusCode;

            if (status >= 300 && status < 400) {
                // Hit a redirection
                stopped = true;
                if (hasRetry) {
                    cb(createError(`Status code of ${status} when trying to upload to ${url}`, "EHTTP", {
                        details: JSON.stringify(res, null, 2)
                    }));
                } else {
                    readStream.close();
                    upload(src, uploadStream, true, res.headers.location.toString(), credentials, cb);
                }
            } else if ((status < 200 || status >= 400) && !stopped) {
                // Hit an HTTP error
                stopped = true;
                cb(createError(`Status code of ${status} when trying to upload to ${url}`, "EHTTP", {
                    details: JSON.stringify(res, null, 2)
                }));
            }
        })
        .on("error", (err?: Error): void => {
            if (!stopped) {
                stopped = true;
                cb(err);
            }
        })
        .on("end", (): void => {
            if (!stopped) {
                cb(null);
            }
        })
    );

    readStream
        .on("error", (err?: Error): void => {
            if (!stopped) {
                stopped = true;
                cb(err);
            }
        });
};

/**
 * Send a file to the server
 */
const communication = (src: string, url: string, credentials: AuthToken, callback: ErrOnlyCallback): void => {
    const uploadStream = request.defaults({
        auth: {
            pass: credentials.password,
            user: credentials.username
        },
        headers: {
            "content-type": "application/zip",
            "name": path.basename(src)
        },
        method: "POST"
    });
    const hasRetry = false;

    upload(src, uploadStream, hasRetry, url, credentials, callback);
};

export default communication;
