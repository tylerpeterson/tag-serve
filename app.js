// Run the app with the name of a tag to serve up.
// ex.: node app.js Work

var http = require('http'),
    Q = require('q'),
    exec = require('child_process').exec,
    argv = require('minimist')(process.argv.slice(2)),
    passedTagname = argv._[0],
    ecstatic = require('ecstatic'),
    hackedServe;

(function () {
  var ecstaticMiddleware = ecstatic({root: '/'});
  hackedServe = function (localFilename, res) {
    ecstaticMiddleware({url: localFilename, method: 'GET'}, res);
  };
})();

module.exports = function (tagname) {
  var serverDfd = Q.defer();

  exec('tag -f ' + tagname, function (err, stdout, stderr) {
    if (err) {
      console.log('err running tag', err);
      serverDfd.reject(err);
      return;
    }
    var files = stdout.split(/\r?\n/g);
    files.pop(); // Split returns an empty last entry. Discard it.
    console.log('files for tag:', tagname, files);
    serverDfd.resolve(http.createServer(function (req, res) {
      console.log('request', req.url);
      if (req.url === '/favicon.ico') {
        console.log('failing request for favicon.');
        res.writeHead(404);
        res.end();
        return;
      }
      var file = files.shift();
      console.log('serving file:', file);
      hackedServe(file, res);
    }));
  });
  return serverDfd.promise;
};

if (require.main === module) {
  module.exports(passedTagname).then(function (server) {server.listen(5000);});
}
