"use strict";

/* tslint:disable:only-arrow-functions no-unused-expression */

import {expect} from "chai";
import {exec} from "child_process";
import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import Server from "../server/server";

const server = new Server();
const cliPath = path.join(__dirname, "..", "..", "bin", "main");
const testServerAdr = `http://localhost:${server.port}/upack/testFeed`;

describe("Version", function() {
    const testFolder = path.join(__dirname, "..", "data", "deploy");
    const dataFolder = path.join(__dirname, "..", "data", "bowerPkgExample");
    const npmrcSource = path.join(__dirname, "..", "data", ".npmrc");
    const npmrcDestination = path.join(testFolder, ".npmrc");

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
            if (err) {
                done(err);
            } else {
                fs.copy(npmrcSource, npmrcDestination, (fileCopyError) => {
                    done(fileCopyError);
                });
            }
        });
    });

    it("pack", function(done) {
        exec(`node ${cliPath} --pack ${testFolder} --Version 1.2.3`, {cwd: __dirname}, (err) => {
            if (err) {
                done(err);
            } else {
                // Test that the file exist
                fs.stat(`${testFolder}/test-packBower.1.2.3.upack`, (fileStatusError) => {
                    if (fileStatusError) {
                        done(fileStatusError);
                    } else {
                        done();
                    }
                });
            }
        });
    });

    it("deploy", function(done) {
        exec(`node ${cliPath} --deploy ${testFolder} --Version 1.2.3 --source ${testServerAdr}`,
            {cwd: __dirname},
            (err) => {
                if (err) {
                    done(err);
                } else {
                    expect(server.lastFileInfo.name).eql("test-packBower.1.2.3.upack");
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
