const path = require('path');
const express = require('express');
const { userInfo } = require('os');
const session = require('express-session');

//Page Listeners---
var router = function(app) {
    //route user to different pages

    app.use(express.static(__dirname + '/../client'));

    app.get('/', function(req,res) {
        res.status(200).sendFile(path.join(__dirname + "/../client/login.html")); //home page/landing
    }) //default url

    app.get("/login", function(req,res) {
        res.status(200).sendFile(path.join(__dirname + "/../client/login.html")); //home page/landing
        
    })

    app.get("/mapscreen", function(req,res) {
        console.log('in router for mapscreen');
        sess = req.session;
        console.log('loggedin is: '  + req.session.loggedIn);
        if(req.session.loggedIn){
            //send username to html here
            res.status(200).sendFile(path.join(__dirname + "/../client/mapscreen.html")); //home page/landing 
            console.log('after sendFile');
            //if(isAdmin == 1){
                //console.log('is admin');
            //}
        }
        else{
        //deny access, route to error page ?
        res.redirect('/');
        }

    });

    app.get("/adminpanel", function(req,res) {
        //res.status(200).sendFile(path.join(__dirname + "/../client/adminpanel.html")) //home page/landing
        if(req.session.loggedIn){
            //send username to html here
            res.status(200).sendFile(path.join(__dirname + "/../client/adminpanel.html")); //home page/landing 
            //if(isAdmin == 1){
                //console.log('is admin');
            //}
        }
        else{
        //deny access, route to error page ?
        res.redirect('/');
        }
    })
    
};
//need to add other functions



//export

module.exports = router; //exportign router

