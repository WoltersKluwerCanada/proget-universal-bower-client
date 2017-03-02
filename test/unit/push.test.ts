"use strict";

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

    it("use cache for password", function(done) {
        push(
            path.join(testFolder, "..", "bowerPkgExample3", "pkg.upack"),
            `http://localhost:${server.port}/upack/testFeed`,
            null,
            (err?: ErrorN) => {
                expect(err).to.be.null;

                done();
            }
        );
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
            (err?: ErrorN) => {
                expect(err).to.be.null;

                done();
            }
        );
    });

    // TODO Create a test for a wrong password

    after(function(done) {
        server.stopServer(done);
    });
});
