"use strict";
/* tslint:disable:max-line-length */
import * as program from "commander";
import * as fs from "fs";
import * as path from "path";
import main from "./main";

/**
 * Parse the path pass to it's absolute form
 */
const parsePath = (element?: string): string => {
    if (element) {
        element = element.replace(/^"/, "").replace(/"$/, "");

        if (path.isAbsolute(element)) {
            return element;
        } else {
            return path.join(process.cwd(), element);
        }
    } else {
        return process.cwd();
    }
};

const errorFct = (err: Error): void => {
    console.error(err);
    process.exit(1);
};

fs.readFile(require.resolve("../../package.json"), {encoding: "utf8"}, (err?: Error, data?: string): void => {
    if (err) {
        errorFct(err);
    } else {
        try {
            const pkg = JSON.parse(data);

            program
                .version(pkg.version, "-v, --version")
                .option("-p --pack [path]", "Create a .upack package. Default: Current working directory.", parsePath, null)
                .option("-o --outputDirectory [path]", "Specifies the directory for the created package file. If not specified, --pack output to the current directory.", parsePath, null)
                .option("-P --push [path]", "Publish the package. Require: --source", parsePath, null)
                .option("-d --deploy [path]", "Create the package and publish it on the server.", parsePath, null)
                .option("-s --source [source]", "The address of the server to deploy to.", undefined, null)
                .option("-V --Version [version]", "Set the package to the specified version.", undefined, null)
                .option("-f --force", "For --pack, can overwrite the package.", null, null)
                .option("-F --Feed [feed]", "Set the feed to the specified feed.", null, null)
                .parse(process.argv);

            main(program);
        } catch (e) {
            errorFct(e);
        }
    }
});
