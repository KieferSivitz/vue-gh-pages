#!/usr/bin/env node

'use strict';

const execSync = require('child_process').execSync;
const fs = require('fs');
const ghpages = require('gh-pages');
const ncp = require('ncp').ncp;
const packageJson = require('../../package.json');
const path = require('path');
const repository = packageJson['homepage'] || null;
const webpackSimpleTemplate = packageJson['wst'] || null;
const rimraf = require('rimraf');
const argv = require('minimist')(process.argv.slice(2));

console.time('Deployment Time');

function pushToGhPages() {
    rimraf('node_modules/gh-pages/.cache', function(){
        let publishOptions = {
                'branch': destinationBranch,
                'dest': `docs`,
                'repo': repository + '.git'
        }
        if (destinationBranch === 'gh-pages' || githubLocation !== '') {
            publishOptions = {
                    'branch': destinationBranch,
                    'repo': repository + '.git'
            }
        }
        ghpages.publish(outputDirectory, publishOptions,
            function(error) {
                if (error) {
                    console.log('Push to remote failed, please double check that the homepage field in your package.json links to the correct repository.');
                    console.log('The build has completed but has not been pushed to github.');
                    return console.error(error);
                }
                console.log(`The production build is ready and has been pushed to the remote branch.`);
                if (preserveDocs === -1) {
                    removeDocsDirectory();
                }
            }
        );
    })
}

function removeDocsDirectory(){
    rimraf(outputDirectory, function(){
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
        if (typeof(callback) !== 'undefined') {
            return callback();
        }
    });
}

function editForProduction() {
    console.log('Preparing files for github pages');
    if (!fs.existsSync(outputDirectory + '/index.html')) {
        fs.createReadStream('index.html').pipe(fs.createWriteStream(outputDirectory + '/index.html'));
    } 
    fs.readFile(outputDirectory + '/index.html', 'utf-8', function(error, data) {
        if (error) {
            return console.error(error);
        }
        const removeLeadingSlash = data.replace(/(src|href)=\//g, '$1=');
        let removeWebpackSimpleTemplate = removeLeadingSlash;
        if (webpackSimpleTemplate) {
            removeWebpackSimpleTemplate = data.replace(webpackSimpleTemplate, '');
        } 
        fs.writeFileSync(outputDirectory + '/index.html', removeWebpackSimpleTemplate);
        if (repository !== null) {
            pushToGhPages();
        }
    });
}

function checkIfYarn() {
    return fs.existsSync(path.resolve('./' || process.cwd(), 'yarn.lock'));
}

function runBuild() {
    packageManagerName = checkIfYarn() ? 'yarn' : 'npm';
    execSync(`${packageManagerName} run build`, { 'stdio': [0, 1, 2] });
    copyFiles('dist', path.resolve(outputDirectory), function() {
        console.log('Build Complete.');
        const pathToBuild = 'dist';
        rimraf(pathToBuild, function() {
            const filesToInclude = ['CNAME', 'favicon.ico', '404.html'];
            filesToInclude.forEach((file) => {
                if (fs.existsSync(file)) {
                    copyFiles(file, outputDirectory + `/${file}`);
                }
            });
            editForProduction();
        });
    });
}
let packageManagerName = 'npm';
let outputDirectory = argv['output'] || argv['o'] || 'docs';
let preserveDocs = argv['preserve'] || argv['p'] || -1;
let destinationBranch = argv['branch'] || argv['b'] || '';
let githubLocation = argv['remote-root'] || argv['r'] || '';
if (destinationBranch === '') {
    destinationBranch = 'master';
}
if (outputDirectory !== 'docs') {
    outputDirectory = `${outputDirectory}/docs`;
}

if (fs.existsSync(outputDirectory)) {
    rimraf(outputDirectory, function() {
        runBuild();
    });
} else {
    runBuild();
}