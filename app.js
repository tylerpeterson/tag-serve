// Run the app with the name of a tag to serve up.
// ex.: node app.js Work

var http = require('http'),
    exec = require('child_process').exec,
    argv = require('minimist')(process.argv.slice(2)),
    tagname = argv._[0],
    ecstatic = require('ecstatic'),
    hackedServe;

(function () {
  var ecstaticMiddleware = ecstatic({root: '/'});
  hackedServe = function (localFilename, res) {
    ecstaticMiddleware({url: localFilename, method: 'GET'}, res);
  };
})();

exec('tag -f ' + tagname, function (err, stdout, stderr) {
  if (err) {
    console.log('err running tag', err);
    return;
  }
  var files = stdout.split(/\r?\n/g);
  files.pop(); // Split returns an empty last entry. Discard it.
  console.log('files for tag:', tagname, files);
  http.createServer(function (req, res) {
    console.log('request', req.url);
    if (req.url === '/favicon.ico') {
      console.log('failing request for favicon.')
      res.writeHead(404);
      res.end();
      return;
    }
    var file = files.shift();
    console.log('serving file:', file);
    hackedServe(file, res);
  }).listen(5000);
});

