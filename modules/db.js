const MongoClient = require('mongodb').MongoClient;
var dburl = "mongodb://127.0.0.1:27017/";

const DB = "pageye"

// connect DB
function _connectDB(callback){
    MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, (err,db)=>{
        callback(err,db);
    });
}

// connect DB
function connectDB(){
    return new Promise((resolve, reject) => {
        MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, (err,db)=>{
            if (err) {
                reject(resolve)
            }else{
                resolve(db)
            }
        });
    });
}

//插入函数的封装
module.exports.insertOne = function(collection, json, callback){
    _connectDB(function(err,db){
        if(err){
            console.log('数据库连接失败！');
            return;
        }
        dbObject = db.db("pageye");
        dbObject.collection(collection).insertOne(json,(err,result)=>{
            callback(err,result);
            db.close();
        })
    })
};

//删除函数的封装
module.exports.deleteMany = function(collection,json,callback){
    _connectDB(function(err,db){
        if(err){
            console.log('数据库连接失败！');
            return;
        }
        dbObject = db.db("pageye");
        dbObject.collection(collection).deleteMany(json,(err, result)=>{
            callback(err,result);
            db.close();
        });
    });
};

//修改函数的封装
module.exports.updateMany = function(collection,json1,json2,callback){
    _connectDB(function(err,db){
        if(err){
            console.log('数据库连接失败！');
            return;
        }
        dbObject = db.db("pageye");
        dbObject.collection(collection).updateMany(json1, json2, (err,result)=>{
            callback(err,result);
            db.close();
        });
    });
};

//修改函数的封装
module.exports.updateOne = function(collection,json1,json2,callback){
    _connectDB(function(err,db){
        if(err){
            console.log('数据库连接失败！');
            return;
        }
        dbObject = db.db("pageye");
        dbObject.collection(collection).updateOne(json1, json2, (err,result)=>{
            callback(err,result);
            db.close();
        });
    });
};

// 获取集合当中文档的总条数
module.exports.getAllCount = function(collection, callback){
    _connectDB(function(err,db){
        if(err){
            console.log('数据库连接失败！');
            return;
        }
        dbObject = db.db("pageye");
        dbObject.collection(collection).countDocuments({}).then(function(count){
            callback(count);
            db.close();
        });
    });
};

// 查找函数的封装
module.exports.find = function(collection, whereStr, callback){
    _connectDB(function(err,db){
        if(err){
            console.log('数据库连接失败！');
            return;
        }
        dbObject = db.db("pageye");
        dbObject.collection(collection).find(whereStr).toArray(function(err, result) {
            callback(err, result);
            db.close();
        });
    });
};

module.exports._find = function(collection, whereStr) {
    return new Promise((resolve, reject) => {
        connectDB()
            .then(db => {
                db.db(DB).collection(collection).find(whereStr).toArray((err, result) => {
                    db.close()
                    if (err) {
                        reject(err)
                    }else{
                        resolve(result)
                    }
                })
            }).catch(error => resolve(error))
    })
}

module.exports._deleteMany = function(collection, json) {
    return new Promise((resolve, reject) => {
        connectDB()
            .then(db => {
                db.db(DB).collection(collection).deleteMany(json, (err, result) => {
                    db.close()
                    if (err) {
                        reject(err)
                    }else{
                        resolve(result)
                    }
                })
            }).catch(error => resolve(error))
    })
}

module.exports._drop = function(collection) {
    return new Promise((resolve, reject) => {
        connectDB()
            .then(db => {
                db.db(DB).collection(collection).drop((err, result) => {
                    db.close()
                    if (err) {
                        reject(err)
                    }else{
                        resolve(result)
                    }
                })
            }).catch(error => resolve(error))
    })
}