"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const chai = require("chai");
const expect = chai.expect;
const path = require("path");
const srv = require("../server/server");
const server = new srv();

const push = require("../../lib/push").default;

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
        push(path.join(testFolder, "..", "pkg.upack"), `http://localhost:${server.port}/upack/testFeed`, null, (err) => {
            expect(err).to.be.null;

            done();
        });
    });

    it("wrong password", function(done) {
        process.env.NODE_ENV = "test2";
        push(path.join(testFolder, "..", "pkg.upack"), `http://localhost:${server.port}/upack/testFeed`, null, (err) => {
            // This need to be before the expect in case an error happen
            process.env.NODE_ENV = "test";

            expect(err).not.to.be.null;

            if (err.code === "EHTTP") {
                //A system with a npm user
                expect(JSON.parse(err.details).statusCode).equal(403);
                done();
            } else if (err.code === "ENODATA") {
                //A system without a npm user
                done();
            } else {
                done("None of the expected error messages (EHTTP or ENODATA) were returned.");
            }
        });
    });

    after(function(done) {
        server.stopServer(done);
    });
});
