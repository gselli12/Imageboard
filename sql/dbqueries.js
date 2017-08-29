const url = require("./../config.json").s3Url;
const login = require("./../secrets.json");
var spicedPg = require('spiced-pg');
const db = spicedPg("postgres:" + login.username + ":" + login.password + "@localhost:5432/imageboard");

var getData = (data) => {
    return new Promise ((resolve, reject) => {
        db.query("SELECT image, username, title, description FROM images;", (err, results) => {
            if (err) {
                reject("error getting images");
            } else {
                for (let i = 0; i < results.rows.length; i ++) {
                    data[i] = {};
                    data[i].url = url + results.rows[i].image;
                    data[i].username = results.rows[i].username;
                    data[i].title = results.rows[i].title;
                    data[i].description = results.rows[i].description;
                }
                //console.log(data);
                resolve(data);
            }
        });
    });
};

module.exports.getData = getData;
