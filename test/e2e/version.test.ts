"use strict";

// Set test environment
process.env.TEST_FOLDER_PUBC = `${__dirname}/../`;

import {expect} from "chai";
import {exec} from "child_process";
import * as fs from "fs-extra";
import * as path from "path";

const pkg = fs.readJsonSync(path.join(__dirname, "../../package.json"));
const cliPath = path.join(__dirname, "..", "..", "lib", "src", "index");

describe("version", function() {
    let res1;
    let res2;
    let res3;
    let res4;

    it("no other parameter", function(done) {
        exec(`node ${cliPath} --version`, (err, result) => {
            res1 = result;

            if (err) {
                done(err);
            } else {
                expect(result).contain(pkg.version);

                done();
            }
        });
    });

    it("with other parameter", function(done) {
        exec(`node ${cliPath} --version -p .`, (err, result) => {
            res2 = result;

            if (err) {
                done(err);
            } else {
                expect(result).contain(pkg.version);

                done();
            }
        });
    });

    it("with force parameter", function(done) {
        exec(`node ${cliPath} --version --force`, (err, result) => {
            res3 = result;

            if (err) {
                done(err);
            } else {
                expect(result).contain(pkg.version);

                done();
            }
        });
    });

    it("short parameter", function(done) {
        exec(`node ${cliPath} -v`, (err, result) => {
            res4 = result;

            if (err) {
                done(err);
            } else {
                expect(result).contain(pkg.version);

                done();
            }
        });
    });

    // This command must return the same value each times.
    after(function() {
        expect(res1).eql(res2);
        expect(res1).eql(res3);
        expect(res1).eql(res4);
    });
});
