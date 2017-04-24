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

push_config("public/scripts/*.*", '/webroot/static/wlmine/aragorn/scripts').then(
    push_config("public/styles/*.*", '/webroot/static/wlmine/aragorn/styles').then(
        push_config("public/views/*.*", '/template/aragorn').then(
            push_config("src/img/*.*", '/webroot/static/wlmine/aragorn/images').then(
                push_config("src/static/**/*.*", '/webroot/static/wlmine/aragorn/scripts')
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

