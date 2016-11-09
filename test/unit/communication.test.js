"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const path = require("path");
const srv = require("../server/server");
const server = new srv();

const communication = require("../../lib/communication");

describe("communication", function() {
    const pkgFolder = path.join(__dirname, "..", "data", "pkg.upack");

    before(function(done) {
        server.startServer(done);
    });

    it("send a file to ProGet", function(done) {
        // TODO create a fake server here because now we testing on the real one
        communication(pkgFolder, `http://localhost:${server.port}/upack/testFeed/upload`, "testUser", new Buffer("testP4ssw0rd").toString("base64"), (err) => {
            done(err);
        });
    });

    after(function(done) {
        server.stopServer(done);
    });
});
