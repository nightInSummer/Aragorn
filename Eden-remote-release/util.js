//paths
var PROJECT_ROOT;
var TEMP_ROOT;
var fs = require('fs');
var Url = require('url');
var pth = require('path');
var log = require('./log');
var lodash = require('lodash');
var IS_WIN = process.platform.indexOf('win') === 0;
var iconv;

function getIconv() {
    if (!iconv) {
        iconv = require('iconv-lite');
    }
    return iconv;
}

function getTmpFile() {
    return _.getTempPath('deploy.json');
}


function deployInfo(options) {
    var conf = getTmpFile();

    if (arguments.length) {
        // setter
        return options && _.write(conf, JSON.stringify(options, null, 2));
    } else {
        var ret = null;

        try {
            // getter
            ret = _.isFile(conf) ? require(conf) : null;
        } catch (e) {

        }
        return ret;
    }
};

/**
 * 工具类操作集合。{@link https://lodash.com/ lodash} 中所有方法都挂载在此名字空间下面。
 * @param  {String} path
 * @return {String}
 * @example
 *   /a/b//c\d/ -> /a/b/c/d
 * @namespace fis.util
 */

var _ = module.exports = function(path) {
    var type = typeof path;
    if (arguments.length > 1) {
        path = Array.prototype.join.call(arguments, '/');
    } else if (type === 'string') {
        //do nothing for quickly determining.
    } else if (type === 'object') {
        path = Array.prototype.join.call(path, '/');
    } else if (type === 'undefined') {
        path = '';
    }
    if (path) {
        path = pth.normalize(path.replace(/[\/\\]+/g, '/')).replace(/\\/g, '/');
        if (path !== '/') {
            path = path.replace(/\/$/, '');
        }
    }
    return path;
};

// 将lodash内部方法的引用挂载到utils上，方便使用
lodash.assign(_, lodash);


_.upload = function(receiver, to, data, release, content, file, callback) {
    //var subpath = file.subpath;
    //console.log('xietian', file);
    //process.stdout.write('xietian' + );
    data['to'] = _(pth.join(to, pth.basename(file)));
    _.push(
        //url, request options, post data, file
        receiver, null, data, content, file,
        function(err, res) {
            var json = null;
            res = res && res.trim();
            try {
                json = res ? JSON.parse(res) : null;
            } catch (e) {}

            if (!err && json && json.errno) {
                callback(json);
            } else if (err || !json && res != '0') {
                callback('upload file [' + file + '] to [' + to + '] by receiver [' + receiver + '] error [' + (err || res) + ']');
            } else {
                var time = '[' + log.now(true) + ']';
                process.stdout.write(
                    '\n - ' +
                    time + ' ' +
                    file +
                    ' >> ' +
                    to + release
                );
                callback();
            }
        }
    );
};

_.fetch = function(url, data, callback) {
    var endl = '\r\n';
    var collect = [];
    var opt = {};

    _.map(data, function(key, value) {
        collect.push(key + '=' + encodeURIComponent(value))
    });

    var content = collect.join('&');
    opt.method = opt.method || 'POST';
    opt.headers = _.assign({
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }, opt.headers || {});
    opt = _.parseUrl(url, opt);
    var http = opt.protocol === 'https:' ? require('https') : require('http');
    var req = http.request(opt, function(res) {
        var status = res.statusCode;
        var body = '';
        res
            .on('data', function(chunk) {
                body += chunk;
            })
            .on('end', function() {
                if (status >= 200 && status < 300 || status === 304) {
                    var json = null;
                    try {json = JSON.parse(body);} catch(e) {};

                    if (!json || json.errno) {
                        callback(json || 'The response is not valid json string.')
                    } else {
                        callback(null, json);
                    }
                } else {
                    callback(status);
                }
            })
            .on('error', function(err) {
                callback(err.message || err);
            });
    });
    req.write(content);
    req.end();
};

_.requireEmail = function() {
    prompt.get({
        properties: {
            email: {
                pattern: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
                message: 'The specified value must be a valid email address.',
                description: 'Enter your email',
                required: true,
                default: info.email
            }
        }
    }, function(error, ret) {
        if (error) {
            return cb(error);
        }

        info.email = ret.email;
        deployInfo(info);

        fetch(authApi, {
            email: ret.email
        }, function(error, ret) {
            if (error) {
                return cb(error);
            }

            console.log('We\'re already sent the code to your email.')

            _.requireToken(validateApi, info, cb);
        });
    })
};


_.requireToken = function(validateApi, info, cb) {
    prompt.get({
        properties: {
            code: {
                description: 'Enter your code',
                required: true,
                hide: true
            }
        }
    }, function(error, ret) {
        if (error) {
            return cb(error);
        }

        info.code = ret.code;
        deployInfo(info);

        fetch(validateApi, {
            email: info.email,
            code: info.code
        }, function(error, ret) {
            if (error) {
                return cb(error);
            }

            info.token = ret.data.token;
            deployInfo(info);
            cb(null, info);
        });
    })
};

_.deployInfo = function(options) {
    var conf = getTmpFile();

    if (arguments.length) {
        // setter
        return options && _.write(conf, JSON.stringify(options, null, 2));
    } else {
        var ret = null;

        try {
            // getter
            ret = _.isFile(conf) ? require(conf) : null;
        } catch (e) {

        }
        return ret;
    }
};

/**
 * 遵从RFC规范的文件上传功能实现
 * @param  {String}   url      上传的url
 * @param  {Object}   opt      配置
 * @param  {Object}   data     要上传的formdata，可传null
 * @param  {String}   content  上传文件的内容
 * @param  {String}   subpath  上传文件的文件名
 * @param  {Function} callback 上传后的回调
 * @memberOf fis.util
 * @name upload
 * @function
 */

_.push = function(url, opt, data, content, subpath, callback) {
    if (typeof content === 'string') {
        content = new Buffer(content, 'utf8');
    } else if (!(content instanceof Buffer)) {
        log.error('unable to upload content [%s]', (typeof content));
    }
    opt = opt || {};
    data = data || {};
    var endl = '\r\n';
    var boundary = '-----np' + Math.random();
    var collect = [];
    _.map(data, function(key, value) {
        collect.push('--' + boundary + endl);
        collect.push('Content-Disposition: form-data; name="' + key + '"' + endl);
        collect.push(endl);
        collect.push(value + endl);
    });
    collect.push('--' + boundary + endl);
    collect.push('Content-Disposition: form-data; name="' + (opt.uploadField || "file") + '"; filename="' + subpath + '"' + endl);
    collect.push(endl);
    collect.push(content);
    collect.push(endl);
    collect.push('--' + boundary + '--' + endl);

    var length = 0;
    collect.forEach(function(ele) {
        if (typeof ele === 'string') {
            length += new Buffer(ele).length;
        } else {
            length += ele.length;
        }
    });

    opt.method = opt.method || 'POST';
    opt.headers = _.assign({
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': length
    }, opt.headers || {});
    opt = _.parseUrl(url, opt);
    var http = opt.protocol === 'https:' ? require('https') : require('http');
    var req = http.request(opt, function(res) {
        var status = res.statusCode;
        var body = '';
        res
            .on('data', function(chunk) {
                body += chunk;
            })
            .on('end', function() {
                if (status >= 200 && status < 300 || status === 304) {
                    callback(null, body);
                } else {
                    callback(status);
                }
            })
            .on('error', function(err) {
                callback(err.message || err);
            });
    });
    collect.forEach(function(d) {
        req.write(d);
    });
    req.end();
};

/**
 * 对象枚举元素遍历，若merge为true则进行_.assign(obj, callback)，若为false则回调元素的key value index
 * @param  {Object}   obj      源对象
 * @param  {Function|Object} callback 回调函数|目标对象
 * @param  {Boolean}   merge    是否为对象赋值模式
 * @memberOf fis.util
 * @name map
 * @function
 */
_.map = function(obj, callback, merge) {
    var index = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (merge) {
                callback[key] = obj[key];
            } else if (callback(key, obj[key], index++)) {
                break;
            }
        }
    }
};


/**
 * url解析函数，规则类似require('url').parse
 * @param  {String} url 待解析的url
 * @param  {Object} opt 解析配置参数 { host|hostname, port, path, method, agent }
 * @return {Object}     { protocol, host, port, path, method, agent }
 * @memberOf fis.util
 * @name parseUrl
 * @function
 */

_.parseUrl = function(url, opt) {
    opt = opt || {};
    url = Url.parse(url);
    var ssl = url.protocol === 'https:';
    opt.host = opt.host || opt.hostname || ((ssl || url.protocol === 'http:') ? url.hostname : 'localhost');
    opt.port = opt.port || (url.port || (ssl ? 443 : 80));
    opt.path = opt.path || (url.pathname + (url.search ? url.search : ''));
    opt.method = opt.method || 'GET';
    opt.agent = opt.agent || false;
    return opt;
};


/**
 * 返回由 root 和 args 拼接成的标准路径。
 * @param  {String} root rootPath
 * @param  {String|Array} args 后续路径
 * @return {String}      标准路径格式
 * @example
 *   getPath('/Users/', ['apple', '/someone/', '/Destop/']) === getPath('/Users/', 'apple/someone//Destop/')
 *   /Users/apple/someone/Destop
 */

_.getPath = function(root, args) {
    if (args && args.length > 0) {
        args = root + '/' + Array.prototype.join.call(args, '/');
        return module.exports(args);
    } else {
        return module.exports(root);
    }
};

/**
 * 获取临时文件夹路径
 * @return {String}
 * @function
 * @memberOf fis.project
 * @name getTempPath
 */

_.getTempPath = function() {
    return _.getPath(_.getTempRoot(), arguments);
};

/**
 * 获取临时文件夹根目录，若未手动设置，则遍历用户环境变量中['FIS_TEMP_DIR', 'LOCALAPPDATA', 'APPDATA', 'HOME']这几项是否有设置，有则作为临时目录path，没有则以fis3/.fis-tmp作为临时文件夹
 * @function
 * @memberOf fis.project
 * @name getTempRoot
 */

_.getTempRoot = function() {
    if (!TEMP_ROOT) {
        var list = ['FIS_TEMP_DIR', 'LOCALAPPDATA', 'APPDATA', 'HOME'];
        //var name = fis.cli && fis.cli.name ? fis.cli.name : 'fis';
        var name = 'Eden';
        var tmp;
        for (var i = 0, len = list.length; i < len; i++) {
            if ((tmp = process.env[list[i]])) {
                break;
            }
        }
        tmp = tmp || __dirname + '/../';
        _.setTempRoot(tmp + '/.' + name + '-tmp');
    }
    return TEMP_ROOT;
};

/**
 * 设置并创建临时文件夹
 * @param {String} tmp 临时文件夹路径
 * @function
 * @memberOf fis.project
 * @name setTempRoot
 */

_.setTempRoot = function(tmp) {
    TEMP_ROOT = _.initDir(tmp);
};


/**
 * 初始化文件夹
 * @param  {String} path  文件夹路径
 * @param  {String} title
 * @return {String}       若文件夹已存在返回其觉得对路径，若不存在新建病返回绝对路径，若为文件则打印错误信息，返回path绝对路径
 */
_.initDir = function(path, title) {
    if (fs.existsSync(path)) {
        if (!_.isDir(path)) {
            log.error('unable to set path[%s] as %s directory.', path, title);
        }
    } else {
        _.mkdir(path);
    }
    path = _.realpath(path);
    if (path) {
        return path;
    } else {
        log.error('unable to create dir [%s] for %s directory.', path, title);
    }
};

/**
 * 是否为文件夹
 * @param  {String}  path 路径
 * @return {Boolean}      true为是
 * @memberOf fis.util
 * @name isDir
 * @function
 */
_.isDir = function(path) {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
};

/**
 * 是否为一个文件
 * @param  {String}  path 路径
 * @return {Boolean}      true为是
 * @memberOf fis.util
 * @name isFile
 * @function
 */
_.isFile = function(path) {
    return fs.existsSync(path) && fs.statSync(path).isFile();
};

/**
 * 递归创建文件夹
 * @param  {String} path 路径
 * @param  {Number} mode 创建模式
 * @memberOf fis.util
 * @name mkdir
 * @function
 */
_.mkdir = function(path, mode) {
    if (typeof mode === 'undefined') {
        //511 === 0777
        mode = 511 & (~process.umask());
    }
    if (fs.existsSync(path)) return;
    path.split('/').reduce(function(prev, next) {
        if (prev && !fs.existsSync(prev)) {
            fs.mkdirSync(prev, mode);
        }
        return prev + '/' + next;
    });
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, mode);
    }
};


/**
 * 返回path的绝对路径，若path不存在则返回false
 * @param  {String} path 路径
 * @return {String}      绝对路径
 * @memberOf fis.util
 * @name realpath
 * @function
 */
_.realpath = function(path) {
    if (path && fs.existsSync(path)) {
        path = fs.realpathSync(path);
        if (IS_WIN) {
            path = path.replace(/\\/g, '/');
        }
        if (path !== '/') {
            path = path.replace(/\/$/, '');
        }
        return path;
    } else {
        return false;
    }
};

/**
 * 写文件，若路径不存在则创建
 * @param  {String} path    路径
 * @param  {String} data    写入内容
 * @param  {String} charset 编码方式
 * @param  {Boolean} append  是否为追加模式
 * @memberOf fis.util
 * @name write
 * @function
 */
_.write = function(path, data, charset, append) {
    if (!fs.existsSync(path)) {
        _.mkdir(_.pathinfo(path).dirname);
    }
    if (charset) {
        data = getIconv().encode(data, charset);
    }
    if (append) {
        fs.appendFileSync(path, data, null);
    } else {
        fs.writeFileSync(path, data, null);
    }
};

/**
 * 生成路径信息
 * @param  {String|Array} path 路径，可使用多参数传递：pathinfo('a', 'b', 'c')
 * @return {Object}      @see ext()
 * @memberOf fis.util
 * @name pathinfo
 * @function
 */
_.pathinfo = function(path) {
    //can not use _() method directly for the case _.pathinfo('a/').
    var type = typeof path;
    if (arguments.length > 1) {
        path = Array.prototype.join.call(arguments, '/');
    } else if (type === 'string') {
        //do nothing for quickly determining.
    } else if (type === 'object') {
        path = Array.prototype.join.call(path, '/');
    }
    return _.ext(path);
};

/**
 * path处理
 * @param  {String} str 待处理的路径
 * @return {Object}
 * @example
 * str = /a.b.c/f.php?kw=%B2%E5%BB%AD#addfhubqwek
 *                      {
 *                         origin: '/a.b.c/f.php?kw=%B2%E5%BB%AD#addfhubqwek',
 *                         rest: '/a.b.c/f',
 *                         hash: '#addfhubqwek',
 *                         query: '?kw=%B2%E5%BB%AD',
 *                         fullname: '/a.b.c/f.php',
 *                         dirname: '/a.b.c',
 *                         ext: '.php',
 *                         filename: 'f',
 *                         basename: 'f.php'
 *                      }
 * @memberOf fis.util
 * @name ext
 * @function
 */
_.ext = function(str) {
    var info = _.query(str),
        pos;
    str = info.fullname = info.rest;
    if ((pos = str.lastIndexOf('/')) > -1) {
        if (pos === 0) {
            info.rest = info.dirname = '/';
        } else {
            info.dirname = str.substring(0, pos);
            info.rest = info.dirname + '/';
        }
        str = str.substring(pos + 1);
    } else {
        info.rest = info.dirname = '';
    }
    if ((pos = str.lastIndexOf('.')) > -1) {
        info.ext = str.substring(pos).toLowerCase();
        info.filename = str.substring(0, pos);
        info.basename = info.filename + info.ext;
    } else {
        info.basename = info.filename = str;
        info.ext = '';
    }
    info.rest += info.filename;
    return info;
};

/**
 * path处理，提取path中rest部分(?之前)、query部分(?#之间)、hash部分(#之后)
 * @param  {String} str 待处理的url
 * @return {Object}     {
 *                         origin: 原始串
 *                         rest: path部分(?之前)
 *                         query: query部分(?#之间)
 *                         hash: hash部分(#之后)
 *                      }
 * @memberOf fis.util
 * @name query
 * @function
 */
_.query = function(str) {
    var rest = str,
        pos = rest.indexOf('#'),
        hash = '',
        query = '';
    if (pos > -1) {
        hash = rest.substring(pos);
        rest = rest.substring(0, pos);
    }
    pos = rest.indexOf('?');
    if (pos > -1) {
        query = rest.substring(pos);
        rest = rest.substring(0, pos);
    }
    rest = rest.replace(/\\/g, '/');
    if (rest !== '/') {
        // 排除由于.造成路径查找时因filename为""而产生bug，以及隐藏文件问题
        rest = rest.replace(/\/\.?$/, '');
    }
    return {
        origin: str,
        rest: rest,
        hash: hash,
        query: query
    };
};

/**
 * 读取文件内容
 * @param  {String} path    路径
 * @param  {Boolean} convert 是否使用text方式转换文件内容的编码 @see readBuffer
 * @return {String}         文件内容
 * @memberOf fis.util
 * @name read
 * @function
 */
_.read = function(path, convert) {
    var content = false;
    if (fs.existsSync(path)) {
        content = fs.readFileSync(path);
        if (convert) {
            content = _.readBuffer(content);
        }
    } else {
        log.error('unable to read file[%s]: No such file or directory.', path);
    }
    return content;
};

/**
 * 处理Buffer编码方式
 * @param  {Buffer} buffer 待读取的Buffer
 * @return {String}        判断若为utf8可识别的编码则去掉bom返回utf8编码后的String，若不为utf8可识别编码则返回gbk编码后的String
 * @memberOf fis.util
 * @name readBuffer
 * @function
 */
_.readBuffer = function(buffer) {
    if (_.isUtf8(buffer)) {
        buffer = buffer.toString('utf8');
        if (buffer.charCodeAt(0) === 0xFEFF) {
            buffer = buffer.substring(1);
        }
    } else {
        buffer = getIconv().decode(buffer, 'gbk');
    }
    return buffer;
};

/**
 * 判断Buffer是否为utf8
 * @param  {Buffer}  bytes 待检数据
 * @return {Boolean}       true为utf8
 * @memberOf fis.util
 * @name isUtf8
 * @function
 */
_.isUtf8 = function(bytes) {
    var i = 0;
    while (i < bytes.length) {
        if (( // ASCII
                0x00 <= bytes[i] && bytes[i] <= 0x7F
            )) {
            i += 1;
            continue;
        }

        if (( // non-overlong 2-byte
                (0xC2 <= bytes[i] && bytes[i] <= 0xDF) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF)
            )) {
            i += 2;
            continue;
        }

        if (
            ( // excluding overlongs
                bytes[i] == 0xE0 &&
                (0xA0 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            ) || ( // straight 3-byte
                ((0xE1 <= bytes[i] && bytes[i] <= 0xEC) ||
                bytes[i] == 0xEE ||
                bytes[i] == 0xEF) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            ) || ( // excluding surrogates
                bytes[i] == 0xED &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x9F) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
            )
        ) {
            i += 3;
            continue;
        }

        if (
            ( // planes 1-3
                bytes[i] == 0xF0 &&
                (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            ) || ( // planes 4-15
                (0xF1 <= bytes[i] && bytes[i] <= 0xF3) &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            ) || ( // plane 16
                bytes[i] == 0xF4 &&
                (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x8F) &&
                (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
                (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
            )
        ) {
            i += 4;
            continue;
        }
        return false;
    }
    return true;
};
