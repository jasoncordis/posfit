import React, { useState, useEffect } from "react";

import Posts from "./Posts";
import { getS3url } from "../database/s3";
import {scanTable} from "../database/Dynamo_Video.js";
import {getVideos} from "../pages/Search.js";
const postsPerPage = 5;
const mapSort = new Map();
function getVids(){
    scanTable().then((data) => {
    
    var numVideos = data.Items.length;

    const myMap = new Map();

    for(var i = 0; i < numVideos; i++){
      myMap.set(i, data.Items[i].category);

    }

    const mapSort4 = new Map([...myMap.entries()].sort());
    console.log("mapSort4: " + mapSort4);

    
    for (let [i, value] of mapSort4) {
        if((data.Items[i]).video_id != 0) {
            console.log("[i] = " + [i]);
        var url = getS3url(data.Items[i].thumbnail_id)
        var string = String('<a href="/video/' + data.Items[i].video_id + '_' + data.Items[i].category + '"> ' + "<img src = " + url + " width = 300px> </img> " + data.Items[i].video_title + '</a>' + '<br>')
        // document.getElementById("video").innerHTML += "<h3> Category: " + data.Items[i].category + "<h3>" + "<br />"
        // document.getElementById("video").innerHTML += string;
        }
      }
      console.log("mapSort4: " + (mapSort4));
  })
}

const DisplaySomeVideos = () => {
    let arrayForHoldingPosts = [];
    const [postsToShow, setPostsToShow] = useState([]);
    const [next, setNext] = useState(3);
    console.log("mapSort: " + (mapSort));

    const loopWithSlice = (start, end) => {
    const slicedPosts = Array.from(mapSort).slice(start,end);

    //const slicedPosts = mapSort.slice(start, end);
    arrayForHoldingPosts = [...arrayForHoldingPosts, ...slicedPosts];
    console.log("arrayforholdingposts" + arrayForHoldingPosts[0]);
    setPostsToShow(arrayForHoldingPosts);
  };

  useEffect(() => {
    loopWithSlice(0, postsPerPage);
  }, []);

  const handleShowMorePosts = () => {
    loopWithSlice(next, next + postsPerPage);
    setNext(next + postsPerPage);
  };
  return (
    <div>
        {/* {getVids()} */}
      {/* <Posts postsToRender={postsToShow} /> */}
      {/* <button onClick={handleShowMorePosts}>Load more</button> */}
    </div>
  );
};

export default DisplaySomeVideos;