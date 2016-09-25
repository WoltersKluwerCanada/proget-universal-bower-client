"use strict";

const chai = require("chai");
const expect = chai.expect;
const path = require("path");

const push = require("../lib/push");

describe.skip("push", () => {
    let testFolder = path.join(__dirname, "data", "bowerPkgExample");

    it("without destination", (done) => {
        push(path.join(testFolder, "..", "pkg.upack"), "", null, (err) => {
            expect(err).not.to.be.null;

            done();
        });
    });

    it("with specified destination", (done) => {
        // TODO change this test on the test server will be implemented
        push(path.join(testFolder, "..", "pkg.upack"), "http://<proget>/upack/<feed>", null, (err) => {
            expect(err).to.be.null;

            done();
        });
    });
});