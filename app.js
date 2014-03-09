// Run the app with the name of a tag to serve up.
// ex.: node app.js Work

var http = require('http'),
    fs = require('fs'),
    exec = require('child_process').exec,
    argv = require('minimist')(process.argv.slice(2)),
    tagname = argv._[0];

exec('tag -f ' + tagname, function (err, stdout, stderr) {
  if (err) {
    console.log('err running tag', err);
    return;
  }
  var files = stdout.split(/\r?\n/g);
  files.pop(); // Split returns an empty last entry. Discard it.
  console.log('files for tag:', tagname, files);
  http.createServer(function (req, res) {
    var file = files.shift();
    console.log('serving file:', file);
    fs.readFile(file, function (err, data) {
      if (err) {
        console.log('err reading file', err);
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }).listen(5000);
});

