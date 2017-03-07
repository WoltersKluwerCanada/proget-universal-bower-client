"use strict";

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
                archive(path.join(testFolder, "test-packBower.0.0.0.upack"), files, archiveFolder, false, (err_) => {
                    if (err_) {
                        done(err_);
                    } else {
                        fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err__) => {
                            done(err__);
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
