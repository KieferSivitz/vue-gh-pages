#!/usr/bin/env node
var ncp = require('ncp').ncp;
var fs = require('fs');
var exec = require('child_process').exec;
require('shelljs/global');

function editForProduction () {
    console.log('Removing / from href and src tags in docs/index.html');


    sed('-i', 'src=/', 'src=', 'docs/index.html');

    sed('-i', 'href=/', 'href=', 'docs/index.html');
}

function runBuild() {
    // Create development build
    console.log('Creating production build (npm run build)');

    exec('npm run build', function () {
         // Move the dist folder to docs for gh-pages
        ncp.limit = 16;

        ncp('dist', 'docs', function (err)      {
            if (err) {
                return console.error(err);
            }else {
                console.log('Files copied, removing dist folder');
                path = 'dist';

                exec('rm -r ' + path, function (err, stdout, stderr) {
                    editForProduction()
                });
            }
        });
    }).stderr.pipe(process.stderr);
}



// Remove existing docs folder if it's there
if (fs.existsSync('docs')) {
    var path = 'docs';

    exec('rm -r ' + path, function (err, stdout, stderr) {
        runBuild();
    });
}else {
    runBuild();
}







