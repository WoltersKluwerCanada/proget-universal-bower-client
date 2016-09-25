"use strict";

const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");

const pack = require("../lib/pack");
const share = require("./data/share");

describe("pack", () => {
    let testFolder = path.join(__dirname, "data", "pack"),
        srcFolder = path.join(__dirname, "data", "bowerPkgExample");

    before((done) => {
        share.createTestFolder(testFolder, done);
    });

    it("first creation", (done) => {
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

    it("overwrite", (done) => {
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

    after((done) => {
        share.deleteTestFolder(testFolder, done);
    });
});