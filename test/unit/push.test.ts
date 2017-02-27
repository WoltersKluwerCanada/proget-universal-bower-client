"use strict";

// Set test environment
process.env.TEST_FOLDER_PUBC = `${__dirname}/../`;

import {expect} from "chai";
import * as path from "path";
import ErrorN from "../../src/ErrorN";
import push from "../../src/push";
import Server from "../server/server";

const server = new Server();

describe("push", function() {
    const testFolder = path.join(__dirname, "..", "data", "bowerPkgExample");

    before(function(done) {
        server.startServer(done);
    });

    it("without destination", function(done) {
        push(path.join(testFolder, "..", "data", "pkg.upack"), "", null, (err) => {
            expect(err).not.to.be.null;

            done();
        });
    });

    it("with specified destination", function(done) {
        push(
            path.join(testFolder, "..", "pkg.upack"),
            `http://localhost:${server.port}/upack/testFeed`,
            null,
            (err: ErrorN | null) => {
                expect(err).to.be.null;

                done();
            }
        );
    });

    it("wrong password", function(done) {
        process.env.TEST_FOLDER_PUBC = null;
        push(
            path.join(testFolder, "..", "pkg.upack"),
            `http://localhost:${server.port}/upack/testFeed`,
            null,
            (err: ErrorN | null) => {
                // This need to be before the expect in case an error happen
                process.env.TEST_FOLDER_PUBC = `${__dirname}/../`;

                expect(err).not.to.be.null;

                if (err.code === "EHTTP") {
                    // A system with a npm user
                    expect(JSON.parse(err.details).statusCode).equal(403);
                    done();
                } else if (err.code === "ENOENT") {
                    // A system without a npm user
                    done();
                } else {
                    done(`None of the expected error messages (EHTTP or ENODATA) were returned. Receive: ${err.code}`);
                }
            }
        );
    });

    after(function(done) {
        server.stopServer(done);
    });
});
