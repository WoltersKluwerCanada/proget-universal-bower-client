"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const communication_1 = require("./communication");
const createError_1 = require("./createError");
const utils_1 = require("./utils");
const push = (from, to, deploy, callback) => {
    to = `${to}/upload`;
    fs.stat(from, (err) => {
        if (err) {
            callback(createError_1.default(`The file ${from} doesn't exist.`, "ENOENT"));
        }
        else {
            utils_1.getNpmCredentials((err_, data) => {
                if (err_) {
                    callback(err_);
                }
                else {
                    communication_1.default(from, to, data.usr, data.pass, (err__) => {
                        if (err__ && deploy) {
                            fs.unlink(from, () => {
                                callback(err__);
                            });
                        }
                        else {
                            callback(err__);
                        }
                    });
                }
            });
        }
    });
};
exports.default = push;
//# sourceMappingURL=push.js.map