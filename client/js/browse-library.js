retrieveData();

function retrieveData(){
    //Use ajax to get data

    $.ajax({
        url: 'http://localhost:5000' + "/read-records",
        type: 'get',
        //can put data element if you have to filter out data in a select
        success: function(response){
            var data = JSON.parse(response);
            //parse json string we pass here into object
            if(data.msg === "SUCCESS"){
                console.log("data" + JSON.stringify(data.books));
                createLibraryTable(data.books);
            } else{
                console.log(data.msg);
            }
        },
        error: function(err){
            alert(err);
        }
    });
}

function createLibraryTable(data){
    //loop through data to create html string for insertion into page
    var tableHTML = "";
    console.log("Data 2" + JSON.stringify(data));
    for(var i=0 ; i<data.length; i++) {
        tableHTML += "<tr>";
            tableHTML += "<td>" + data[i].bookTitle + "</td>";
            tableHTML += "<td>" + data[i].author + "</td>";
            tableHTML += "<td>" + data[i].publisher + "</td>";
            tableHTML += "<td>" + data[i].yearPublished + "</td>";
            tableHTML += "<td>" + data[i].isbn + "</td>";
            tableHTML += "<td>" 
                            + "<button class='delete-button' data-id='" + data[i].bookId
                            + "'>DELETE</button"
                            + "</td>"
                            //wrapping that id value in open + close quotes
        tableHTML += "</tr>";
    }
    $('#libraryTable').html(tableHTML); //html jquery command
    activateDelete(); 

    
}

function activateDelete(){
    $('.delete-button').click(function() {
        var deleteID = this.getAttribute("data-id");

        $.ajax({
            url: 'http://localhost:5000' + '/delete-record',
            type: 'delete',
            data: {id: deleteID},
            success: function(response){
                var data = JSON.parse(response);
                if(data.msg === "SUCCESS"){
                    retrieveData();

                } else {
                    console.log(data.msg);
                }

            },
            error: function(err){
                alert(err);
            }
        })
    }); //. denotes class
}

