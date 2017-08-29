const express = require('express');
const app = express();
const{getData} = require("./sql/dbqueries.js");
//var bodyParser = require('body-parser');


app.use(express.static(__dirname + "/public"));

app.use(require('body-parser').urlencoded({
    extended: false
}));


app.get("/home", function(req, res) {
    let data = [];
    getData(data)
        .then((data) => {
            //console.log("images", images);
            res.json({'images': data});
        })
        .catch((err) => {
            console.log(err);
        });
});



app.listen(8080, () => {
    console.log("listening on port 8080");
});
