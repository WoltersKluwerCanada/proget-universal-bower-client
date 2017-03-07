"use strict";

import {exec} from "child_process";
import * as fs from "fs-extra";
import * as path from "path";

const cliPath = path.join(__dirname, "..", "..", "bin", "main");

describe("package", function() {
    const testFolder = path.join(__dirname, "..", "data", "package");
    const testFolderTemp = path.join(__dirname, "..", "data", "packageTmp");
    const testFolderTempWithSpace = path.join(__dirname, "..", "data", "package temp");
    const dataFolder = path.join(__dirname, "..", "data", "bowerPkgExample");

    before(function(done) {
        fs.remove(testFolder, (err) => {
            if (err) {
                done(err);
            } else {
                fs.remove(testFolderTemp, (err_) => {
                    if (err_) {
                        done(err_);
                    } else {
                        fs.remove(testFolderTempWithSpace, (err__) => {
                            done(err__);
                        });
                    }
                });
            }
        });
    });

    beforeEach(function(done) {
        fs.copy(dataFolder, testFolder, (err) => {
            done(err);
        });
    });

    describe("distant folder", function() {
        it("no parameter", function(done) {
            exec(`node ${cliPath} --pack ${testFolder}`, {cwd: __dirname}, (err) => {
                if (err) {
                    done(err);
                } else {
                    fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err__) => {
                        done(err__);
                    });
                }
            });
        });

        it("with force parameter", function(done) {
            // This is a quite long task
            this.timeout(10000);

            // First create a package
            exec(`node ${cliPath} --pack ${testFolder}`, {cwd: __dirname}, (err) => {
                if (err) {
                    done(err);
                } else {
                    // Try to make a new one (will fail if --force don't work)
                    exec(`node ${cliPath} --pack . --force`, {cwd: testFolder}, (err_) => {
                        if (err_) {
                            done(err_);
                        } else {
                            fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err__) => {
                                done(err__);
                            });
                        }
                    });
                }
            });
        });

        it("with outputDirectory parameter", function(done) {
            fs.mkdir(testFolderTemp, (err) => {
                if (err) {
                    done(err);
                } else {
                    exec(`node ${cliPath} --pack ${testFolder} --outputDirectory ${testFolderTemp}`,
                        {cwd: __dirname},
                        (err_) => {
                            if (err_) {
                                done(err_);
                            } else {
                                fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err__) => {
                                    if (err__) {
                                        fs.stat(path.join(testFolderTemp, "test-packBower.0.0.0.upack"), (err_3) => {
                                            if (err_3) {
                                                done(err_3);
                                            } else {
                                                fs.remove(testFolderTemp, (err_4) => {
                                                    done(err_4);
                                                });
                                            }
                                        });
                                    } else {
                                        done(`The file was not created in the folder "${testFolderTemp}".`);
                                    }
                                });
                            }
                        }
                    );
                }
            });
        });
    });

    describe("distant folder with spaces", function() {
        it("with outputDirectory parameter", function(done) {
            fs.mkdir(testFolderTempWithSpace, (err) => {
                if (err) {
                    done(err);
                } else {
                    exec(`node ${cliPath} --pack ${testFolder} --outputDirectory "${testFolderTempWithSpace}"`,
                        {cwd: __dirname},
                        (err_) => {
                            if (err_) {
                                done(err_);
                            } else {
                                fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err__) => {
                                    if (err__) {
                                        fs.stat(path.join(testFolderTempWithSpace, "test-packBower.0.0.0.upack"),
                                            (err_3) => {
                                                if (err_3) {
                                                    done(err_3);
                                                } else {
                                                    fs.remove(testFolderTempWithSpace, (err_4) => {
                                                        done(err_4);
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        done(`The file was not created in the folder "${testFolderTempWithSpace}".`);
                                    }
                                });
                            }
                        }
                    );
                }
            });
        });
    });

    describe("cwd folder", function() {
        it("no parameter", function(done) {
            exec(`node ${cliPath} --pack .`, {cwd: testFolder}, (err) => {
                if (err) {
                    done(err);
                } else {
                    fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err_) => {
                        done(err_);
                    });
                }
            });
        });

        it("with force parameter", function(done) {
            // This is a quite long task
            this.timeout(10000);

            // First create a package
            exec(`node ${cliPath} --pack .`, {cwd: testFolder}, (err) => {
                if (err) {
                    done(err);
                } else {
                    // Try to make a new one (will fail if --force don't work)
                    exec(`node ${cliPath} --pack . --force`, {cwd: testFolder}, (err_) => {
                        if (err_) {
                            done(err_);
                        } else {
                            fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err__) => {
                                done(err__);
                            });
                        }
                    });
                }
            });
        });

        it("with outputDirectory parameter", function(done) {
            fs.mkdir(testFolderTemp, (err) => {
                if (err) {
                    done(err);
                } else {
                    exec(`node ${cliPath} --pack . --outputDirectory ${testFolderTemp}`, {cwd: testFolder}, (err_) => {
                        if (err_) {
                            done(err_);
                        } else {
                            fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err__) => {
                                if (err__) {
                                    fs.stat(path.join(testFolderTemp, "test-packBower.0.0.0.upack"), (err_3) => {
                                        if (err_3) {
                                            done(err_3);
                                        } else {
                                            fs.remove(testFolderTemp, (err_4) => {
                                                done(err_4);
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

    it("short parameter", function(done) {
        exec(`node ${cliPath} -p .`, {cwd: testFolder}, (err) => {
            if (err) {
                done(err);
            } else {
                fs.stat(path.join(testFolder, "test-packBower.0.0.0.upack"), (err_) => {
                    done(err_);
                });
            }
        });
    });

    afterEach(function(done) {
        fs.remove(testFolder, (err) => {
            done(err);
        });
    });

    after(function(done) {
        fs.remove(testFolder, (err) => {
            if (err) {
                done(err);
            } else {
                fs.remove(testFolderTemp, (err_) => {
                    if (err_) {
                        done(err_);
                    } else {
                        fs.remove(testFolderTempWithSpace, (err__) => {
                            done(err__);
                        });
                    }
                });
            }
        });
    });
});
