//global variables
const submissionBox = document.getElementsByClassName("submissionBox--hidden");
const fillCoordinates = document.getElementsByClassName ("fillCoordinates");
const submitButton = document.getElementsByClassName("submit");
console.log('after init');
//global infoWindow
var openWindow;
var currentIndex=0;
var currentID=0;
var map;

function initMap() { 
 
  const myLatlng = { lat: -25.363, lng: 131.044 };
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: myLatlng,
    });
    
   
}
function populateSubmissions(results){
  console.log('in populateMap');
    var markers=[]; 
        var lngs=[];
        var lats=[];
        var latLngs=[];
        var infoWindows=[];
        var contents=[];
        //var title;
        //var desc;
        for(i=0;i<results.length;i++){
        console.log('results length: ' + results.length); 
          console.log('populating submission num ' + currentIndex);
          //get latitude and longitude
          currentID = results[currentIndex].submissions_id;
          lats[i] = results[currentIndex].latitude;
          lngs[i] = results[currentIndex].longitude;
          lats[i] = lats[i].substring(7,lats[i].length);
          lngs[i] = lngs[i].substring(6,lngs[i].length-1);
          console.log('lat: ' + (lats[i]));
          console.log('lng: ' + (lngs[i]));
          latLngs[i] = new google.maps.LatLng(lats[i], lngs[i]);       
          console.log('populateSubmissions at current submission ' + currentIndex + ' w/ latLng ' + latLngs[i]);
          //set content
          contents[i] =
          '<div id="content">' +
          '<div id="siteNotice">' +
          "</div>" +
          "<div>" + 
          "<p>Username(id): " + results[currentIndex].users_users_id + "</p>" +
          "</div>" +
          "<div>" + 
          "<p> Coordinates: " + latLngs[i] + "</p>" +
          "</div>" +
          '<h1 id="firstHeading" class="firstHeading">' +  results[currentIndex].title + '</h1>' +
          '<div id="Image">' +
          '<img src="images/test.jpg"</img>' +
          "</div>" +
          '<div id="bodyContent">' +
          "<p>" + results[currentIndex].description + "</p>" +
          "</div>" +
          "</div>";
          console.log(contents[i]);
          //create infowindow, markers
          infoWindows[i] = new google.maps.InfoWindow({
            content: contents[i],
          });
          
          markers[i] = new google.maps.Marker({
            position: latLngs[i],
            map,
            title: "current Index: " + currentIndex
          });
          map.setCenter(latLngs[i]);
          console.log("after infoWindow and marker");
          //call function to properly display infowindow on marker click
          infoWindowClick(markers[i],infoWindows[i]);

        }

    function infoWindowClick(markers, infoWindows){
    markers.addListener("click", ()=>{
      infoWindows.open({
        anchor: markers,
        map,
        shouldFocus: false,
      });
    });
   }
        
    //$('#libraryTable').html(tableHTML); //html jquery command
    //activateDelete(); 
}

function loadSubmissions(){
  console.log("inside contentloaded");
  //initMap();
    //e.preventDefault();
      $.ajax({
        //console.log("inside ajax");
        url: 'http://localhost:5000' + "/loadAdminSubmissions",
        type: 'get',
        success: function(response){
            var data = JSON.parse(response);
            var results = data.results;
            if(results.length>0){
              populateSubmissions(results);
           }
        },
        error: function(err){
            alert(err);
        }
    });
  }



document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("approve").addEventListener("click", e => {
    e.preventDefault();
    console.log("in approve");
    var approved = true;
    updateSubmission(approved);
    currentIndex++;
    document.location.reload();
      
  });

  document.getElementById("deny").addEventListener("click", e => {
    e.preventDefault();
    console.log("in deny");
    var approved = false;
    updateSubmission(approved);
    currentIndex++;
    document.location.reload();
      
  });

});

function updateSubmission(approved){
  if(approved==true){
    $.ajax({
      url: 'http://localhost:5000' + "/approve",
      type:"post",
      data: currentID,
      success: function(response){
      if(response=='success'){
        window.alert('Submission successfully registered!');
      }
      },    
      error: function(error){
        console.log("error " + error);
      }
    });
  }
  else{
    $.ajax({
      url: 'http://localhost:5000' + "/deny",
      type:"post",
      data: currentID,
      success: function(response){
      if(response=='success'){
        window.alert('Submission successfully registered!');
      }
      },    
      error: function(error){
        console.log("error " + error);
      }
    });
  }
}


$(document).ready(function($) {
  console.log('in ready');
  loadSubmissions();
  initMap();
});