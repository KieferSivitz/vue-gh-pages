#!/usr/bin/env node
var ncp = require('ncp').ncp;
var fs = require('fs');
var exec = require('child_process').exec;
var rimraf = require('rimraf');
var ghpages = require('gh-pages');
var path = require('path');
var packageJson = require('../../package.json')
var repository = packageJson['homepage'] || null
var isWin = require('os').platform().indexOf('win') > -1;

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
        } else {
            console.log('Finished! production build is ready for gh-pages');
            console.log('Pushed to gh-pages branch')
        }
    });
}

function copy404 () {
    ncp('404.html', 'docs/404.html', function (err) {
        if (err) {
            console.error(err);
        }
    });
}

function copyCNAME () {
    ncp('CNAME', 'docs/CNAME', function (err) {
        if (err) {
            console.error(err);
        }
    });
}


function editForProduction () {
    console.log('Preparing files for github pages');

    fs.readFile('docs/index.html', 'utf-8', function (err, data) {
        if (err) throw err;

        var newValue = data.replace(/src=\//g, 'src=');

        fs.writeFile('docs/index.html', newValue, 'utf-8', function (err) {
            if (err) throw err;
            fs.readFile('docs/index.html', 'utf-8', function (err, data) {
                if (err) throw err;
                var newValue2 = data.replace(/href=\//, 'href=');
                fs.writeFile('docs/index.html', newValue2, 'utf-8', function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        if (repository !== null) {
                            pushToGhPages();
                        }
                    }
                });
            });
        });
    });
}

function checkIfYarn () {
    return fs.existsSync(path.resolve('./' || process.cwd(), 'yarn.lock'));
}

function runBuild () {
    // Create development build
    console.log('Creating production build...');

    const packageManagerName = checkIfYarn() ? 'yarn' : 'npm'

    exec(`${packageManagerName} run build`, function () {
        // Move the dist folder to docs for gh-pages
        ncp.limit = 16;

        ncp('dist', 'docs', function (err) {
            if (err) {
                return console.error(err);
            }
            console.log('Build Complete.');
            const pathToBuild = 'dist';
            var removeDist = 'rm -r ' + pathToBuild;
            if (isWin) {
                removeDist = 'rd /s /q "' + pathToBuild + '"';
            }
            exec(removeDist, function (err, stdout, stderr) {
                if (err) {
                    console.error(err)
                } else {
                    if (fs.existsSync('CNAME')) {
                        copyCNAME()
                    }
                    if (fs.existsSync('404.html')) {
                        copy404()
                    }
                    editForProduction()
                }
            });
        });
    }).stderr.pipe(process.stderr);
}

if (fs.existsSync('docs')) {
    var pathToDocs = 'docs';

    rimraf(pathToDocs, function () {
        runBuild();
    });
} else {
    runBuild();
}