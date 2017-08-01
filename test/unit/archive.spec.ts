"use strict";

/* tslint:disable:only-arrow-functions no-unused-expression */

import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import archive from "../../src/archive";
import {createTestFolder, deleteTestFolder} from "../data/share";

describe("archive", function() {
    const testFolder = path.join(__dirname, "..", "data", "archive");

    before(function(done) {
        createTestFolder(testFolder, (err) => {
            done(err);
        });
    });

    it("create an archive", function(done) {
        const archiveFolder = path.join(__dirname, "..", "data", "bowerPkgExample");

        glob("**", {dot: true, nodir: true, cwd: archiveFolder}, (err, files) => {
            if (err) {
                done(err);
            } else {
                archive(path.join(testFolder, "test-packBower.0.0.0.upack"), files, archiveFolder, false, (archiveError) => {
                    if (archiveError) {
                        done(archiveError);
                    } else {
                        fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (fileStatusError) => {
                            done(fileStatusError);
                        });
                    }
                });
            }
        });
    });

    after(function(done) {
        deleteTestFolder(testFolder, done);
    });
});
