require("dotenv").config();
const mongoose = require("mongoose");

exports.connect = () =>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("database successfully connected");
    })
    .catch((error) =>{
        console.error(error);
        console.log("error in db connection");
        process.exit(1);
    })
}
