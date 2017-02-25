"use strict";

import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";

/**
 * Create a temp folder
 *
 * @param {string} root - Path to the temp package
 * @param {function} callback - The method to call after the execution
 */
const createTestFolder = (root, callback) => {
    fs.stat(root, (err) => {
        if (err && err.code === "ENOENT") {
            // Folder don't exist
            fs.mkdir(root, (err_) => {
                if (err_) {
                    callback(err_);
                } else {
                    callback();
                }
            });
        } else {
            // Clear the content of the folder, just in case
            rimraf(path.join(root, "*"), (err_) => {
                if (err_) {
                    callback(err_);
                } else {
                    callback();
                }
            });
        }
    });
};

/**
 * Delete a temp folder
 *
 * @param {string} path - PPath to the temp package
 * @param {function} callback - The method to call after the execution
 */
const deleteTestFolder = (path, callback) => {
    rimraf(path, (err) => {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
};

export {
    createTestFolder,
    deleteTestFolder
};
