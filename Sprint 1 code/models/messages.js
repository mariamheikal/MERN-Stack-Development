const mongoose = require('mongoose');

const Schema = mongoose.Schema;
//to create an id that autoincrements each time a document is added

var connection=mongoose.createConnection("mongodb+srv://user:1234@break-it-down-8hjy6.mongodb.net/data?retryWrites=true");

// Create the schema
const messageSchema = new mongoose.Schema({
    name:String,
    message:String,
    email:String,
});


module.exports = messages = connection.model('messages', messageSchema)
