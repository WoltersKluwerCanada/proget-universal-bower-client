"use strict";

const path = require("path");
const glob = require("glob");
const fs = require("fs");
const share = require("./data/share");

const archive = require("../lib/archive");

describe("archive", () => {
    let testFolder = path.join(__dirname, "data", "archive");

    before((done) => {
        share.createTestFolder(testFolder, (err)=> {
            done(err);
        });
    });

    it("create an archive", (done) => {
        let archiveFolder = path.join(__dirname, "data", "bowerPkgExample"),
            globPattern = path.join(archiveFolder, "**");

        glob(globPattern, {dot: true, nodir: true}, (err, files) => {
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

    after((done) => {
        share.deleteTestFolder(testFolder, done);
    });
});