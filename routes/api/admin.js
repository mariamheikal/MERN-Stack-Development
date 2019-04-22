//--------------------express--------------------
const express = require("express");
const router = express.Router();
var Mongoose = require("mongoose");
var ObjectId = Mongoose.Types.ObjectId;
const Joi = require("joi");
const notifier = require("node-notifier");
const cron = require("cron");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const tokenKey = require("../../config/keys").secretOrKey;
var store = require("store");

//--------------------models--------------------
const users = require("../../models/UserProfile");
const message = require("../../models/messages");

//-------------------pathToSendFile----------------------------
var path = require("path");
const passport = require("passport");

//--------------------get contact info of partner--------------------

router.get("/contact/:pid", async (req, res) => {
  var partner = parseInt(req.params.pid);

  await users.find(
    { userID: partner },
    { email: 1, phoneNumber: 1, _id: 0 },
    (err, r) => {
      res.send(r);
    }
  );
});

//-----------------------chat-----------------------------

router.get("/chat", function(req, res) {
  res.sendFile(path.resolve("./indexx.html"));
});

//--------------------see all updates--------------------
router.get("/viewUpdates", async (req, res) => {
  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      res.sendStatus(403);
    } else {
      if (authorizedData.type === "admin") {
        const updt = await users.find({}, { updates: 1, _id: 1 });
        for (var i = 0; i < updt.length; i++) {
          if (!updt[i] || !updt[i].updates || updt[i].updates.length === 0) {
            updt.splice(i, 1);
            i -= 1; //since array is shifted when we splice
          }
        }
        if (!updt || updt.length === 0)
          return res.status(404).send({ error: "No updates found" });
        res.json(updt);
      } else {
        res.sendStatus(403);
      }
    }
  });
});
//--------------------approve updates--------------------
router.put("/approveUpdates/:id/:uid", async (req, res) => {
  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      res.sendStatus(403);
    } else {
      if (authorizedData.type === "admin") {
        try {
          const userid = req.params.id;

          const updtid = parseInt(req.params.uid);

          const user = await users.findById(userid);
          if (!user || user.length === 0)
            return res.status(404).send({ error: "User does not exist" });

          const update = await users.find(
            { _id: userid, "updates._id": updtid },
            { updates: 1 }
          );
          if (
            !update ||
            update.length === 0 ||
            !update[0] ||
            !update[0].updates[0]
          )
            return res.status(404).send({ error: "Update does not exist" });

          //user may want to deactivate or activate account, therefore, activation can be changed
          const newusers = {
            type:
              update[0].updates[0].type === undefined
                ? user.type
                : update[0].updates[0].type,
            name:
              update[0].updates[0].name === undefined
                ? user.name
                : update[0].updates[0].name,
            email:
              update[0].updates[0].email === undefined
                ? user.email
                : update[0].updates[0].email,
            phoneNumber:
              update[0].updates[0].phoneNumber === undefined
                ? user.phoneNumber
                : update[0].updates[0].phoneNumber,
            field:
              update[0].updates[0].field === undefined
                ? user.field
                : update[0].updates[0].field,
            memberTasks:
              update[0].updates[0].memberTasks === undefined
                ? user.memberTasks
                : update[0].updates[0].memberTasks,
            activation:
              update[0].updates[0].activation === undefined
                ? user.activation
                : update[0].updates[0].activation,
            address:
              update[0].updates[0].address === undefined
                ? user.address
                : update[0].updates[0].address,
            birthday:
              update[0].updates[0].birthday === undefined
                ? user.birthday
                : update[0].updates[0].birthday,
            skills:
              update[0].updates[0].skills === undefined
                ? user.skills
                : update[0].updates[0].skills,
            interests:
              update[0].updates[0].interests === undefined
                ? user.interests
                : update[0].updates[0].interests,
            accomplishments:
              update[0].updates[0].accomplishments === undefined
                ? user.accomplishments
                : update[0].updates[0].accomplishments,
            trainers:
              update[0].updates[0].trainers === undefined
                ? user.trainers
                : update[0].updates[0].trainers,
            trainingPrograms:
              update[0].updates[0].trainingPrograms === undefined
                ? user.trainingPrograms
                : update[0].updates[0].trainingPrograms,
            partners:
              update[0].updates[0].partners === undefined
                ? user.partners
                : update[0].updates[0].partners,
            boardMembers:
              update[0].updates[0].boardMembers === undefined
                ? user.boardMembers
                : update[0].updates[0].boardMembers,
            events:
              update[0].updates[0].events === undefined
                ? user.events
                : update[0].updates[0].events,
            reports:
              update[0].updates[0].reports === undefined
                ? user.reports
                : update[0].updates[0].reports,
            tasks:
              update[0].updates[0].tasks === undefined
                ? user.tasks
                : update[0].updates[0].tasks,
            certificates:
              update[0].updates[0].certificates === undefined
                ? user.certificates
                : update[0].updates[0].certificates,
            website:
              update[0].updates[0].website === undefined
                ? user.website
                : update[0].updates[0].website,
            description:
              update[0].updates[0].description === undefined
                ? user.description
                : update[0].updates[0].description,
            facilities:
              update[0].updates[0].facilities === undefined
                ? user.facilities
                : update[0].updates[0].facilities,
            rooms:
              update[0].updates[0].rooms === undefined
                ? user.rooms
                : update[0].updates[0].rooms
          };

          const updatedUser = await users.update(
            { _id: userid },
            {
              $set: {
                type: newusers.type,
                name: newusers.name,
                email: newusers.email,
                phoneNumber: newusers.phoneNumber,
                field: newusers.field,
                memberTasks: newusers.memberTasks,
                activation: newusers.activation,
                address: newusers.address,
                birthday: newusers.birthday,
                skills: newusers.skills,
                interests: newusers.interests,
                accomplishments: newusers.accomplishments,
                trainers: newusers.trainers,
                trainingPrograms: newusers.trainingPrograms,
                partners: newusers.partners,
                boardMembers: newusers.boardMembers,
                events: newusers.events,
                reports: newusers.reports,
                tasks: newusers.tasks,
                certificates: newusers.certificates,
                website: newusers.website,
                description: newusers.description,
                facilities: newusers.facilities,
                rooms: newusers.rooms
              }
            }
          );

          const approve = await users.update(
            { _id: userid, "updates._id": updtid },
            { $pull: { updates: { _id: updtid } } }
          );

          notify(userid, "Your profile has been updated successfully");

          res.json({ msg: "User updated successfully" });
        } catch (error) {
          console.log(error);
        }
      } else {
        res.sendStatus(403);
      }
    }
  });
});

//--------------------disapprove updates--------------------
router.delete("/disapproveUpdates/:id/:uid", async (req, res) => {
  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      res.sendStatus(403);
    } else {
      if (authorizedData.type === "admin") {
        try {
          const userid = req.params.id;

          const updtid = parseInt(req.params.uid);

          const user = await users.findById(userid);
          if (!user || user.length === 0)
            return res.status(404).send({ error: "User does not exist" });

          const update = await users.find(
            { "updates._id": updtid },
            { updates: 1 }
          );
          if (!update || update.length === 0)
            return res.status(404).send({ error: "Update does not exist" });

          const del = await users.update(
            { _id: userid, "updates._id": updtid },
            { $pull: { updates: { _id: updtid } } }
          );

          notify(
            userid,
            "Sorry your update request was disapproved by an admin"
          );

          res.json({
            msg: "Sorry your update request was disapproved by an admin"
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        res.sendStatus(403);
      }
    }
  });
});

//-------------------------------------------------------------------------------------------------------
//======================================================================================================
//-------------------------------------------------------------------------------------------------------
//--------------------------------------notification with Mail-------------------------------------------

function sendMailToUsers(recieverEmail, subjectff, textxxx) {
  const subjectttt = subjectff;
  const textggg = textxxx;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "breakitdown.se@gmail.com",
      pass: "break_1234"
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  let mailOptions = {
    from: "breakitdown.se@gmail.com",
    to: recieverEmail,
    subject: subjectttt,
    text: textggg
    //   subject: "Hello ✔", // Subject line
    //   text: "Hello world?", // plain text body
    //  html: "<b>Hello world?</b>" // html body
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log("something went wrong please try again later ");
    } else {
      console.log("email sent successfully");
    }
  });
}

//--------------------------------------NotifyUsersToSignContract-------------------------------------------
router.put("/NotifyUsersToSignContract/:PID", async (req, res) => {
  
  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      console.log("ERROR: Could not connect to the protected route");
      res.sendStatus(403);
    } else {
      if(authorizedData.type ==="admin"){
        const PartID = req.params.PID;
        const partner = await users.findOne({ '_id': PartID });
        const email = partner.email;
        const name = partner.name;
        console.log(email);
  
        const { time, date, location } = req.body;
  
        const schema = {
          time: Joi.string().required(),
          date: Joi.string().required(),
          location: Joi.string().required()
        };
  
        const result = Joi.validate(req.body, schema);
  
        if (result.error) {
          return res.send(result.error.details[0].message);
        } else {
          const message = `Hi ${name}! 
                          Thanks for signing up with LirtenHub.
                          To verify your account please meet with one of our team on ${date} at ${time} in ${location}.
                          If the time doesn't suite you, please contact us through our email.`;
  
          // const subject =  "Urgent! LirtenHub Contract & Agreement"
          sendMailToUsers(
            email,
            "Urgent! LirtenHub Contract & Agreement",
            message,
            function(err, data) {
              if (err) {
                res.json(err);
              }
              res.json("email sent successfully");
            }
          );
        }
      }
     else{
       res.sendStatus(403);
     }

    }
  });

});

//--------------------------------------notify users with expiry of their contract-------------------------------------------

async function deactivateAccount(id) {
  const activate = false;
  users.updateOne({ _id: id }, { $set: { activation: activate } }, function(
    err,
    model
  ) {});

  // const user = await users.findOne({'_id':MemID})
  // res.json(user)
}

function Noofmonths(date1, date2) {
  var Nomonths;
  //console.log(date1)
  Nomonths = (date2.getFullYear() - date1.getFullYear()) * 12;
  Nomonths -= date1.getMonth() + 1;
  Nomonths += date2.getMonth() + 1; // we should add + 1 to get correct month number
  return Nomonths <= 0 ? 0 : Nomonths;
}

async function checkExpiryDatePartner(currentDate) {
  const userIds = await users.find({ type: "partner" });
  userIds.forEach(element => {
    const activatedOn = element.membershipExpiryDate;
    const difference = Noofmonths(new Date(activatedOn), new Date(currentDate));
    console.log(difference, element.name);

    if (difference === 11) {
      // console.log('11 months passed')
      // return('11 months passed')

      const message = `Hi ${element.name}! 
                          Your contract with LirtenHub is almost Expired.
                          Please contact one of our team, If you are willing to renew your contract with LirtenHub.
                          Otherwise, your account unfortunately will be deactivated.
                          `;

      const email = element.email;
      sendMailToUsers(
        email,
        "Urgent! LirtenHub Account & Contract Expiration",
        message,
        function(err, data) {
          if (err) {
            res.json(err);
          }
          res.json("email sent successfully");
        }
      );
    } else if (difference > 11) {
      // console.log('not yet')
      // return('not yet')
      deactivateAccount(element._id);
      console.log("----------------");
      console.log(element.name);
    }
  });
}

async function checkExpiryDateMember(currentDate) {
  const userIds = await users.find({ type: "member" });
  userIds.forEach(element => {
    const activatedOn = element.membershipExpiryDate;
    const difference = Noofmonths(new Date(activatedOn), new Date(currentDate));
    console.log(difference, element.name);

    if (difference === 11) {
      // console.log('11 months passed')
      // return('11 months passed')

      const message = `Hi ${element.name}! 
                        Your contract with LirtenHub is almost Expired.
                        Please contact one of our team, If you are willing to renew your contract with LirtenHub.
                        Otherwise, your account unfortunately will be deactivated.
                        `;

      const email = element.email;
      sendMailToUsers(
        email,
        "Urgent! LirtenHub Account & Contract Expiration",
        message,
        function(err, data) {
          if (err) {
            res.json(err);
          }
          res.json("email sent successfully");
        }
      );
    } else if (difference > 11) {
      // console.log('not yet')
      // return('not yet')
      deactivateAccount(element._id);
      console.log("----------------");
      console.log(element.name);
    }
  });
}

async function checkExpiryDateCS(currentDate) {
  const userIds = await users.find({ type: "coworkingSpace" });
  userIds.forEach(element => {
    const activatedOn = element.membershipExpiryDate;
    const difference = Noofmonths(new Date(activatedOn), new Date(currentDate));
    console.log(difference, element.name);

    if (difference === 11) {
      // console.log('11 months passed')
      // return('11 months passed')

      const message = `Hi ${element.name}! 
                        Your contract with LirtenHub is almost Expired.
                        Please contact one of our team, If you are willing to renew your contract with LirtenHub.
                        Otherwise, your account unfortunately will be deactivated.
                        `;

      const email = element.email;
      sendMailToUsers(
        email,
        "Urgent! LirtenHub Account & Contract Expiration",
        message,
        function(err, data) {
          if (err) {
            res.json(err);
          }
          res.json("email sent successfully");
        }
      );
    } else if (difference > 11) {
      // console.log('not yet')
      // return('not yet')
      deactivateAccount(element._id);
      console.log("----------------");
      console.log(element.name);
    }
  });
}

async function checkExpiryDateCA(currentDate) {
  const userIds = await users.find({ type: "consultancyAgency" });
  userIds.forEach(element => {
    const activatedOn = element.membershipExpiryDate;
    const difference = Noofmonths(new Date(activatedOn), new Date(currentDate));
    console.log(difference, element.name);

    if (difference === 11) {
      // console.log('11 months passed')
      // return('11 months passed')

      const message = `Hi ${element.name}! 
                        Your contract with LirtenHub is almost Expired.
                        Please contact one of our team, If you are willing to renew your contract with LirtenHub.
                        Otherwise, your account unfortunately will be deactivated.
                        `;

      const email = element.email;
      sendMailToUsers(
        email,
        "Urgent! LirtenHub Account & Contract Expiration",
        message,
        function(err, data) {
          if (err) {
            res.json(err);
          }
          res.json("email sent successfully");
        }
      );
    } else if (difference > 11) {
      // console.log('not yet')
      // return('not yet')
      deactivateAccount(element._id);
      console.log("----------------");
      console.log(element.name);
    }
  });
}

var todate = new Date();
var date = todate.getFullYear() + "-" + (todate.getMonth() + 1) + "-" + todate.getDate();

// const job = cron.job('* * * * * *', () =>
//       console.log("--------Partner--------"),
//       checkExpiryDatePartner(todate),
//       console.log("--------Member--------"),
//       checkExpiryDateMember(todate),
//       console.log("----------CS----------"),
//       checkExpiryDateCS(todate),
//       console.log("----------CA----------"),
//       checkExpiryDateCA(todate)

// );
// job.start()


//--------------------------- admin check task description ---------------------------------------------
router.get("/CheckTaskDescriptions/:PID/:TID", async (req, res) => {
    jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
      if (err) {
        //If error send Forbidden (403)
        console.log("ERROR: Could not connect to the protected route");
        res.sendStatus(403);
      } else {
        if(authorizedData.type === "admin"){
          const id = req.params.PID;
          const PartID = ObjectId(id);
          const partner = await users.findOne(PartID);
          const Task_id = parseInt(req.params.TID);
      
          if (partner === null) {
            res.json("the database has no partner with the given ID");
          } else {
            const partner2 = await users.findOne(PartID);
      
            const task = partner2.tasks;
            const task_to_check = task.find(task => task.taskID === Task_id);
            res.json(task_to_check);
          }
        }
        else{
          res.sendStatus(403)
        }
      }
    });
});

//
//-------------------------- admin post task on main ----------------------------------------------------------
// partner id and task id are passed to the method to be able to access the required task to be checked  whether its approved or not

router.get("/getUnapprovedTasks", async (req, res) => {
  const user = await users.find({type:'partner'})
  var hell=[]
  for(var i=0; i<user.length; i++ ){
    for(var j=0;j<user[i].tasks.length;j++){
      if(user[i].tasks[j].approved===false){
         hell.push(user[i].tasks[j])
      }    
    }
  }
  res.json(hell)

});

router.put("/ApproveTasks/:PID/:TID", async (req, res) => {
  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      console.log("ERROR: Could not connect to the protected route");
      res.sendStatus(403);
    } else {
      if(authorizedData.type === "admin"){
        const id = req.params.PID;
        const PartID = ObjectId(id);
        const partner = await users.findOne(PartID);
        const Task_id = parseInt(req.params.TID);
      
        if (partner === null) {
          res.json("the database has no partner with the given ID");
        } else {
          const task = partner.tasks;
          const task_to_post = task.find(task => task.taskID === Task_id);
      
          if (task_to_post === null)
            res.json("this partner has no task with the given ID");
          else {
            const f = await users.findOneAndUpdate(
              { _id: PartID },
              {
                $set: {
                  "tasks.$[i].approved": true,
                  "tasks.$[i].lirtenHubVerified": true,
                  "tasks.$[i].lifeCycle.0": true
                }
              },
      
              {
                arrayFilters: [{ "i.taskID": Task_id }]
              }
            );
            
            const name =task_to_post.name
            notify(PartID, `Task ${name} was approved!`);
      
            const partners = await users.findOne(PartID);
            const x = partners.tasks;
            const task_to_post2 = x.find(task => task.taskID === Task_id);
            res.json(task_to_post2);
          }
        }
      }
      else{
        res.sendStatus(403)
      }
    }
  });
  

});

router.delete("/DisapproveTasks/:PID/:TID", async (req, res) => {
 
  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      console.log("ERROR: Could not connect to the protected route");
      res.sendStatus(403);
    } else {
      if(authorizedData.type === "admin"){
        const PartID = ObjectId(req.params.PID);
        const partner = await users.findOne(PartID);
        const Task_id = parseInt(req.params.TID);
      
        if (partner === null) {
          res.json("the database has no partner with the given ID");
        } else {
          const task = partner.tasks;
          const task_to_post = task.find(task => task.taskID === Task_id);
      
          if (task_to_post === null)
            res.json("this partner has no task with the given ID");
          else {

            const del = await users.update(
              { _id: PartID, "tasks.taskID": Task_id },
              { $pull: { tasks: { taskID: Task_id } } }
            );


            const name =task_to_post.name
   
            notify(PartID, `Task ${name} was not approved!`);

            const partners = await users.findOne(PartID);
            const x = partners.tasks;
            const task_to_post2 = x.find(task => task.taskID === Task_id);
            res.json(task_to_post2);
          }
        }
      }
      else{
        res.sendStatus(403)
      }
    }
  });


});

//----------------------------- admin activate user's account---------------------------------------------
router.put("/ActivateAccounts/:MID", async (req, res) => {
 
  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      console.log("ERROR: Could not connect to the protected route");
      res.sendStatus(403);
    } 
    
    else {
      if(authorizedData.type === "admin"){
        const MemID = req.params.MID;
        const activate = true;
      
        var todate = new Date();
        var date = todate.getFullYear() + "-" + (todate.getMonth() + 1) + "-" + todate.getDate();
        var time = todate.getHours() + ":" + todate.getMinutes() + ":" + todate.getSeconds();
        var dateTime = date + " " + time;
        //console.log(dateTime);
      
        users.updateOne(
          { _id: MemID },
          { $set: { activation: activate, membershipExpiryDate: dateTime, signedIn: true } },
          function(err, model) {}
        );
      
        const user = await users.findOne({ _id: MemID });
        res.json("account activated successfully")
        console.log("account activated successfully")
      }
      else{
        res.sendStatus(403);
      }
    }
  });
});

//----------------------------- admin get all deactivated accounts---------------------------------------------
router.get('/getDeactivatedAccounts', async(req, res)=>{

  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      console.log("ERROR: Could not connect to the protected route");
      res.sendStatus(403);
    } 
    else {
      if(authorizedData.type === "admin"){
        const deactivatedUsers = await users.find({'activation':false})
        res.json(deactivatedUsers)
      //  console.log(deactivatedUsers)
      }
      else{
        res.sendStatus(403);
      }
    }
  });
});

//----------------------------- admin get unregistered users---------------------------------------------
router.get('/getUnregisteredUsers', async(req, res)=>{

  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      console.log("ERROR: Could not connect to the protected route");
      res.sendStatus(403);
    } 
    else {
      if(authorizedData.type === "admin"){
        const deactivatedUsers = await users.find({ 'signedIn':false})
        res.json(deactivatedUsers)
        //console.log(deactivatedUsers)
      }
      else{
        res.sendStatus(403);
      }
    }
  });
});

//---------------------------------admin assigning the chosen member by partner as an engine with no routes-------------------- 
async function assignMembers(){ 
  var flag=true;
  const partners = await users.find({'type':"partner"} )

  if(partners === undefined || partners.length === 0)
     console.log("no partners found")

  else {
    partners.forEach(async element => {
      const tasks= element.tasks
      const PartID= element._id

      if( tasks === undefined || tasks.length === 0){
       // console.log('1 -->'+element.name)
       // console.log("no tasks for this partner")
      }

      else{
      tasks.forEach(async element2 => {
        const Task_id = element2.taskID
        const applicants =element2.applicants

        if( applicants === undefined || applicants.length === 0 ){
         // console.log("no applicants for this task")
        // console.log('2 -->'+element.name)
        }
  
        else{
        const acceptedApplicant = applicants.find(applicant=> applicant.accepted === true)

        if(acceptedApplicant === undefined || acceptedApplicant.length === 0 ){
         // console.log('no applicant was accepted by the partner yet')
        }

        else{
        const applicantID = acceptedApplicant.applicantID
        //console.log('applicantID:  '+applicantID)
       // console.log('3 -->'+element.name)
        for(var i=0;i<applicants.length;i++){
             if(applicants[i].assigned===true)
            flag=false
         }

         if(flag===true){
          await users.findOneAndUpdate(
            {"_id":PartID},
            { $set: { "tasks.$[i].applicants.$[j].assigned":true,
                      "tasks.$[i].lifeCycle.1":true,
                      "tasks.$[i].assigneeID":applicantID     
            }},
            { arrayFilters: [
                { "i.taskID": Task_id },
                { "j.applicantID": applicantID  }
          ]});
    
          const partner = await users.findOne({ _id: PartID });

          if (partner === null)
            res.json("either the partner or the task id is not correct");
          else {
            const task = partner.tasks;
            const t = task.find(task => task.taskID === Task_id);
            console.log(t)
             await users.updateOne(
                { _id: applicantID },
                { $push: { memberTasks : t } },
                function(err, model) {});
          }
        }}}
      });
      flag = true;
    }});
}}
//assignMembers();

//---------------------------------admin assigning the chosen member by partner as an engine with no routes-------------------- 
async function assignConsultancyAgency(){
  var flag=true;
  const partners = await users.find({'type':"partner"} )

  if(partners === undefined || partners.length === 0)
     console.log("no partners found")

  else {
    partners.forEach(async element => {
      const tasks= element.tasks
      const PartID= element._id

      if( tasks === undefined || tasks.length === 0){
       // console.log('1 -->'+element.name)
     //   console.log("no tasks for this partner")
      }

      else{
      tasks.forEach(async element2 => {
        const Task_id = element2.taskID
        const consultancies =element2.consultancies

        if( consultancies === undefined || consultancies.length === 0 ){
          //console.log('2 -->'+element.name) 
     //     console.log("no consultancies applied for this task")
        }
  
        else{
        const acceptedConsultancy = consultancies.find(consultancy=> consultancy.accepted === true)


        if(acceptedConsultancy === undefined || acceptedConsultancy.length === 0 ){
     //     console.log('no consultancy was accepted by the partner yet')
        }

        else{
        const consultancyID = acceptedConsultancy.consultancyID
      //  console.log('3 -->'+element.name)
        for(var i=0;i<consultancies.length;i++){
             if(consultancies[i].assigned===true)
            flag=false
         }

         if(flag===true){
           await users.findOneAndUpdate(
            {"_id":PartID,},
            { $set: { "tasks.$[i].consultancies.$[j].assigned":true,
                      "tasks.$[i].consultancyAssignedID":consultancyID     
            }},
            { arrayFilters: [
                { "i.taskID": Task_id },
                { "j.consultancyID": consultancyID  }
            ]});
  
            const partner = await users.findOne({ _id: PartID });
            if (partner === null)
              res.json("either the partner or the task id is not correct");
            else {
              const task = partner.tasks;
              const t = task.find(task => task.taskID === Task_id);
              console.log(t)
               await users.updateOne(
                  { _id: consultancyID },
                  { $push: { consultancyTasks : t } },
                  function(err, model) {});
            }
        }}}
      });
      flag = true;
    }});
}}
//assignConsultancyAgency();

//---------------------------------send push notification to users-------------------- 
async function notify(senderIDs, Id, content) {
  const senderID = ObjectId(senderIDs);
  const sender = await users.findOne(senderID);
  const senderName = sender.name
  const ID = ObjectId(Id);
  const user = await users.findOne(ID);
  if (user === null) {
    res.json("the database has no partner with the given ID");
  } else {
    const notificationContent = content;
    const read = false;

    newNotification = {
      senderName,
      notificationContent,
      read
    };

   // console.log(newNotification)
    await users.updateOne(
      { _id: ID },
      { $push: { notifications: newNotification } },
      function(err, model) {}
    );

    const user2 = await users.findOne({ _id: ID });
    const not2 = user2.notifications;
    console.log(not2);
  }
}
// notify( "5c9537e61c9d4400004158be","5c9114781c9d440000a926ce", "sendinggggg")

//---------------------------------get user notification------------------------------- 
router.get('/getNotifications/:id', async (req, res)=>{
  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      console.log("ERROR: Could not connect to the protected route");
      res.sendStatus(403);
    } 
    
    else {
      if(authorizedData.type === "admin"){
        const id = req.params.id;
        const user = await users.findOne({ _id: id });
        if(user === undefined || user.length === 0){
          res.sendStatus(404)

        }
        else{
        const notif = user.notifications
        console.log(notif)
        res.json(notif)
        }

      }
      else{
        res.sendStatus(403);
      }
    }
  });
})


//===================================================================================================================================
//===================================================================================================================================

//----------------------------------view messages----------------------------------
router.get("/viewmessages", async (req, res) => {
  const updt = await message.find();
  res.json({ data: updt });
});

//---------------------------------get all admins--------------------------------------

router.get("/", async (req, res) => {
  const admins = await users.find({ type: "admin" });
  res.json(admins);
});

//---------------------------------get all users--------------------------------------

router.get("/viewUser/:id", async (req, res) => {
  const userId = req.params.id;
  const user = await users.find({ _id: userId }, { updates: 0 });
  res.json(user[0]);
});

router.get("viewAdmin", async (req, res) => {
  jwt.verify(store.get("token"), tokenKey, async (err, authorizedData) => {
    if (err) {
      //If error send Forbidden (403)
      res.sendStatus(403);
    } else {
      const adminID = ObjectId(authorizedData.id);
      const admin= await users.findById(adminID);
      res.json(admin)
    }
  });
});



module.exports = router;
