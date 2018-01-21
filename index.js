#!/usr/bin/env node
let ncp = require('ncp').ncp;
let fs = require('fs');
let exec = require('child_process').exec;
let rimraf = require('rimraf');
let ghpages = require('gh-pages');
let path = require('path');
let packageJson = require('../../package.json')
let repository = packageJson['homepage'] || null 

function pushToGhPages () {
    ghpages.publish('docs', {
        branch: 'master',
        dest: 'docs',
        repo: repository + '.git'
    },
    function (err) {
        if (err) {
            console.log('Push to remote failed, please double check that the homepage field in your package.json links to the correct repository.')
            console.log('The build has completed but has not been pushed to github.')
            return console.error(err);
        } else {
            console.log('Finished! production build is ready for gh-pages');
            console.log('Pushed to gh-pages branch')
        }
    });
}

function copyFiles (originalFile, newFile, callbck) {
    ncp(originalFile, newFile, function (err) {
        if (err) { return console.error(err); }
        callback();
    });
}

function editForProduction () {
    console.log('Preparing files for github pages');

    fs.readFile('docs/index.html', 'utf-8', function (err, data) {
        if (err) { return console.error(err); }

        let replace_src_tags = data.replace(/src=\//g, 'src=');
        let replace_href_tags = data.replace(/href=\//g, 'href=');
        fs.writeFileSync('docs/index.html', replace_src_tags)
        fs.writeFileSync('docs/index.html', replace_href_tags)
        if (repository !== null) { pushToGhPages(); }
    });
}

function checkIfYarn () {
    return fs.existsSync(path.resolve('./' || process.cwd(), 'yarn.lock'));
}

function runBuild () {
    console.log('Creating production build...');

    const packageManagerName = checkIfYarn() ? 'yarn' : 'npm'

    exec(`${packageManagerName} run build`, function () {
        ncp.limit = 16;

        copyFiles('dist', 'docs', function () {
            console.log('Build Complete.');
            const pathToBuild = 'dist';
            rimraf(pathToBuild, function () {
                if (fs.existsSync('CNAME')) {
                    copyFiles('CNAME', 'docs/CNAME')
                }
                if (fs.existsSync('404.html')) {
                    copyFiles('404.html', 'docs/404.html')
                }
                editForProduction()
            });
        });
    }).stderr.pipe(process.stderr);
}

if (fs.existsSync('docs')) {
    const pathToDocs = 'docs';

    rimraf(pathToDocs, function () {
        runBuild();
    });
} else {
    runBuild();
}
