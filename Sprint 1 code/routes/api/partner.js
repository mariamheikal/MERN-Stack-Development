const express= require('express');
const router= express.Router();
const Joi = require('joi');

const partner = require('../../models/Partner');
const PartnerCoworkingSpace = require('../../models/PartnerCoworkingSpace');
const RoomBookings = require('../../models/RoomBookings');
const User=require('../../models/UserProfile');


const users = require('../../models/UserProfile')

//nourhan -------------------------------------------------------------------------------------------------------------------

var objectid = require('mongodb').ObjectID





//Get all bookings of a specific user

router.get('/roombookings/:userID',async (req, res) => {

  

    var userID = parseInt(req.params.userID);



    await User.find({userID : userID},{RoomsBooked : 1, _id :0},(err, roombookings)=>{



        res.send(roombookings);

    })

  

  })



//get a room in a specific coworking space by id

router.get('/cospace/:id/rooms/:id2' ,async (req, res)=>{

    try{

    const test = await User.aggregate([

        {$unwind: "$rooms"},

        {$match: {userID:parseInt(req.params.id),type:"coworkingspace",'rooms.id':parseInt(req.params.id2)}},

         {$project: {schedule:'$rooms.schedule',_id:0}}

    ])

     res.send(test.pop().schedule);

    }

    catch(error){

        res.send("not found")

        console.log("error")

    }

    

});



//book a room , append it to the array of bookings if it is not in my bookings

router.put('/cospace/:id/:userID/rooms/:id2/:id3' ,async(req, res)=>{

    const schedID = req.params.id3;

    const cospaceID = req.params.id;

    const roomID = req.params.id2;



    try{

    const test1 = await User.aggregate([

        {$unwind: "$rooms"},

        {$unwind: "$rooms.schedule"},

        {$match: {userID:parseInt(req.params.id),type:"coworkingspace",'rooms.id':parseInt(req.params.id2),'rooms.schedule.id':parseInt(schedID)}},

        {$project:{reserved:'$rooms.schedule.reserved',_id:0}}

    ])



    //res.send(test1.pop().reserved == "true")

   if(test1.pop().reserved) return res.send({error:'already reserved'})



    const test = await User.aggregate([

        {$unwind: "$rooms"},

        {$unwind: "$rooms.schedule"},

        {$match: {userID:parseInt(req.params.id),type:"coworkingspace",'rooms.id':parseInt(req.params.id2),'rooms.schedule.id':parseInt(schedID)}},

        {$project:{date:'$rooms.schedule.Date',_id:0}}

    ])



    const test3 = await User.aggregate([

        {$unwind: "$rooms"},

        {$unwind: "$rooms.schedule"},

        {$match: {userID:parseInt(req.params.id),type:"coworkingspace",'rooms.id':parseInt(req.params.id2),'rooms.schedule.id':parseInt(schedID)}},

        {$project:{time:'$rooms.schedule.time',_id:0}}

    ])





    const f = await User.findOneAndUpdate({



        'userID' : parseInt(req.params.id)},

    

    {

        $set : {'rooms.$[i].schedule.$[j].reserved' : true, 'rooms.$[i].schedule.$[j].reservedBy' : {uid : parseInt(req.params.userID)}}

    },

    {

        arrayFilters : [{"i.id" : parseInt(roomID)},{"j.id" : parseInt(schedID)}]

    }

    

    )



    await User.findOneAndUpdate({userID : parseInt(req.params.userID)},

    {$addToSet : {RoomsBooked : {bookingID:new objectid(),coworkingSpaceID:parseInt(cospaceID), roomID :parseInt(roomID),

    scheduleID: parseInt(schedID),Date: test.pop().date, time:test3.pop().time}}}, 

    async function(err, model){

               

        if(err)  return handleError(res, err)

        else res.json({msg:'Room was reserved successfully'})

     });

    }

    catch(error){

        console.log(error)

        res.send("Not found")

    }

});



//delete booking and set the reservation boolean to false so others can now book it

router.delete('/method2/RoomBookings/:userID/:bookingID',async (req, res) => {

   // try{

        const test = await User.aggregate([

            {$unwind: "$RoomsBooked"},

            {$match: {userID : parseInt(req.params.userID),'RoomsBooked.bookingID':objectid(req.params.bookingID)}},

            {$project: {'RoomsBooked.bookingID':1,_id:0}}

        ])





     if(test==0) return res.send({error:'booking does not exist.'})





     const test1 = await User.aggregate([

        {$unwind: "$RoomsBooked"},

        {$match: {userID : parseInt(req.params.userID),'RoomsBooked.bookingID':objectid(req.params.bookingID)}},

        {$project: {cospaceID:'$RoomsBooked.coworkingSpaceID',_id:0}}

    ])

    const test2 = await User.aggregate([

        {$unwind: "$RoomsBooked"},

        {$match: {userID : parseInt(req.params.userID),'RoomsBooked.bookingID':objectid(req.params.bookingID)}},

        {$project: {roomid:'$RoomsBooked.roomID',_id:0}}

    ])

    const test3 = await User.aggregate([

        {$unwind: "$RoomsBooked"},

        {$match: {userID : parseInt(req.params.userID),'RoomsBooked.bookingID':objectid(req.params.bookingID)}},

        {$project: {scheduID:'$RoomsBooked.scheduleID',_id:0}}

    ])



    



    const f =await User.findOneAndUpdate({

        'userID' : 3},

    

    {

        $set : {'rooms.$[i].schedule.$[j].reserved' : false, 'rooms.$[i].schedule.$[j].reservedBy' : {}}

    },

    {

        arrayFilters : [{"i.id" : test2.pop().roomid},{"j.id" : test3.pop().scheduID}]

    }

    

    )



    const y =await User.update(

        {userID : parseInt(req.params.userID)},

        {$pull : {RoomsBooked : {bookingID : objectid(req.params.bookingID),}}},{multi : true}, async function(err, model){

               

            if(err)  return handleError(res, err)

            else {

                

                res.json({msg:'reservation was deleted successfully'})

        }

         });

	});






//delete booking from user array + change reserved to false in coworking space array 
router.delete('/RoomBookings/:userID/:bookingID', async (req,res) => {

	try {
		const userID=parseInt(req.params.userID);
		const bookingID= parseInt(req.params.bookingID);
   
        const temp = await RoomBookings.find({userID});
        if(!temp[0])res.send('user id does not exist');
    //res.send(temp);
		const book = temp[0].bookings;
    const temp2 =await book.find(r => r.bookingID === bookingID);
    if(!temp2){

        res.status(404).send('The booking with the given id is not found');

        return;

		};
		const roomID=parseInt(temp2.roomID);
		const scheduleID=parseInt(temp2.scheduleID);
		const coworkingSpaceID=parseInt(temp2.coworkingSpaceID);

    PartnerCoworkingSpace.update({ 'coworkingSpaceID':coworkingSpaceID,'rooms.id':roomID,'rooms.schedule.id':scheduleID}, 
    {$set: {'rooms.$.schedule.reserved':false}}, function(err, model){});
    
	 
	 RoomBookings.update( {userID}, { $pull: { bookings: {bookingID:bookingID} }
	 }, function(err, model){})
		
		
    res.send('booking has been deleted successfully')
	}

	catch(error) {

			// We will be handling the error later

			console.log(error)

	}  

})
//get contact info of admin
router.get('/contactAdmin',async (req,res)=>{
    
    const admin = await User.find({type:"admin"}) 
	res.send('email: '+admin[0].email+'   phone number: '+admin[0].phoneNumber);
 
 }); 




module.exports = router
