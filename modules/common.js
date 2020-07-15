const fs = require("fs")
const path = require("path")

// 读文件
exports.readFile = function (filename) {
	var data = fs.readFileSync(path.join(__dirname, "../" + filename))
	return data.toString()
}

// 验证是否登录
exports.validLogin = function(ctx) {
	if(!ctx.session.logined){
		ctx.session.logined = false
		ctx.redirect("/login")
	}
}

// 去重
exports.uniqueArray = function(array) {
    var temp = []; //一个新的临时数组
    for(var i = 0; i < array.length; i++){
        if(temp.indexOf(array[i]) == -1 && array[i] != ''){
            temp.push(array[i]);
        }
    }
    return temp;
}

exports.mkDir = function (filepath) {
    if (!fs.existsSync(filepath)){
        fs.mkdirSync(filepath)
        return true
    }else{
        return false
    }
}

exports.delDir = function (path){
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

exports.compare = function (property){
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}
