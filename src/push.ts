"use strict";

import * as fs from "fs";
import * as path from "path";
import Authentication from "./Authentication";
import communication from "./communication";
import createError from "./createError";

/**
 * Prepare the package to be send to the server
 */
const push = (from: string, to: string, deploy: string | null, callback: ErrOnlyCallback): void => {
    to = `${to}/upload`;

    // Update the location to get the local .npmrc
    Authentication.getInstance().addPossibleConfigFolder(path.dirname(from));

    fs.stat(from, (err?: Error): void => {
        if (err) {
            callback(createError(`The file ${from} doesn't exist.`, "ENOENT"));
        } else {
            const credentials = Authentication.getInstance().getCredentialsByURI(to);

            if (credentials) {
                communication(from, to, credentials, (err__?: Error): void => {
                    // If the transmission failed, delete the package if from command deploy
                    if (err__ && deploy) {
                        fs.unlink(from, () => {
                            callback(err__);
                        });
                    } else {
                        callback(err__);
                    }
                });
            } else {
                callback(createError(`Unable to recover needed credentials from .npmrc(s).`, "ECREDE"));
            }
        }
    });
};

export default push;
