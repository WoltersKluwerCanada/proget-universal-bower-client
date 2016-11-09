"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const chai = require("chai");
const expect = chai.expect;
const exec = require("child_process").exec;
const fs = require("fs-extra");
const path = require("path");
const srv = require("../server/server");
const server = new srv();

const cliPath = path.join(__dirname, "..", "..", "bin", "proget-universal-bower-client");

describe("Version", function() {
    const testFolder = path.join(__dirname, "..", "data", "specifyVersion");
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

    it("pack", function(done) {
        exec(`node ${cliPath} --pack ${testFolder} --Version 1.2.3`, {cwd: __dirname}, (err) => {
            if (err) {
                done(err);
            } else {
                // Test that the file exist
                fs.stat(`${testFolder}/test-packBower.1.2.3.upack`, (err) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
            }
        });
    });

    it("deploy", function(done) {
        exec(`node ${cliPath} --deploy ${testFolder} --Version 1.2.3 --source http://localhost:${server.port}/upack/testFeed`, {cwd: __dirname}, (err) => {
            if (err) {
                done(err);
            } else {
                expect(server.lastFileInfo.name).eql("test-packBower.1.2.3.upack");
                // The file is not suppose to be the same because it is a new one, create on deploy
                expect(server.lastFileInfo.same).be.false;
                done();
            }
        });
    });

    afterEach(function(done) {
        fs.remove(testFolder, (err) => {
            done(err);
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