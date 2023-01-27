//route user to different services
//callback is important concept

var formidable = require('formidable');
const res = require('express/lib/response');
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookieParser');
var sess;
var fs = require('fs');
var currSubmissionId;

//create a connection
//good connections to create connections evrey time
//works this way tho

const connection = mysql.createConnection({ //PREMADE connection function
    host:'localhost',
    user:'root',
    password:'1234',
    database:'mydb'
})

//this defines in our database connection

connection.connect((error) => {
    //expecting clalback that potentially has error
    //test
    if(error) 
        console.log('error ' + error)
    //throw error; //not great error trapping

    console.log("Connected to MySQL!")
})


//create variable that holds our services
//can reuse this for sending map data from the submission box

    var services = function(app) {
        //Login Service
        app.post('/auth', function(request, response) { 
            //can also add an admin table
            //would be easier to select from admin vs having to query for an id 
            //Goal: log in user, set loggedin to true
            //Grab user id and tie it to user session
            //capture input fields from html
            //Have to grab sql error and prevent server from crashing ?
            var username = request.body.username;
            var password = request.body.password;
            console.log('services user/pass ' + username + ' ' + password)
            if (username && password) {
                //sql query
                connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results){
                    console.log('mysql user/pass ' + username + ' ' + password)
                    //enter callback hell
                    //handle login (whether successful or not)
                    //var isAdmin = req.isAdmin;
                    //don't need to grab isAdmin yet
                    //userid = results.body.user_id;
                    if (error){
                        //res.send
                        throw error;
                    }
                    //if account exists
                    if (results.length > 0) {
                        //authenticate user, get userid into local var
                        //set loggedin equal to true
                        //using sessions
                        //user id handled server side
                        //other way to do it - handle user id client side
                        //have id stored on windows
                        //scrub user id when user is logged outs
                        //esponse.send('success');
                        sess = request.session;
                        request.session.loggedIn=true;
                        request.session.username=username;
                        console.log('user session logged in ' + request.session.loggedIn);
                        connection.query('SELECT users_id FROM users WHERE username = ?', [username], function(error, results){
                            if (error){
                                //res.send
                                throw error;
                            }
                            else if(results.length>0){
                                request.session.userID=results[0].users_id;
                                console.log('user id: ' + request.session.userID);
                                console.log('username: ' + request.session.username);
                                response.send("success");
                            }
                        
                        });//redirect to mappage
                        //see if user is admin or not
                        //response.redirect('/mapscreen');
                        //return res.status(201).send(JSON.stringify({msg:"SUCCESS: "}));                       
                    }
                    else{
                        //couldn't find user in database
                        console.log('user doesnt exist');
                        response.send('invalid');
                        //throw error; 
                                       
                    }
                });
            }
            else{
                //notification is handled client side
                //may need something here
                console.log('no username and/or password entered');
            }    
        });
        
        

        app.post('/createAccount', function(request,response){
            console.log('in create account service');
            //should use response
            //Can set loggedin=true to instantly redirect to map page and login user.
            //can create unique constraint for table
            //then, can read error message from sql and trap+output correct error msg
            var newUsername = request.body.newUsername;
            var newPassword = request.body.newPassword;
            var newEmail = request.body.newEmail;
            sess = request.session;
            //values are undefined for some reason
            console.log('services createacc username, password, email ' + ' ' + newUsername + ' ' + newPassword + ' ' + newEmail);
            //should do if to verify data here?
            //username is not defined
            connection.query("SELECT * FROM users WHERE username = ?", [newUsername], function(error,results){
                if(error){
                    console.log('error ' + error);
                    throw error;
                }
                else if(results.length>0){
                    console.log('user exists!');
                    response.send('userExists');                   
                }

                else{ 
                    connection.query("INSERT INTO users (username, password, email) VALUES(?,?,?);", [newUsername, newPassword, newEmail], function(error,results){
                    if(error){
                        console.log('error ' + error);
                        response.send('ERROR');

                    }
                    else{
                        connection.query('SELECT users_id FROM users WHERE username = ?', [newUsername], function(error, results){
                            if (error){
                                //res.send
                                throw error;
                            }
                            else if(results.length>0){
                                request.session.loggedIn=true;
                                request.session.userID=results[0].users_id;
                                request.session.username = newUsername;
                                console.log('user id: ' + request.session.userID);
                                console.log('username: ' + request.session.username);
                                console.log('user created successfully');
                                response.send("SUCCESS");
                            }                       
                        });
                        
                    }
                
                    });
                }
            });
       
        });

        app.post('/submit', function(request,response){
            sess = request.session;
            username = sess.username;
            userID = sess.userID;
            loggedIn = sess.loggedIn;
            var title = request.body.title;
            var description = request.body.description;
            var userLatStr = request.body.userLatStr;
            var userLngStr = request.body.userLngStr;
            console.log('SUBMIT username, userid, loggedin: ' + request.session.username, );
            console.log('SUBMIT title, userlat, userlng ' + ' ' + title + ' ' + userLatStr + ' ' + userLngStr);
            console.log('SUBMIT desc: ' + description);
            connection.query('SELECT * FROM SUBMISSIONS WHERE longitude = ? and latitude = ? ', [userLngStr, userLatStr], function (error,results){
                if(error){
                    console.log('sql error ' + error);
                    response.send('error');
                    
                }
                else if(results.length>0){
                    console.log('coordinates already in system');
                    response.send('duplicate');
                }
                else{                    
                    connection.query('INSERT INTO SUBMISSIONS (longitude, latitude, title, description, users_users_id) VALUES (?,?,?,?,?)', [userLngStr, userLatStr, title, description, userID], function (error, results){
                        if(error){
                            console.log('SQL error ' + error);
                            response.send('error');
        
                        }
                        else{
                            //global var 
                            currSubmissionId = results.insertId;
                            console.log('Submission succesfully registered');
                            response.send('success');
                        }
                        
                    });
                }
            });
        });


        app.post('/fileUpload', (request, response)=>{
            userID = sess.userID;
            console.log("in fileupload");
            //var submissions_id = request.data.submissions_id
            var form = new formidable.IncomingForm();
            form.parse(request, function(error, fields, files){
                console.dir(request.headers);
                console.log(fields);
                console.log(files);
                console.log(files.file);
                console.log(files.file.filepath);
                console.log("Original file path: " + files.file.filepath);
                var oldPath = files.file.filepath;
                var newPath = path.join(__dirname, '../images',
                '\\', files.file.newFilename);
                newPath = newPath +  path.extname(files.file.originalFilename);      
                console.log("New path: " + newPath);    
                fs.rename(oldPath, newPath, function () {
                    console.log("File move success!");
                    
                });

            if(error){
                console.log("error " + error);
                throw error;
            }

            else{
                /*console.log("before last insert id test");
                connection.query("SELECT LAST_INSERT_ID() from submissions", function(error, results){
                    if(error){
                        console.log("SQL Error " + error);
                    }
                    else{
                        submissions_id = results.submissions_id;
                        console.log("submission id success: " + submissions_id);
                    }
                    console.log("end of submission id query");
                }); */
                connection.query('SET FOREIGN_KEY_CHECKS=0');
                connection.query("UPDATE submissions SET imagePath = ? WHERE submissions_id = ?", [newPath, currSubmissionId], function(error,results){
                    if(error){
                        console.log('sql error ' + error);
                        response.send('ERROR');
                    }
                    else{
                     console.log("imagePath insert success!");
                        response.send("success");
                    }
                });
            }
            });        
        });


        

        app.get('/loadSubmissions', (request,response)=>{
            console.log('Routed to /loadSubmissions');
            sess = request.session;
            username = sess.username;
            userID = sess.userID;
            loggedIn = sess.loggedIn;
            var submissionidArray = [];
            var longitudeArray = [];
            var latitudeArray = [];
            var titleArray = [];
            var descriptionArray = [];
            var usernameArray = [];
            var imagesBase64=[];
            var currentImagePath;
            var completeSubmissions;
            connection.query('SELECT submissions_id, longitude, latitude, title, description, imagePath, users_users_id FROM submissions WHERE isApproved=1', function (error,results,rows){
                if(error){
                    console.log('sql error: ' + error);
                }
                else{
                    console.log(results);
                    console.log('---before loop---');
                    console.log('results length: ' + results.length);
                    for(var i=0;i<results.length;i++){
                        connection.query('SELECT username FROM users WHERE users_users_id = ?', [results[i].users_users_id], function(error,result){
                            if(error){
                                console.log('sql error: ' + error);
                            }
                            else{
                                usernameArray[i] = result.username;
                                longitudeArray[i] = results[i].fields[1];
                                latitudeArray[i] = results[i].fields[2];
                                titleArray[i] = results[i].fields[3];
                                descriptionArray[i] = results[i].fields[i];
                                if(results[i].imagePath!=null){
                                    currentImagePath = results[i].imagePath;
                                    imagesBase64[i]=fs.readFileSync(__dirname + '/images' + currentImagePath, 'base64');
                                    console.log('current base64 image: ' + imagesBase64[i]);
                                }
                            }
                        });
                    }        
                        completeSubmissions = {"submissionIDs": submissionidArray, "longitudes": longitudeArray, "latitudes": latitudeArray, "titles": titleArray, "descriptions": descriptionArray, "usernames": usernameArray};
                    

                    return response.status(201).send(JSON.stringify({msg:"SUCCESS", results, imagesBase64}));
                }
            });
        });
        

        app.get('/loadAdminSubmissions', (request,response)=>{
            console.log('Routed to /loadAdminSubmissions');
            sess = request.session;
            username = sess.username;
            userID = sess.userID;
            loggedIn = sess.loggedIn;
            connection.query('SELECT submissions_id, longitude, latitude, title, description, users_users_id, imagePath FROM submissions WHERE isApproved IS NULL', function (error,results,rows){
                if(error){
                    console.log('sql error: ' + error);
                }
                else{ 
                    console.log(results);
                    console.log('---before loop---');
                    console.log('results length: ' + results.length);
                    for(var i=0;i<results.length;i++){
                        console.log(results[i].submissions_id);
                        console.log(results[i].longitude);
                        console.log(results[i].latitude);
                        console.log(results[i].title);
                        console.log(results[i].description);
                        console.log(results[i].users_users_id);
                        console.log(results[i].imagePath);
                    }
                    console.log("Unapproved submissions successfully selected!");
                    return response.status(201).send(JSON.stringify({msg:"SUCCESS", results}));

                }
            });
        });
        

        app.post('/approve', (request,response)=>{
            submissionID = request.data.currentID;
            connection.query('UPDATE SUBMISSIONS SET isApproved = 1 WHERE submissions_id = ?', [submissionID], function (error,results,rows){
                if(error){
                    console.log('sql error: ' + error);
                    response.send("ERROR");
                }
                else{
                    console.log("successfully approved submission with id " + submissionID);
                    response.send("SUCCESS");
                }
            });
            
        });


        app.post('/deny', (request,response)=>{
            submissionID = request.data.currentID;
            connection.query('DELETE FROM SUBMISSIONS WHERE submissions_id = ?', [submissionID], function (error,results,rows){
                if(error){
                    console.log('sql error: ' + error);
                    response.send("ERROR");
                }
                else{
                    console.log("successfully deleted submission with id " + submissionID);
                    response.send("SUCCESS");
                }
            });
        });

        app.get('/logout',(req,res) => {
            console.log('in logout');
            req.session.destroy();
            res.redirect('/');
        });

//-------------------------------------------------------------
        app.post('/write-record', function(req, res){
            console.log('in write record');
            var data = {
                bookTitle: req.body.bookTitle,
                author: req.body.author,
                publisher: req.body.publisher,
                yearPublished: req.body.yearPublished,
                isbn:req.body.isbn
            }
            connection.query("INSERT INTO books SET ?", data, function(err,results){
                if(err) {
                    //throw err; //bad error trapping
                    //status 201: http status that indicates some request fulfilled
                    return res.status(201).send(JSON.stringify({msg:"ERROR: " + err})); 
                } else {
                    return res.status(201).send(JSON.stringify({msg:"SUCCESS"})); //turns into json 
                } //? is placeholder
            });
        });
        
        //----------APP.GET READ RECORDS----------
        app.get('/read-records', function(req,res){
            connection.query("SELECT * FROM books", function(err,rows){//callback for either err or rows of data
                if(err){
                    return res.status(201).send(JSON.stringify({msg:"ERROR: " + err}));
                } else {
                    console.log("data: " + JSON.stringify(rows));
                    return res.status(201).send(JSON.stringify({msg:"SUCCESS", books:rows}));
                }
            });
        
        });

        app.delete('/delete-record', function(req, res) {
            var bookID = req.body.id;
            console.log("book id: " + bookID);
            connection.query("DELETE FROM books WHERE bookId = ?", bookID, function(err) {
                if(err) {
                    return res.status(201).send(JSON.stringify({msg:"ERROR: " + err})); 
                } else {
                    return res.status(201).send(JSON.stringify({msg:"SUCCESS"})); //turns into json 
                }
            });
        });

        //use this to query for admin id and user id?

        function loggedin(){
            sess = request.session;
            request.session.loggedin=true;
            request.session.username=username;
            console.log('found user id');
            request.session.userID=results[0].users_id;
            console.log('user id: ' + request.session.userID);
            response.send("success");
        }
        function get_userID(data, promise){
            //resolve promise with userid
            var username = data.body.username;
            var sql = "SELECT * from users where username = ?";
            connection.query(sql, username, function(err, results){
                  if (err){ 
                    console.log('get_userID error ' + err);
                    throw err;
                  }
                  console.log(results[0].objid); 
                 //data = results[0].objid;  // Scope is larger than function
                  promise.resolve(results[0].objid);
          });
      }
/*
      function registerSession(request){
        sess = request.session;
        username = sess.username;
        userID = sess.userID;
        loggedIn = sess.loggedIn;
      }*/
      
    }


   

    //update is a put
  

//HAVE TO export modules

module.exports = services;

