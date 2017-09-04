const express = require('express');
const app = express();
const url = require("./config.json").s3Url;
const{addComment, getComments ,getSingleData, insertData ,getData} = require("./sql/dbqueries.js");
var multer = require('multer');
var uidSafe = require('uid-safe');
var path = require('path');
const knox = require('knox');
let secrets = require('./secrets.json');
const fs = require('fs');

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'schnitzels'
});

var uploadToS3 = (reqfile) => {
    return new Promise((resolve, reject) => {
        const s3Request = client.put(reqfile.filename, {
            'Content-Type': reqfile.mimetype,
            'Content-Length': reqfile.size,
            'x-amz-acl': 'public-read'
        });
        resolve(s3Request);
    });

};


//MIDDLEWARE
var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});

app.use(express.static(__dirname + "/public"));

app.use(require('body-parser').urlencoded({
    extended: false
}));


//ROUTES

app.get("/home", function(req, res) {
    let images = [];
    getData()
        .then((results) => {
            // console.log(imagesToLoad, noOfLoads);
            for (let i = 0; i < results.rows.length; i ++) {
                images[i] = {};
                images[i].url = url + results.rows[i].image;
                images[i].username = results.rows[i].username;
                images[i].title = results.rows[i].title;
                images[i].description = results.rows[i].description;
                images[i].id = results.rows[i].id;
            }
            return(images);
        })
        .then((images) => {
            //console.log(images);
            res.json({'images': images});
        })
        .catch((err) => {
            console.log(err);
        });
});



app.post("/upload", uploader.single('file'), function(req, res) {
    if(req.file) {
        uploadToS3(req.file)
            .then(function(s3Request) {
                const readStream = fs.createReadStream(req.file.path);
                readStream.pipe(s3Request);
                s3Request.on("response", s3Response => {
                    const wasSuccessful = s3Response.statusCode == 200;
                    res.json({
                        success: wasSuccessful
                    });
                });
            }
            )
            .then(() => {
                let data = [req.file.filename, req.body.username ,req.body.title, req.body.description];
                insertData(data);
            });

        console.log(req.file);

    } else {
        res.json({
            success: false
        });
    }
});

app.get("/images/:id", function(req, res) {
    let data = {};
    let comments = [];
    let id = [req.params.id];
    Promise.all([
        getSingleData(id),
        getComments(id)
    ])
        .then((results) => {
            data.image =  url + results[0].rows[0].image;
            data.username = results[0].rows[0].username;
            data.title = results[0].rows[0].title;
            data.description = results[0].rows[0].description;

            for (let i = 0; i < results[1].rows.length; i ++) {
                comments[i] = {};
                comments[i].comment = results[1].rows[i].comment;
                comments[i].username = results[1].rows[i].username;
                comments[i].time = results[1].rows[i].created_at;
            }

            let obj = {
                data: data,
                comments: comments
            };

            return(obj);
        })
        .then((obj) => {
            // console.log("data", obj.data);
            // console.log("comments", obj.comments);
            res.json({
                "data": obj.data,
                "comments": obj.comments
            });
        })
        .catch((err) => {
            console.log(err);
        });

});

app.post("/images/:id", function(req, res){
    let id = req.params.id;
    let comment = req.body.comment;
    let username = req.body.username;
    let data = [id, comment, username];
    addComment(data)
        .then(() => {
            res.json({
                success:true
            });
        });
});


app.listen(8080, () => {
    console.log("listening on port 8080");
});
