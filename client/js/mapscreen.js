//global variables
const submissionBox = document.getElementsByClassName("submissionBox--hidden");
const fillCoordinates = document.getElementsByClassName ("fillCoordinates");
const submitButton = document.getElementsByClassName("submit");
console.log('after init');
var userLatLng;
var userLatLngStr;
var userLatStr;
var userLngStr;
//global infoWindow - is populated with relevant marker and content upon click
var openWindow;

function initMap() {
    
    const myLatlng = { lat: -25.363, lng: 131.044 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: myLatlng,
    });
    const marker = new google.maps.Marker({
      position: myLatlng,
      map,
      title: "Click to zoom",
    });

    //simple infowindow 
    var infoWindow = new google.maps.InfoWindow({
      content: "Click map anywhere to submit a landmark.",
      position: myLatlng,
    });
    infoWindow.open(map);
  
   marker.addListener("click", ()=>{
    infowindow.open({
      anchor: marker,
      map,
      shouldFocus: false,
    });

   });

   function infoWindowClick(markers, infoWindows){
    markers.addListener("click", ()=>{
      infoWindows.open({
        anchor: markers,
        map,
        shouldFocus: false,
      });
    });
   }

   //click listener
   map.addListener("click", (mapsMouseEvent) => {
    //grab coordinates
    //split into lat and lng string
    //can use substring to cut off lat/lng text
    infoWindow.close();
    userLatLng = mapsMouseEvent.latLng;
    userLatLngStr = JSON.stringify(userLatLng);
    //split string into subparts and return as array
    var parts = userLatLngStr.split(",");
    userLat = parts[0];
    userLng = parts[1];
    //userLatStr = JSON.stringify(userLat);
    //userLngStr = JSON.stringify(userLng);
    //lat and lng now split
    console.log(userLatLngStr);
    console.log(userLat);
    console.log(userLng);
    //change html form coordinate text to current coordinates
    //error here - cannot access before initialization
    //fillCoordinates.innerHTML += userLatLngStr;
    infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });
    infoWindow.setContent(
      JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
    );
    infoWindow.open(map);
  });

    marker.addListener("click", () => {
      //zoom in on default marker when clicked
      infoWindow.close();
      map.setZoom(8);
      map.setCenter(marker.getPosition());
    });


    function loadSubmissions(){
      console.log('in loadSubmissions');
      $.ajax({
        url: 'http://localhost:5000' + "/loadSubmissions",
        type:"get",
        success: function(response){
          var data = JSON.parse(response);
            var results = data.results;
            //if(data.msg=='SUCCESS'){
              //submissionObj is a json string
              //var submissionJSStr = data.submissionJSStr;
              populateMap(results);
              console.log('response success');
            //}
            //else{
                //console.log('else');
            //}
                       
        },
        error: function(error){
            console.log('Error: ' + error);
            //throw error;
        }
    });
  }
    function populateMap(results){   
        console.log('in populateMap');
        var markers = [];
        var lngs=[]; 
        var lats=[];
        var latLngs=[];
        var infoWindows=[];
        var contents=[];
        var imagePaths=[];
        //var title;
        //var desc;
        console.log('results length: ' + results.length);
        for(var i =0;i<results.length;i++){
          console.log('in for loop ' + i)
          //get latitude and longitude
          lats[i] = results[i].latitude;
          lngs[i] = results[i].longitude;
          lats[i] = lats[i].substring(7,lats[i].length);
          lngs[i] = lngs[i].substring(6,lngs[i].length-1);
          console.log('lat: ' + (lats[i]));
          console.log('lng: ' + (lngs[i]));
          latLngs[i] = new google.maps.LatLng(lats[i], lngs[i]);       
          console.log('populateMap iter ' + i + ' w/ latLng ' + latLngs[i]);
          //grab image path and image from server
          if(imagePaths[i]!=null){
            imagePaths[i] = results[i].imagePath;
            

            
          }
          

          //set content
          contents[i] =
          '<div id="content">' +
          '<div id="siteNotice">' +
          "</div>" +
          "<div>" + 
          "<p>Username(id): " + results[i].users_users_id + "</p>" +
          "</div>" +
          "<div>" + 
          "<p> Coordinates: " + latLngs[i] + "</p>" +
          "</div>" +
          '<h1 id="firstHeading" class="firstHeading">' +  results[i].title + '</h1>' +
          '<div id="Image">' +
          '<img src="images/test.jpg"</img>' +
          "</div>" +
          '<div id="bodyContent">' +
          "<p>" + results[i].description + "</p>" +
          "</div>" +
          "</div>";
          //create infowindow, markers
          infoWindows[i] = new google.maps.InfoWindow({
            content: contents[i],
          });

          markers[i] = new google.maps.Marker({
            position: latLngs[i],
            map,
            title: "test iter: " + i
          });
          //call function to properly display infowindow on marker click
          infoWindowClick(markers[i],infoWindows[i]);
          
    }

  }
    loadSubmissions();
}

document.addEventListener("DOMContentLoaded", () => {
  submissionBox[0].addEventListener("submit", e => {
    console.log('in submit');
    e.preventDefault();
    var title = $(".inputTitle").val();
    var description = $(".inputDescription").val();
    console.log('submission title: ' + title)
    console.log('submission description: ' + description)
    console.log('title len: ' + title.length);
    console.log('description len: ' + description.length);
    console.log('lat and lng: ' + userLat + ' ' + userLng);

    if(title == "" || description == "" || title.length>45 || description.length>400){
      window.alert('Please verify title and description.');
    }
    else{
      var submissionJsonString = {title: title, description: description, userLatStr:userLat, userLngStr:userLng}; 
      $.ajax({
        url: 'http://localhost:5000' + "/submit",
        type:"post",
        data: submissionJsonString,
        success: function(response){
        if(response=='success'){
          window.alert('Submission successfully registered!');
        }
        else if (response=='duplicate'){
          window.alert('coordinates already exist in system');
        }
        else{
          window.alert('Error inserting submission.');
        }
        },    
        error: function(error){
          console.log("error " + error);
        }
      });

      //----------------------------------------//
      //FILE UPLOAD
      if(document.getElementById("fileuploadid").files[0] != null){
        console.log('inside file upload nest');
        var formData = new FormData();
        var fileData = document.getElementById("fileuploadid").files[0]
        formData.append('file', fileData);
        console.log(formData);
        console.log('fileData:' + fileData);
        $.ajax({
          url: 'http://localhost:5000' + "/fileUpload",
          type:"post",
          data: formData,
          contentType: false,
          processData: false,
          success: function(response){
          if(response=='success'){
            console.log('Image successfully uploaded to fs.')
          }
          else{
            console.log('Image upload error.');
          }
          },    
          error: function(error){
            console.log("error " + error);
          }
        });
        console.log("outside of ajax");
      }
    }
  });
});


$(document).ready(function($) {
  console.log('in ready');
  initMap();
});