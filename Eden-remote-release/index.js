/**
 * remote release for Eden
 */

var path = require('path');
var prompt = require('prompt');
var _ = require('./util.js');
prompt.start();

function getContent (str) {
    //if (typeof this._content === 'undefined') {
    //    this._content = _.read(str, true);
    //}
    return _.read(str, true);
}

module.exports = function(options, modified, callback) {
    if (!options.to) {
        throw new Error('options.to is required!');
    }

    var info = _.deployInfo() || {};
    var to = options.to;
    var receiver = options.receiver;
    var authApi = options.authApi;
    var validateApi = options.validateApi;
    var data = options.data || {};

    if (options.host) {
        receiver = options.receiver = options.host + '/v1/upload';
        authApi = options.authApi = options.host + '/v1/authorize';
        validateApi = options.validateApi = options.host + '/v1/validate';
    }

    if (!options.receiver) {
        throw new Error('options.receiver is required!');
    }

    var steps = [];
    modified.forEach(function(file) {
        var reTryCount = options.retry;
        steps.push(function(next) {
            var _upload = arguments.callee;
            data.email = info.email;
            data.token = info.token;
            _.upload(receiver, to, data, '', getContent(file), file, function(error) {
                if (error) {
                    if (error.errno === 100302 || error.errno === 100305) {
                        // 检测到后端限制了上传，要求用户输入信息再继续。

                        if (!authApi || !validateApi) {
                            throw new Error('options.authApi and options.validateApi is required!');
                        }

                        if (info.email) {
                            console.error('\nToken is invalid: ', error.errmsg, '\n');
                        }

                        _.requireEmail(authApi, validateApi, info, function(error) {
                            if (error) {
                                throw new Error('Auth failed! ' + error.errmsg);
                            } else {
                                _upload(next);
                            }
                        });
                    } else if (options.retry && !--reTryCount) {
                        throw new Error(error.errmsg || error);
                    } else {
                        _upload(next);
                    }
                } else {
                    next();
                }
            });
        });
    });


    _.reduceRight(steps, function(next, current) {
        return function() {
            current(next);
        };
    }, callback)();
};

module.exports.options = {
    // 允许重试两次。
    retry: 2
};