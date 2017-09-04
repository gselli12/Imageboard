
const login = require("./../secrets.json");
var spicedPg = require('spiced-pg');
const db = spicedPg("postgres:" + login.username + ":" + login.password + "@localhost:5432/imageboard");

var getData = () => {
    return db.query("SELECT image, username, title, description, id FROM images;", (err, results) => {
        if (err) {
            throw err;
        } else {
            //console.log(data);
            return(results);
        }
    });

};

var insertData = (data) => {
    return db.query("INSERT INTO images (image, username, title, description) VALUES ($1, $2, $3, $4);", data, (err, results) => {
        if(err) {
            throw err;
        } else {
            //console.log(results);
            return(results);
        }
    });
};

var getSingleData = (id) => {
    return db.query("SELECT image, username, title, description FROM images WHERE id = ($1);", id, (err, results) => {
        if(err) {
            throw err;
        } else {
            return(results);
        }
    });
};

var getComments = (id) => {
    return db.query("SELECT comment, username, created_at FROM comments WHERE image_id = ($1);", id, (err, results) => {
        if(err) {
            throw (err);
        } else {
            return (results);
        }
    });
};

var addComment = (data) => {
    return db.query("INSERT INTO comments (image_id, comment, username) VALUES ($1, $2, $3);", data, (err, results) => {
        if(err) {
            throw err;
        } else {
            console.log(results);
            return(results);
        }
    });
};


module.exports.addComment = addComment;
module.exports.getComments = getComments;
module.exports.getSingleData = getSingleData;
module.exports.insertData = insertData;
module.exports.getData = getData;
