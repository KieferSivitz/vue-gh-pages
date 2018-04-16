var args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});