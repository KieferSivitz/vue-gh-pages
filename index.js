#!/usr/bin/env node
var ncp = require('ncp').ncp;
var fs = require('fs');
var exec = require('child_process').exec;
var rimraf = require('rimraf');

function copyCNAME () {
    ncp('CNAME', 'docs/CNAME', function (err)      {
        if (err) {
            return console.error(err);
        }
        return
    });
}

function editForProduction () {
    console.log('Preparing files for github pages');

    fs.readFile('docs/index.html', 'utf-8', function(err, data){
        if (err) throw err;

        var newValue = data.replace(/src=\//g, 'src=');

        fs.writeFile('docs/index.html', newValue, 'utf-8', function (err) {
            if (err) throw err;
            fs.readFile('docs/index.html', 'utf-8', function(err, data){
                if (err) throw err;
                newValue = data.replace(/href=\//, 'href=');
                fs.writeFile('docs/index.html', newValue, 'utf-8', function (err) {
                    if(fs.existsSync('CNAME')) {
                        copyCNAME()
                    }
                    console.log('Finished! production build is ready for gh-pages');
                });;
            });
        });
    })
}

function runBuild() {
    // Create development build
    console.log('Creating production build');

    exec('npm run build', function () {
         // Move the dist folder to docs for gh-pages
        ncp.limit = 16;

        ncp('dist', 'docs', function (err)      {
            if (err) {
                return console.error(err);
            }else {
                console.log('Build Complete.');
                path = 'dist';

                exec('rm -r ' + path, function (err, stdout, stderr) {
                    editForProduction()
                });
            }
        });
    }).stderr.pipe(process.stderr);
}



// Remove existing docs folder if it exists
if (fs.existsSync('docs')) {
    var path = 'docs';

    rimraf(path, function () {
        runBuild();
    });
}else {
    runBuild();
}
