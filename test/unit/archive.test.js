"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const path = require("path");
const glob = require("glob");
const fs = require("fs");
const share = require("../data/share");

const archive = require("../../lib/archive");

describe("archive", function() {
    const testFolder = path.join(__dirname, "..", "data", "archive");

    before(function(done) {
        share.createTestFolder(testFolder, (err)=> {
            done(err);
        });
    });

    it("create an archive", function(done) {
        let archiveFolder = path.join(__dirname, "..", "data", "bowerPkgExample");

        glob("**", {dot: true, nodir: true, cwd: archiveFolder}, (err, files) => {
            if (err) {
                done(err);
            } else {
                archive(path.join(testFolder, "test-packBower.0.0.0.upack"), files, archiveFolder, false, (err) => {
                    if (err) {
                        done(err);
                    } else {
                        fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err) => {
                            done(err);
                        });
                    }
                });
            }
        });
    });

    after(function(done) {
        share.deleteTestFolder(testFolder, done);
    });
});