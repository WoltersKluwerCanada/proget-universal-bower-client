"use strict";

// Set test environment
process.env.NODE_ENV = "test";

const exec = require("child_process").exec;
const path = require("path");
const fs = require("fs-extra");

const cliPath = path.join(__dirname, "..", "..", "lib", "index");

describe("package", function () {
    const testFolder = path.join(__dirname, "..", "data", "package");
    const testFolderTemp = path.join(__dirname, "..", "data", "packageTmp");
    const testFolderTempWithSpace = path.join(__dirname, "..", "data", "package temp");
    const dataFolder = path.join(__dirname, "..", "data", "bowerPkgExample");

    before(function (done) {
        fs.remove(testFolder, (err) => {
            if (err) {
                done(err);
            } else {
                fs.remove(testFolderTemp, (err) => {
                    if (err) {
                        done(err);
                    } else {
                        fs.remove(testFolderTempWithSpace, (err) => {
                            done(err);
                        });
                    }
                });
            }
        });
    });

    beforeEach(function (done) {
        fs.copy(dataFolder, testFolder, (err) => {
            done(err);
        });
    });

    describe("distant folder", function () {
        it("no parameter", function (done) {
            exec(`node ${cliPath} --pack ${testFolder}`, {cwd: __dirname}, (err) => {
                if (err) {
                    done(err);
                } else {
                    fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err) => {
                        done(err);
                    });
                }
            });
        });

        it("with force parameter", function (done) {
            // This is a quite long task
            this.timeout(10000);

            // First create a package
            exec(`node ${cliPath} --pack ${testFolder}`, {cwd: __dirname}, (err) => {
                if (err) {
                    done(err);
                } else {
                    // Try to make a new one (will fail if --force don't work)
                    exec(`node ${cliPath} --pack . --force`, {cwd: testFolder}, (err) => {
                        if (err) {
                            done(err);
                        } else {
                            fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err) => {
                                done(err);
                            });
                        }
                    });
                }
            });
        });

        it("with outputDirectory parameter", function (done) {
            fs.mkdir(testFolderTemp, (err) => {
                if (err) {
                    done(err);
                } else {
                    exec(`node ${cliPath} --pack ${testFolder} --outputDirectory ${testFolderTemp}`, {cwd: __dirname}, (err) => {
                        if (err) {
                            done(err);
                        } else {
                            fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err) => {
                                if (err) {
                                    fs.stat(path.join(testFolderTemp, "test-packBower.0.0.0.upack"), (err) => {
                                        if (err) {
                                            done(err);
                                        } else {
                                            fs.remove(testFolderTemp, (err) => {
                                                done(err);
                                            });
                                        }
                                    });
                                } else {
                                    done(`The file was not created in the folder "${testFolderTemp}".`);
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    describe("distant folder with spaces", function () {
        it("with outputDirectory parameter", function (done) {
            fs.mkdir(testFolderTempWithSpace, (err) => {
                if (err) {
                    done(err);
                } else {
                    exec(`node ${cliPath} --pack ${testFolder} --outputDirectory "${testFolderTempWithSpace}"`, {cwd: __dirname}, (err) => {
                        if (err) {
                            done(err);
                        } else {
                            fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err) => {
                                if (err) {
                                    fs.stat(path.join(testFolderTempWithSpace, "test-packBower.0.0.0.upack"), (err) => {
                                        if (err) {
                                            done(err);
                                        } else {
                                            fs.remove(testFolderTempWithSpace, (err) => {
                                                done(err);
                                            });
                                        }
                                    });
                                } else {
                                    done(`The file was not created in the folder "${testFolderTempWithSpace}".`);
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    describe("cwd folder", function () {
        it("no parameter", function (done) {
            exec(`node ${cliPath} --pack .`, {cwd: testFolder}, (err) => {
                if (err) {
                    done(err);
                } else {
                    fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err) => {
                        done(err);
                    });
                }
            });
        });

        it("with force parameter", function (done) {
            // This is a quite long task
            this.timeout(10000);

            // First create a package
            exec(`node ${cliPath} --pack .`, {cwd: testFolder}, (err) => {
                if (err) {
                    done(err);
                } else {
                    // Try to make a new one (will fail if --force don't work)
                    exec(`node ${cliPath} --pack . --force`, {cwd: testFolder}, (err) => {
                        if (err) {
                            done(err);
                        } else {
                            fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err) => {
                                done(err);
                            });
                        }
                    });
                }
            });
        });

        it("with outputDirectory parameter", function (done) {
            fs.mkdir(testFolderTemp, (err) => {
                if (err) {
                    done(err);
                } else {
                    exec(`node ${cliPath} --pack . --outputDirectory ${testFolderTemp}`, {cwd: testFolder}, (err) => {
                        if (err) {
                            done(err);
                        } else {
                            fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err) => {
                                if (err) {
                                    fs.stat(path.join(testFolderTemp, "test-packBower.0.0.0.upack"), (err) => {
                                        if (err) {
                                            done(err);
                                        } else {
                                            fs.remove(testFolderTemp, (err) => {
                                                done(err);
                                            });
                                        }
                                    });
                                } else {
                                    done(`The file was not created in the folder "${testFolderTemp}".`);
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    it("short parameter", function (done) {
        exec(`node ${cliPath} -p .`, {cwd: testFolder}, (err) => {
            if (err) {
                done(err);
            } else {
                fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err) => {
                    done(err);
                });
            }
        });
    });

    afterEach(function (done) {
        fs.remove(testFolder, (err) => {
            done(err);
        });
    });

    after(function (done) {
        fs.remove(testFolder, (err) => {
            if (err) {
                done(err);
            } else {
                fs.remove(testFolderTemp, (err) => {
                    if (err) {
                        done(err);
                    } else {
                        fs.remove(testFolderTempWithSpace, (err) => {
                            done(err);
                        });
                    }
                });
            }
        });
    });
});
