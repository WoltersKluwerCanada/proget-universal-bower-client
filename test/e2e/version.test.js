"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const chai = require("chai");
const expect = chai.expect;
const exec = require("child_process").exec;
const path = require("path");

const pkg = require("../../package.json");

const cliPath = path.join(__dirname, "..", "..", "bin", "proget-universal-bower-client");

describe("version", function () {
    let res1;
    let res2;
    let res3;
    let res4;

    it("no other parameter", function (done) {
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

    it("with other parameter", function (done) {
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

    it("with force parameter", function (done) {
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

    it("short parameter", function (done) {
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
    after(function () {
        expect(res1).eql(res2);
        expect(res1).eql(res3);
        expect(res1).eql(res4);
    });
});