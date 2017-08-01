"use strict";

import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";

const createTestFolder = (root: string, callback: ErrOnlyCallback) => {
    fs.stat(root, (err) => {
        if (err && err.code === "ENOENT") {
            // Folder don't exist
            fs.mkdir(root, (folderCreationError) => {
                if (folderCreationError) {
                    callback(folderCreationError);
                } else {
                    callback(null);
                }
            });
        } else {
            // Clear the content of the folder, just in case
            rimraf(path.join(root, "*"), (folderDeletionError) => {
                if (folderDeletionError) {
                    callback(folderDeletionError);
                } else {
                    callback(null);
                }
            });
        }
    });
};

const deleteTestFolder = (pathToFolder: string, callback: ErrOnlyCallback) => {
    rimraf(pathToFolder, (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};

export {
    createTestFolder,
    deleteTestFolder
};
