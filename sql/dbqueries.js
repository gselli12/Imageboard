
const login = require("./../secrets.json");
var spicedPg = require('spiced-pg');
const db = spicedPg("postgres:" + login.username + ":" + login.password + "@localhost:5432/imageboard");

var getData = () => {
    return db.query("SELECT image, username, title, description FROM images LIMIT 6;", (err, results) => {
        if (err) {
            throw err;
        } else {
            //console.log(data);
            return(results);
        }
    });

};

var insertData = (data) => {

    db.query("INSERT INTO images (image, username, title) VALUES ($1, $2, $3);", data, (err, results) => {
        if(err) {
            throw err;
        } else {
            console.log(results);
            return(results);
        }
    });
};

module.exports.insertData = insertData;
module.exports.getData = getData;
