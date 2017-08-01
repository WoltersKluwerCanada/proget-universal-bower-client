"use strict";

/* tslint:disable:only-arrow-functions no-unused-expression */

import {expect} from "chai";
import {exec} from "child_process";
import * as path from "path";

const cliPath = path.join(__dirname, "..", "..", "bin", "main");

describe("help", function() {
    let res1;
    let res2;
    let res3;
    let res4;

    it("no other parameter", function(done) {
        exec(`node ${cliPath} --help`, (err, result) => {
            res1 = result;

            if (err) {
                done(err);
            } else {
                expect(result).contain("Usage: main [options]");
                expect(result).contain("Options:");
                expect(result).contain("-h, --help                   output usage information");

                done();
            }
        });
    });

    it("with other parameter", function(done) {
        exec(`node ${cliPath} --help -p .`, (err, result) => {
            res2 = result;

            if (err) {
                done(err);
            } else {
                expect(result).contain("Usage: main [options]");
                expect(result).contain("Options:");
                expect(result).contain("-h, --help                   output usage information");

                done();
            }
        });
    });

    it("with force parameter", function(done) {
        exec(`node ${cliPath} --help --force`, (err, result) => {
            res3 = result;

            if (err) {
                done(err);
            } else {
                expect(result).contain("Usage: main [options]");
                expect(result).contain("Options:");
                expect(result).contain("-h, --help                   output usage information");

                done();
            }
        });
    });

    it("short parameter", function(done) {
        exec(`node ${cliPath} -h`, (err, result) => {
            res4 = result;

            if (err) {
                done(err);
            } else {
                expect(result).contain("Usage: main [options]");
                expect(result).contain("Options:");
                expect(result).contain("-h, --help                   output usage information");

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
