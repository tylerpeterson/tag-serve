var exec = require('child_process').exec,
    Q = require('q'),
    fs = require('fs'),
    rm = Q.denodeify(fs.unlink),
    writeFile = Q.denodeify(fs.writeFile),
    app = require('../app'),
    request = require('supertest');

describe('TagServe', function () {
  var server;

  beforeEach(function (done) {
    writeFile('testfile.html', '<?html?><html><head><title>testfile</title></head><body>text</body></html>')
      .then(function () {
        exec('tag -a testtagfoozywoozy testfile.html', function (err, stdout, stderr) {
          if (err) {
            done(err);
            return;
          }
          app('testtagfoozywoozy').then(function (httpServer) {
            server = httpServer;
            done();
          }, done);
        });
      }, done);
  });

  afterEach(function (done) {
    rm('testfile.html').then(done, done);
  });

  it('should serve the file with a given tag', function (done) {
    request(server)
      .get('/')
      .expect(200, done);
  });
});
