//want to send data over to our server
//use jquery to help us with that
//Create listener that waits for the u ser to hit the submit button
console.log("line 4")
$('#data-submit').click(function() {
    var bookTitle = $('#bookTitle').val();
    var author = $('#author').val();
    var publisher = $('#publisher').val();
    var yearPublished = $('#yearPublished').val();
    var isbn = $('#ISBN').val();

    var jsonString = {bookTitle: bookTitle, author: author, publisher: publisher, yearPublished: yearPublished, isbn:isbn};
    
    $.ajax({
    url: 'http://localhost:5000' + "/write-record",
    type:"post",
    data: jsonString,
    success: function(response){
        var test1 = "";
        alert(response);
    },
    error: function(err){
        var test2 = "";
        alert(err);
    }
    });

});

// $('#data-submit').click(function() {
//     var bookTitle = $('#bookTitle').val();
//     var author = $('#author').val();
//     var publisher = $('#publisher').val();
//     var yearPublished = $('#yearPublished').val();
//     var isbn = $('#isbn').val();
//     console.log('before jsonstring');
//     var jsonString = {bookTitle:bookTitle,
//     author:author,
//     publisher:publisher,
//     yearPublished:yearPublished,
//     isbn:isbn}                                  //dont have to be same name, local var vs new variable name
//                                                                  //use hashtag for data submit button
//                                                 //would use . for a class
//                                                  //this would take several lines in regular js
//                                                  //client has no idea these variables exist
//                                                  //json is used to send data over
//                                                  //json is great

//                                                  //ajax call
//     $.ajax({                                         //we usually create a config file (config.js), give it 2 libraryurl values. first is when hosetd, second is local.
//         url:'http://localhost:5000' + "/write-library", //get write-library service
//         type: "post",
//         data:  jsonString,
//         success: function(response) {   //input is response
//             alert(response);            //give msg to user
//         },
//         error: function(){ 
//             alert(err);                 //should trap error
//         }
//     });
//     //return false;
// });
