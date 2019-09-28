var http = require("http");
var fs = require("fs");
var path = require("path");
var BufferHelper = require("bufferhelper");
var multiparty = require("multiparty");

http
  .createServer(function(request, response) {
    switch (request.url) {
      case "/": {
        var html = fs.readFile("./index.html", function(err, data) {
          if (err) throw err;
          response.writeHead(200, { "Content-Type": "text/html" });
          response.write(data);
          response.end();
        });
        break;
      }
      case "/upload": {
        var bufferHelper = new BufferHelper();
        response.writeHead(200, { "Content-Type": "application/octet-stream" });

        const form = new multiparty.Form({
          uploadDir: "./upload" // 指定文件存储目录
        });

        var p = "";

        form.parse(request);

        form.on("file", (name, file) => {
          p = path.join(__dirname, file.path);
        });
        form.on("close", () => {
          var readStream = fs.createReadStream(p);
          readStream.on("data", function(chunk) {
            bufferHelper.concat(chunk);
          });
          readStream.on("end", function() {
            response.end(bufferHelper.toBuffer());
          });
        });
      }
    }
  })
  .listen(5438, "127.0.0.1");
