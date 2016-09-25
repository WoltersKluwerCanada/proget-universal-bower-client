"use strict";

const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const utils = require("../lib/utils");

describe("utils", () => {
    let testFolder = path.join(__dirname, "data", "bowerPkgExample");

    // Test with only the minimal information
    it("getIgnoredData", (done) => {
        utils.getIgnoredData(testFolder, (err, data) => {
            try {
                expect(err).to.be.null;

                expect(data).to.have.all.keys(["_added", "_cache", "_rules"]);

                expect(data._rules).to.deep.have.members([
                    {
                        "negative": false,
                        "origin": "node_modules/",
                        "pattern": "node_modules/",
                        "regex": /(?:^|\/)node_modules\//i
                    },
                    {
                        "negative": false,
                        "origin": "bower_components/",
                        "pattern": "bower_components/",
                        "regex": /(?:^|\/)bower_components\//i
                    },
                    {
                        "negative": false,
                        "origin": "*.upack",
                        "pattern": "*.upack",
                        "regex": /(?:^|\/)[^\/]*\.upack(?=$|\/)/i
                    },
                    {
                        "negative": false,
                        "origin": ".bowerrc",
                        "pattern": ".bowerrc",
                        "regex": /(?:^|\/)\.bowerrc(?=$|\/)/i
                    },
                    {
                        "negative": false,
                        "origin": ".git/",
                        "pattern": ".git/",
                        "regex": /(?:^|\/)\.git\//i
                    },
                    {
                        "negative": false,
                        "origin": "ignoreByGitIgnore.txt",
                        "pattern": "ignoreByGitIgnore.txt",
                        "regex": /(?:^|\/)ignoreByGitIgnore\.txt(?=$|\/)/i
                    },
                    {
                        "negative": false,
                        "origin": "ignoreByBowerJson.txt",
                        "pattern": "ignoreByBowerJson.txt",
                        "regex": /(?:^|\/)ignoreByBowerJson\.txt(?=$|\/)/i
                    }
                ]);

                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it("getFolderContent", (done) => {
        glob(path.join(testFolder, "**"), {dot: true, nodir: true}, (err, files) => {
            expect(err).to.be.null;

            utils.getFolderContent(testFolder, (err, data) => {
                expect(err).to.be.null;

                expect(data).to.be.a("Array");
                expect(data).eql(files);

                done();
            });
        });
    });

    it("getBowerContent", (done) => {
        utils.getBowerContent(testFolder).then(
            function (files) {
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
            function (err) {
                done(err);
            }
        );
    });

    it.skip("getNpmCredentials", (done) => {
        utils.getNpmCredentials((err, data) => {
            expect(err).to.be.null;

            expect(data).to.include.keys("pass");
            expect(data).to.include.keys("usr");

            expect(data.pass.length).to.be.at.least(1);
            expect(data.usr.length).to.be.at.least(1);

            done();
        });
    });

    it("readJsonFromFile", (done) => {
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

    it("createUpackJson", (done) => {
        utils.createUpackJson(testFolder).then(
            function (res) {
                try {
                    expect(res).eql({
                        "json": path.join(testFolder, "upack.json"),
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
            function (err) {
                done(err);
            }
        );
    });
});
