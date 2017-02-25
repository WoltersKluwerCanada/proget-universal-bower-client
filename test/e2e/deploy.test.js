"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const chai = require("chai");
const expect = chai.expect;
const exec = require("child_process").exec;
const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const srv = require("../server/server");
const server = new srv();

const cliPath = path.join(__dirname, "..", "..", "lib", "index");

describe("deploy", function() {
    const testFolder = path.join(__dirname, "..", "data", "deploy");
    const dataFolder = path.join(__dirname, "..", "data", "bowerPkgExample");

    before(function(done) {
        fs.remove(testFolder, (err) => {
            if (err) {
                done(err);
            } else {
                server.startServer(done);
            }
        });
    });

    beforeEach(function(done) {
        fs.copy(dataFolder, testFolder, (err) => {
            done(err);
        });
    });

    describe("distant folder", function() {
        it("no parameter", function(done) {
            exec(`node ${cliPath} --deploy ${testFolder} --source http://localhost:${server.port}/upack/testFeed`, {cwd: __dirname}, (err) => {
                if (err) {
                    done(err);
                } else {
                    expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                    // The file is not suppose to be the same because it is a new one, create on deploy
                    expect(server.lastFileInfo.same).be.false;
                    done();
                }
            });
        });

        it("with force parameter", function(done) {
            // TODO validate if this parameter use the --force flag
            // First create a package
            exec(`node ${cliPath} --deploy ${testFolder} --source http://localhost:${server.port}/upack/testFeed --force`, {cwd: __dirname}, (err) => {
                if (err) {
                    done(err);
                } else {
                    expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                    // The file is not suppose to be the same because it is a new one, create on deploy
                    expect(server.lastFileInfo.same).be.false;
                    done();
                }
            });
        });
    });

    describe("cwd folder", function() {
        it("no parameter", function(done) {
            exec(`node ${cliPath} --deploy . --source http://localhost:${server.port}/upack/testFeed`, {cwd: testFolder}, (err) => {
                if (err) {
                    done(err);
                } else {
                    expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                    // The file is not suppose to be the same because it is a new one, create on deploy
                    expect(server.lastFileInfo.same).be.false;
                    done();
                }
            });
        });

        it("with force parameter", function(done) {
            // TODO validate if this parameter use the --force flag
            // First create a package
            exec(`node ${cliPath} --deploy . --source http://localhost:${server.port}/upack/testFeed --force`, {cwd: testFolder}, (err) => {
                if (err) {
                    done(err);
                } else {
                    expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                    // The file is not suppose to be the same because it is a new one, create on deploy
                    expect(server.lastFileInfo.same).be.false;
                    done();
                }
            });
        });
    });

    it("no source", function(done) {
        exec(`node ${cliPath} --deploy ${testFolder}`, {cwd: __dirname}, (err, res, errLog) => {
            if (err) {
                try {
                    expect(errLog).eql("Error: You must specify a --source when calling --deploy.\n");
                    done();
                } catch (err) {
                    done(err);
                }
            } else {
                done("Missing --source parameter must return an error but don't.");
            }
        });
    });

    it("short parameter", function(done) {
        exec(`node ${cliPath} -d . --source http://localhost:${server.port}/upack/testFeed`, {cwd: testFolder}, (err) => {
            if (err) {
                done(err);
            } else {
                expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                // The file is not suppose to be the same because it is a new one, create on deploy
                expect(server.lastFileInfo.same).be.false;
                done();
            }
        });
    });

    afterEach(function(done) {
        fs.remove(testFolder, () => {
            fs.remove(path.join(os.homedir(), "test-packBower.0.0.0.upack"), (err) => {
                done(err);
            });
        });
    });

    after(function(done) {
        fs.remove(testFolder, (err) => {
            if (err) {
                server.stopServer(() => {
                });
                done(err);
            } else {
                server.stopServer(done);
            }
        });
    });
});
