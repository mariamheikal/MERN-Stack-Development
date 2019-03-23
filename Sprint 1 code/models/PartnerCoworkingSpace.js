const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const PartnerCoworkingSpaceSchema = new Schema({
    type: {type: String,required: true},
    name: {type: String,required: true},
    //password: {type: String,required: true},
    email: {type: String,required: true},
   phoneNumber: {type: Number,required: true},
address:{type:String,required: false},
description:{type:String,required: false},
facilities:{type:Array,required: false},
rooms:{type:Array,required: false},
},
{ versionKey: false}
);
module.exports = PartnerCoworkingSpace = mongoose.model('PartnerCoworkingSpace', PartnerCoworkingSpaceSchema);
