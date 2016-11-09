"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const chai = require("chai");
const expect = chai.expect;
const exec = require("child_process").exec;
const path = require("path");
const fs = require("fs-extra");
const srv = require("../server/server");
const server = new srv();

const fileName = "pkg.0.0.0.upack";

const cliPath = path.join(__dirname, "..", "..", "bin", "proget-universal-bower-client");

describe("push", function () {
    const testFolder = path.join(__dirname, "..", "data", "push");

    before(function (done) {
        fs.remove(testFolder, (err) => {
            if (err) {
                done(err);
            } else {
                fs.copy(path.join(__dirname, "..", "data", "pkg.upack"), path.join(testFolder, fileName), (err) => {
                    if (err) {
                        done(err);
                    } else {
                        server.startServer(done);
                    }
                });
            }
        });
    });

    it("cwd folder", function (done) {
        exec(`node ${cliPath} --push ./${fileName} --source http://localhost:${server.port}/upack/testFeed`, {cwd: testFolder}, (err) => {
            if (err) {
                done(err);
            } else {
                expect(server.lastFileInfo.name).eql(fileName);
                // The file is not suppose to be the same because it is a new one, create on deploy
                expect(server.lastFileInfo.same).be.true;
                done();
            }
        });
    });

    it("distant folder", function (done) {
        exec(`node ${cliPath} --push ${testFolder}/${fileName} --source http://localhost:${server.port}/upack/testFeed`, {cwd: __dirname}, (err) => {
            if (err) {
                done(err);
            } else {
                expect(server.lastFileInfo.name).eql(fileName);
                // The file is not suppose to be the same because it is a new one, create on deploy
                expect(server.lastFileInfo.same).be.true;
                done();
            }
        });
    });

    it("short parameter", function (done) {
        exec(`node ${cliPath} -P ${testFolder}/${fileName} --source http://localhost:${server.port}/upack/testFeed`, {cwd: __dirname}, (err) => {
            if (err) {
                done(err);
            } else {
                expect(server.lastFileInfo.name).eql(fileName);
                // The file is not suppose to be the same because it is a new one, create on deploy
                expect(server.lastFileInfo.same).be.true;
                done();
            }
        });
    });

    it("no source", function (done) {
        exec(`node ${cliPath} --push ${testFolder}/${fileName}`, {cwd: __dirname}, (err, res, errLog) => {
            if (err) {
                expect(errLog).eql("Error: You must specify a --source when calling --push.\n");
                done();
            } else {
                done("This command require the parameter --source");
            }
        });
    });

    after(function (done) {
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