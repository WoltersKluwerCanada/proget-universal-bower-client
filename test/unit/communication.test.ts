"use strict";

// Set test environment
process.env.TEST_FOLDER_PUBC = `${__dirname}/../`;

import * as path from "path";
import communication from "../../src/communication";
import Server from "../server/server";

const server = new Server();

describe("communication", function() {
    const pkgFolder = path.join(__dirname, "..", "data", "pkg.upack");

    before(function(done) {
        server.startServer(done);
    });

    it("send a file to ProGet", function(done) {
        // TODO create a fake server here because now we testing on the real one
        communication(pkgFolder,
            `http://localhost:${server.port}/upack/testFeed/upload`,
            "testUser", new Buffer("testP4ssw0rd").toString("base64"),
            (err) => {
                done(err);
            }
        );
    });

    after(function(done) {
        server.stopServer(done);
    });
});
