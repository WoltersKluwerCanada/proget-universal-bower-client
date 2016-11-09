"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");

const pack = require("../../lib/pack");
const share = require("../data/share");

describe("pack", function() {
    const testFolder = path.join(__dirname, "..", "data", "pack");
    const srcFolder = path.join(__dirname, "..", "data", "bowerPkgExample");

    before(function(done) {
        share.createTestFolder(testFolder, done);
    });

    it("first creation", function(done) {
        pack(srcFolder, testFolder, false, (err, data) => {
            try {
                expect(err).to.be.null;

                expect(data).to.have.string(testFolder);

                fs.stat(data, (err) => {
                    done(err);
                });
            } catch (e) {
                done(e);
            }
        });
    });

    it("overwrite", function(done) {
        pack(srcFolder, testFolder, true, (err, data) => {
            try {
                expect(err).to.be.null;

                expect(data).to.have.string(testFolder);

                fs.stat(data, (err) => {
                    done(err);
                });
            } catch (e) {
                done(e);
            }
        });
    });

    after(function(done) {
        share.deleteTestFolder(testFolder, done);
    });
});