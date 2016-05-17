var ejs = require("ejs");
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var method_override = require("method-override");
var express_helpers = require('express-helpers')();
var app = express();

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
//viewレンダリングエンジンをejsに設定
app.set('view engine', 'ejs');
app.use(method_override('_method'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(passport.initialize());

app.use(express.static(__dirname + '/public'));
//ファイルへのパス
var index_filename = __dirname + "/public/template/index.ejs";
var main_filename = __dirname + "/public/template/main.ejs";
var subscribe_filename = __dirname + "/public/template/subscribe.ejs";
var message_filename = __dirname + "/public/template/message.ejs";


//データベース設定
var mongodb = require("mongodb");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
//データベースの中身を設定
var Schema = mongoose.Schema;
//データベースの中身を具体的にカラムごと設定
var users = mongoose.Schema({
    username: {
        type: String, required: true, index: {unique: true}
    }
    , password: {
        type: String
        , required: true
    }
});

users.methods.validPassword = function (pwd) {
    // EXAMPLE CODE!
    return (this.password === pwd);
};
//トップページの認証設定
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            if (!user.validPassword(password)) {
                return done(null, false);
            }
            return done(null, user);
        });
    }
));
//<-----パスワードをシリアル化 

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
// -------------->


var goals = mongoose.Schema({
        top_right: String
        , top_straight: String
        , top_left: String
        , middle_right: String
        , middle_straight: String
        , middle_left: String
        , under_right: String
        , under_straight: String
        , under_left: String
    })
//データベースのモデルを"User"、"Goal"として命名
mongoose.model('User', users);
mongoose.model("Goal", goals);
//モデルの型を取得
var User = mongoose.model("User");
var Goal = mongoose.model("Goal");
var goallists = [];
var userlists = [];
// ルーディング設定


//ログイン機能
app.post('/login', passport.authenticate('local', {
        failureRedirect: '/404',
        successRedirect: '/goals'
    }));

app.get("/", function (req, res) {
    //mongodbに検索かける
    User.find({}, function (err, users) {
        if (!err) {
            for (var i = 0; i < users.length; i++) {
                userlists.push(users[i]);
            }

            res.render(index_filename, {
                title: "目標決める君"
                , userlists: userlists
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
    goallists = [];
    Goal.find({}, function (err, goals) {
        if (err) throw err
        for (var i = 0; i < goals.length; i++) {
            goallists.push(goals[i]);
        }
        res.render(main_filename, {
            name: req.body.name
            , goallists: goallists
        });
    })
});

app.get("/goals", function (req, res) {
    console.log(req)
    goallists = [];
    Goal.find({}, function (err, goals) {
        if (err) throw err
        for (var i = 0; i < goals.length; i++) {
            goallists.push(goals[i]);
        }
        res.render(main_filename, {
            username: req.body.username
            , goallists: goallists
        });
    })
});

app.post("/goals", function (req, res) {
    var goal = new Goal({
        top_right: req.body.top_right
        , top_straight: req.body.top_straight
        , top_left: req.body.top_left
        , middle_right: req.body.middle_right
        , middle_straight: req.body.middle_straight
        , middle_left: req.body.middle_left
        , under_right: req.body.under_right
        , under_straight: req.body.under_straight
        , under_left: req.body.under_left
    , });
    goal.save(function (err) {
        if (err) {
            console.log("保存できてないよ！");
        } else {
            console.log("保存できました！")
        }
    });
    res.redirect("/goals")
})

app.delete("/goals/:id", function (req, res) {
    Goal.findById(req.params.id, function (err, goal) {
        goal.remove();
        res.redirect("/goals")
    });

});

app.get("/subscribe", function (req, res) {
    res.render(subscribe_filename);
})

app.post("/create", function (req, res) {
    var user = new User({
        username: req.body.username
        , password: req.body.password
    })
    user.save(function (err) {
        if (err) throw err;
        res.redirect("/goals");
    })
})

//サーバー接続
app.listen(3000, function () {
    console.log("接続完了！");
});