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
var goals = mongoose.Schema({
    top_right: String,
    top_straight:String,
    top_left: String,
    middle_right: String,
    middle_straight: String,
    middle_left: String,
    under_right: String,
    under_straight: String,
    under_left: String
})
//データベースの一般的なモデルを"User"として命名
mongoose.model('User', users);
mongoose.model("Goal", goals);
//モデルの型を取得
var User = mongoose.model("User");
var Goal = mongoose.model("Goal");
var goallists = [];
var userlists = [];

////型からインスタンス取得
//var user = new User();
//user.name = "kenzo";
//user.save(function (err) {
//    if (err) throw err;
//    console.log("データ挿入成功");
//})

app.get("/", function (req, res) {
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
    goallists =[];
    Goal.find({},function(err,goals){
        if(err) throw err
        for (var i = 0; i<goals.length; i++){
            goallists.push(goals[i]);
        }
        res.render(main_filename, {
        name: req.body.name,
        goallists:goallists
    });
    })
});

app.post("/main" ,function(req,res){
    var goal = new Goal({
        top_right:req.body.top_right,
        top_straight:req.body.top_straight,
        top_left:req.body.top_left,
        middle_right:req.body.middle_right,
        middle_straight:req.body.middle_straight,
        middle_left:req.body.middle_left,
        under_right:req.body.under_right,
        under_straight:req.body.under_straight,
        under_left:req.body.under_left,
    });
    goal.save(function(err){
        if(err){
            console.log("保存できてないよ！");
        }else{
            console.log("保存できました！")
        }
    });
    res.redirect("/main")
})

app.get("/main",function(req,res){
    goallists =[];
    Goal.find({},function(err,goals){
        if(err) throw err
        for (var i = 0; i<goals.length; i++){
            goallists.push(goals[i]);
        }
        res.render(main_filename,{
            name:"岡野",
            goallists:goallists
    });
    })
})

app.listen(3000, function () {
    console.log("接続完了！");
});