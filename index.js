const express = require('express');
const app = express();
//var bodyParser = require('body-parser');
var spicedPg = require('spiced-pg');
const url = require("./config.json").s3Url;


const login = require("./secrets.json");

const db = spicedPg("postgres:" + login.username + ":" + login.password + "@localhost:5432/imageboard");

app.use(express.static(__dirname + "/public"));

app.use(require('body-parser').urlencoded({
    extended: false
}));


app.get("/home", function(req, res) {
    let images = [];
    return new Promise ((resolve, reject) => {
        db.query("SELECT image FROM images;", (err, results) => {
            if (err) {
                reject("error getting images");
            } else {
                results.rows.forEach((image) => {
                    images.push(url + image.image);
                });

                resolve(images);
            }
        });
    })
        .then((images) => {
            console.log("images", images);
            res.json({'images': images});
        })
        .catch((err) => {
            console.log(err);
        });
});



app.listen(8080, () => {
    console.log("listening on port 8080");
});
