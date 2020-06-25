const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

var download = function(filePath, res, callback) {
    while (filePath[filePath.length - 1] == '/') {
        filePath= filePath.substr(0, filePath.length - 1);
    }
    var pos = filePath.length - 1;
    while (pos >= 0 && filePath[pos] != '/' ) pos--;
    pos++;
    var fileName = filePath.substr(pos, filePath.length - pos);

    var stats = fs.statSync(filePath); 
    if(stats.isFile()){
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename='+fileName,
            'Content-Length': stats.size
        });
        fs.createReadStream(filePath).pipe(res);
        callback();
    } 
    else {
        res.end(404);
        callback(err);
    }
};

var upload = function(filePath, req, fileName, callback) {
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';        //设置编辑
    form.uploadDir = filePath;     //设置上传目录
    form.keepExtensions = true;     //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

    form.parse(req, function(err, fields, files) {
        if (err) {
            return console.log(err);
        }

        if (fileName != undefined) {
            fs.renameSync(files.resource.path, path.join(filePath, fileName));
            if (callback) callback(err);
        }
        else {
            fileName = files.resource.name;
            var prefix = 0;
            while (fs.existsSync(path.join(filePath, fileName))) {
                fileName = prefix + files.resource.name;
                prefix++;
            }
            fs.renameSync(files.resource.path, path.join(filePath, fileName));
            if (callback) callback(err);
        }
    });
}

var mkdir = function(dirPath, callback) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, function(err) {
            if (err) {
                callback(err);
            }
            callback();
        });
    }
    else callback();
}

exports.download = download;
exports.upload = upload;
exports.mkdir = mkdir;