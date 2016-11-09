"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const utils = require("../../lib/utils");

describe("utils", function() {
    const testFolder = path.join(__dirname, "..", "data", "bowerPkgExample");
    const testFolderWithIgnoreAll = path.join(__dirname, "..", "data", "bowerPkgExample2");

    const testFolderContent = [
        ".bowerrc",
        ".gitignore",
        "bower.json",
        "fake.upack",
        "ignoreButNot.txt",
        "ignoreByBowerJson.txt",
        "ignoreByGitignore.txt",
        "index.js",
        "folder/.eslintrc.js",
        "folder/subfile.js"
    ];

    // Test with only the minimal information
    describe("getIgnoredData", () => {
        it("clean", function(done) {
            utils.getIgnoredData(testFolder, (err, data) => {
                try {
                    expect(err).to.be.null;

                    expect(data).to.have.all.keys(["_added", "_cache", "_rules"]);

                    expect(data.filter(testFolderContent)).to.deep.have.members([
                        ".gitignore",
                        "bower.json",
                        "ignoreButNot.txt",
                        "ignoreByGitignore.txt",
                        "index.js",
                        "folder/.eslintrc.js",
                        "folder/subfile.js"
                    ]);

                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it("ugly", function(done) {
            utils.getIgnoredData(testFolderWithIgnoreAll, (err, data) => {
                try {
                    expect(err).to.be.null;

                    expect(data).to.have.all.keys(["_added", "_cache", "_rules"]);

                    expect(data.filter(testFolderContent)).to.deep.have.members([
                        "bower.json",
                        "ignoreButNot.txt"
                    ]);

                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
    });

    it("getFolderContent", function(done) {
        try {
            glob("**", {dot: true, nodir: true, cwd: testFolder}, (err, files) => {
                expect(err).to.be.null;

                utils.getFolderContent(testFolder, (err, data) => {
                    expect(err).to.be.null;

                    expect(data).to.be.a("Array");
                    expect(data).eql(files);

                    done();
                });
            });
        } catch (e) {
            done(e);
        }
    });

    it("getBowerContent", function(done) {
        utils.getBowerContent(testFolder).then(
            (files) => {
                try {
                    // Remove the root path of the folder list to validate test
                    files = files.map((el) => {
                        return path.normalize(el).replace(path.normalize(testFolder) + path.sep, "");
                    });

                    // Included files
                    expect(files).to.contains(".gitignore");
                    expect(files).to.contains("bower.json");
                    expect(files).to.contains("index.js");
                    expect(files).to.contains(path.join("folder", "subfile.js"));
                    // Ignored files
                    expect(files).to.not.contains("ignoreByBowerJson.txt");
                    expect(files).to.not.contains("ignoreByGitIgnore.txt");
                    expect(files).to.not.contains("fake.upack");
                    expect(files).to.not.contains(".bowerrc");

                    done();
                } catch (e) {
                    done(e);
                }
            },
            (err) => {
                done(err);
            }
        );
    });

    it("getNpmCredentials", function(done) {
        utils.getNpmCredentials((err, data) => {
            expect(err).to.be.null;

            expect(data).to.include.keys("pass");
            expect(data).to.include.keys("usr");

            expect(data.pass.length).to.be.at.least(1);
            expect(data.usr.length).to.be.at.least(1);

            done();
        });
    });

    it("readJsonFromFile", function(done) {
        fs.readFile(path.join(testFolder, ".bowerrc"), "utf8", (err, bowerrc) => {
            expect(err).to.be.null;

            bowerrc = JSON.parse(bowerrc);

            try {
                utils.readJsonFromFile(path.join(testFolder, ".bowerrc"), (err, data) => {
                    try {
                        expect(err).to.be.null;

                        expect(data).eql(bowerrc);

                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            } catch (e) {
                done(e);
            }
        });

    });

    it("createUpackJson", function(done) {
        utils.createUpackJson(testFolder).then(
            (res) => {
                try {
                    expect(res).eql({
                        "json": "upack.json",
                        "upack": "test-packBower.0.0.0.upack"
                    });

                    let upackFilePath = path.join(testFolder, "upack.json");

                    fs.stat(upackFilePath, (err) => {
                        if (err) {
                            done(err);
                        } else {
                            fs.unlink(upackFilePath, (err) => {
                                done(err);
                            });
                        }
                    });
                } catch (e) {
                    done(e);
                }
            },
            (err) => {
                done(err);
            }
        );
    });
});