var ejs = require("ejs");
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
//viewレンダリングエンジンをejsに設定
app.set('view engine', 'ejs');

//ファイルへのパス
var index_filename = __dirname + "/template/index.ejs";
var main_filename = __dirname + "/template/main.ejs";
app.use(bodyParser.urlencoded({
    extended: true
}));


//データベース設定
var mongodb = require("mongodb");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
//データベースの中身を設定
var Schema = mongoose.Schema;
//データベースの中身を具体的にカラムごと設定
var users = mongoose.Schema({
    name: String
});
//データベースの一般的なモデルを"User"として命名
mongoose.model('User', users);
//モデルの型を取得
var User = mongoose.model("User");
////型からインスタンス取得
//var user = new User();
//user.name = "kenzo";
//user.save(function (err) {
//    if (err) throw err;
//    console.log("データ挿入成功");
//})



////fs.readFileSync(file[, options])はファイル読み込みのみ。readFileの同期ver
//var content = {
//    title: "目標決める君",
//    count: 0
//}

app.get("/", function (req, res) {
    var userlists = [];
    //mongodbに検索かける
    User.find({}, function (err, users) {
        if (!err) {
            console.log("num of item => " + users.length)
            for (var i = 0; i < users.length; i++) {
                userlists.push(users[i]);
            }
            res.render(index_filename, {
                title: "目標決める君",
                userlists: userlists
            });
        } else {
            console.log("find error")
        }
    });
});

app.get("/404", function (req, res) {
    throw new Error("NOT FOUND")
})

app.post("/", function (req, res) {
    res.render(main_filename, {
        name: req.body.name
    })
})

app.listen(3000, function () {
    console.log("接続完了！");
});