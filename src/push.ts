"use strict";

import * as fs from "fs";
import comm from "./communication";
import createError from "./createError";
import {getNpmCredentials} from "./utils";

/**
 * Prepare the package to be send to the server
 */
const push = (from: string, to: string, deploy: string|null, callback: ErrOnlyCallback): void => {
    to = `${to}/upload`;

    fs.stat(from, (err?: Error) => {
        if (err) {
            callback(createError(`The file ${from} doesn't exist.`, "ENOENT"));
        } else {
            getNpmCredentials((err_?: Error, data?: {usr: string, pass: string}) => {
                if (err_) {
                    callback(err_);
                } else {
                    comm(from, to, data.usr, data.pass, (err__?: Error) => {
                        // If the transmission failed, delete the package if from command deploy
                        if (err__ && deploy) {
                            fs.unlink(from, () => {
                                callback(err__);
                            });
                        } else {
                            callback(err__);
                        }
                    });
                }
            });
        }
    });
};

export default push;
