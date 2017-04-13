/**
 * 部署到远程开发机脚本
 */
var Q = require('q');
var fs = require('fs');
var glob = require('glob');
var path = require("path");
var deploy_cfg = require('../deploy-config.js');
var Eden_release = require('../Eden-remote-release');

var hostName = process.argv[2];     //捕获机器名字
//
//glob(".scripts/*.js", function (er, files) {
//    push(deploy_cfg[hostName], '/webroot', files);
//});

push_config('.scripts/*.js', '/webroot').then(push_config('Eden-remote-release/*.js', '/webroot'));

function push_config(path, to) {
    var deferred = new Q.defer();
    glob(path, function (er, files) {
        push(deploy_cfg[hostName], to, files, deferred);
    });
    return deferred.promise;
}

function push(RD, to, modified, callback) {
    return Eden_release({
        receiver: RD.receiver,
        to: RD.root + to
    }, modified, function() {
        callback.resolve()
    });
}

