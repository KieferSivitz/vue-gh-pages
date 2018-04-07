#!/usr/bin/env node

"use strict";

const execSync = require("child_process").execSync;
const fs = require("fs");
const ghpages = require("gh-pages");
const ncp = require("ncp").ncp;
const packageJson = require("../../package.json");
const path = require("path");
const repository = packageJson["homepage"] || null;
const rimraf = require("rimraf");

console.time('Deployment Time');

function pushToGhPages() {
    ghpages.publish("docs", {
            "branch": "master",
            "dest": "docs",
            "repo": repository + ".git"
        },
        function(error) {
            if (error) {
                console.log("Push to remote failed, please double check that the homepage field in your package.json links to the correct repository.");
                console.log("The build has completed but has not been pushed to github.");
                return console.error(error);
            }
            console.log("The production build is ready and has been pushed to gh-pages branch.");
            removeDocsDirectory();
        }
    );
}

function removeDocsDirectory(){
    rimraf('docs', function(){
        console.log('________________________________________________________________________________________________________');
        console.log('Deployment complete. Check Master branch for docs directory.  The local docs directory has been removed.');
        console.log('‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾');
        console.timeEnd('Deployment Time');
    })
}

function copyFiles(originalFile, newFile, callback) {
    ncp.limit = 16;
    ncp(originalFile, newFile, function(error) {
        if (error) {
            return console.error(error);
        }
        if (typeof(callback) !== "undefined") {
            return callback();
        }
    });
}

function editForProduction() {
    console.log("Preparing files for github pages");
    if (!fs.existsSync("docs/index.html")) {
        fs.createReadStream("index.html").pipe(fs.createWriteStream("docs/index.html"));
    } 
    fs.readFile("docs/index.html", "utf-8", function(error, data) {
        if (error) {
            return console.error(error);
        }
        const removeLeadingSlash = data.replace(/(src|href)=\//g, "$1=");
        fs.writeFileSync("docs/index.html", removeLeadingSlash);
        if (repository !== null) {
            pushToGhPages();
        }
    });
}

function checkIfYarn() {
    return fs.existsSync(path.resolve("./" || process.cwd(), "yarn.lock"));
}

function runBuild() {
    const packageManagerName = checkIfYarn() ? "yarn" : "npm";
    execSync(`${packageManagerName} run build`, { "stdio": [0, 1, 2] });
    copyFiles("dist", "docs", function() {
        console.log("Build Complete.");
        const pathToBuild = "dist";
        rimraf(pathToBuild, function() {
            const filesToInclude = ["CNAME", "favicon.ico", "404.html"];
            filesToInclude.forEach((file) => {
                if (fs.existsSync(file)) {
                    copyFiles(file, `docs/${file}`);
                }
            });
            editForProduction();
        });
    });
}

if (fs.existsSync("docs")) {
    const pathToDocs = "docs";
    rimraf(pathToDocs, function() {
        runBuild();
    });
} else {
    runBuild();
}