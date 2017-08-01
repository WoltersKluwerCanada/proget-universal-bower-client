"use strict";

/* tslint:disable:only-arrow-functions no-unused-expression */

import {expect} from "chai";
import * as fs from "fs";
import * as path from "path";
import pack from "../../src/pack";
import {createTestFolder, deleteTestFolder} from "../data/share";

describe("pack", function() {
    const testFolder = path.join(__dirname, "..", "data", "pack");
    const srcFolder = path.join(__dirname, "..", "data", "bowerPkgExample");

    before(function(done) {
        createTestFolder(testFolder, done);
    });

    it("first creation", function(done) {
        pack(srcFolder, testFolder, false, (err: Error | null, data: string | null) => {
            try {
                expect(err).to.be.null;

                expect(data).to.have.string(testFolder);

                fs.stat(data, (fileStatusError) => {
                    done(fileStatusError);
                });
            } catch (e) {
                done(e);
            }
        });
    });

    it("overwrite", function(done) {
        pack(srcFolder, testFolder, true, (err: Error | null, data: string | null) => {
            try {
                expect(err).to.be.null;

                expect(data).to.have.string(testFolder);

                fs.stat(data, (fileStatusError) => {
                    done(fileStatusError);
                });
            } catch (e) {
                done(e);
            }
        });
    });

    after(function(done) {
        deleteTestFolder(testFolder, done);
    });
});
