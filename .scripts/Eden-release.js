/**
 * 部署到远程开发机脚本
 */
var fs = require('fs');
var glob = require('glob');
var path = require("path");
var deploy_cfg = require('../deploy-config.js');
var Eden_release = require('../Eden-remote-release');

var hostName = process.argv[2];     //捕获机器名字

glob(".scripts/*.js", function (er, files) {
    push(deploy_cfg[hostName], '/webroot', files);
});

function push(RD, to, modified) {
    return Eden_release({
        receiver: RD.receiver,
        to: RD.root + to
    }, modified);
}

