import "../css/Search.css";
import React, { useReducer, useEffect } from "react";
import {Link} from 'react-router-dom';
import { getS3url } from "../database/s3";
import {UserTableContext} from "../database/Dynamo_UserTable";
import SearchResult from "../components/SearchResult";
import SearchBar from "../components/SearchBar";
import { dynamo4, scanTable } from "../database/Dynamo_Video"
import { dynamo, getDynamoData } from "../database/Dynamo_Video"

function getVideos(){

  scanTable().then((data) => {
    var numVideos = data.Items.length;

    const myMap = new Map();

    for(var i = 0; i < numVideos; i++){
      myMap.set(i, data.Items[i].category);
    }
    const mapSort3 = new Map([...myMap.entries()].sort());
    
    console.log(mapSort3);

    document.getElementById("video_list").innerHTML = "";

    for (let [i, value] of mapSort3) {
        if((data.Items[i]).video_id != 0) {
        var url = getS3url(data.Items[i].thumbnail_id)
        var string = String(' <a href="/video/' + data.Items[i].video_id + '_' + data.Items[i].category + '"> ' + "<img src = " + url + " width = 300px> </img> <br></br> </a>" + '<br>')
        //var string2 = String('<a href="/video/' + data.Items[i].video_creator + '_' + data.Items[i].description + data.Items[i].date_of_publish+ '"> ' + "<img src = " + url + " width = 300px> </img> " + data.Items[i].description + "class = .video" + '</a>' + '<br>')
        
        document.getElementById("video_list").innerHTML += "<a href='/video/" + data.Items[i].video_id + '_' + data.Items[i].category + "'> <h3> <div class = 'video_link'> " + data.Items[i].video_title + "</div> </h3>";
        document.getElementById("video_list").innerHTML += "<h3> Description: " + data.Items[i].description + "</h3>";
        document.getElementById("video_list").innerHTML += "<h3> Creator: " + data.Items[i].creator_name +"</h3>";
        document.getElementById("video_list").innerHTML += "<h3> Published: " + data.Items[i].date_of_publish + "</h3>";
        document.getElementById("video_list").innerHTML += "<h3> Category: " + data.Items[i].category + "</h3>" + "<br /> </a>"
        document.getElementById("video_list").innerHTML += "<br> </br>" +string + '</br>' + '</div>';
       
        }
      }
  })
  //const vids = document.querySelector("#videos");

}

function Search() {
    return (
      <div className="search">
          <h1>Search page</h1>
          <SearchBar/>

          <SearchResult />        
          <br /> <br />
          <div id = "video" class = ".video">
          </div>

          <div id = "video_list" class = "video_list"> {getVideos()} </div>
          <br></br>
          <text class = "text">More Videos...</text>
          <div id = "videos"></div>

      </div>
    );
  }
  
  export default Search;