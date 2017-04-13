/**
 * 部署到远程开发机脚本
 */
var Q = require('q');
var fs = require('fs');
var glob = require('glob');
var path = require("path");
var deploy_cfg = require('../deploy-config.js');
var Eden_release = require('../Eden-remote-release');
var Q = require('q')

var hostName = process.argv[2];     //捕获机器名字
//
//glob(".scripts/*.js", function (er, files) {
//    push(deploy_cfg[hostName], '/webroot', files);
//});

push_config("public/scripts/*.*", '/webroot/aragorn/scripts').then(
    push_config("public/styles/*.*", '/webroot/aragorn/styles').then(
        push_config("public/views/*.*", '/webroot/aragorn').then(
            push_config("src/img/*.*", '/webroot/aragorn/images').then(
                push_config("src/static/**/*.*", '/webroot/aragorn/scripts')
            )
        )
    )
)

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

