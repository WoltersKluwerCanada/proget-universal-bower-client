"use strict";

import {expect} from "chai";
import {exec} from "child_process";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import Server from "../server/server";

const server = new Server();
const cliPath = path.join(__dirname, "..", "..", "lib", "src", "index");
const testServerAdr = `http://localhost:${server.port}/upack/testFeed`;

describe("deploy", function() {
    const testFolder = path.join(__dirname, "..", "..", "test", "data", "deploy");
    const dataFolder = path.join(__dirname, "..", "..", "test", "data", "bowerPkgExample");

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
            exec(`node ${cliPath} --deploy ${testFolder} --source ${testServerAdr}`,
                {cwd: __dirname},
                (err) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                        // The file is not suppose to be the same because it is a new one, create on deploy
                        expect(server.lastFileInfo.same).be.false;
                        done();
                    }
                }
            );
        });

        it("with force parameter", function(done) {
            // TODO validate if this parameter use the --force flag
            // First create a package
            exec(`node ${cliPath} --deploy ${testFolder} --source ${testServerAdr} --force`,
                {cwd: __dirname},
                (err) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                        // The file is not suppose to be the same because it is a new one, create on deploy
                        expect(server.lastFileInfo.same).be.false;
                        done();
                    }
                }
            );
        });
    });

    describe("cwd folder", function() {
        it("no parameter", function(done) {
            exec(`node ${cliPath} --deploy . --source ${testServerAdr}`,
                {cwd: testFolder},
                (err) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                        // The file is not suppose to be the same because it is a new one, create on deploy
                        expect(server.lastFileInfo.same).be.false;
                        done();
                    }
                }
            );
        });

        it("with force parameter", function(done) {
            // TODO validate if this parameter use the --force flag
            // First create a package
            exec(`node ${cliPath} --deploy . --source ${testServerAdr} --force`,
                {cwd: testFolder},
                (err) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                        // The file is not suppose to be the same because it is a new one, create on deploy
                        expect(server.lastFileInfo.same).be.false;
                        done();
                    }
                }
            );
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
        exec(`node ${cliPath} -d . --source ${testServerAdr}`,
            {cwd: testFolder},
            (err) => {
                if (err) {
                    done(err);
                } else {
                    expect(server.lastFileInfo.name).eql("test-packBower.0.0.0.upack");
                    // The file is not suppose to be the same because it is a new one, create on deploy
                    expect(server.lastFileInfo.same).be.false;
                    done();
                }
            }
        );
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
                    done(err);
                });
            } else {
                server.stopServer(done);
            }
        });
    });
});
