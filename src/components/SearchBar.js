import { VideoContext } from "../database/Video_S3andDynamo.js";
import { useState, useContext, lazy, Suspense, useEffect } from "react";
import { DynamoScan } from "../database/Dynamo_Video.js";

import { useHistory } from "react-router-dom";
import { getDynamoData } from "../database/Dynamo_Video";
import { getS3url } from "../database/s3";
import { getVideos } from "../pages/Search";
import SearchResult from "../components/SearchResult.js";
import DisplaySomeVideos from "../components/DisplaySomeVideos.js";

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

const SearchBar = (props) => {
    const history = useHistory();
    const [searchValue, setSearchValue] = useState("");
    const [urlArr, setUrlArr] = useState([]);
    let url = new Array();
    let url2 = new Array();

    const handleSearchInputChanges = (e) => {
        setSearchValue(e.target.value);
    }
    const resetInputField = () => {
        setSearchValue("");
    }
    const callSearchFunction = (e) => {
        e.preventDefault();
        props.SearchBar(searchValue);
        resetInputField();
    }

    async function onsubmit(data) {
        data.preventDefault();
        console.log("Searchvalue: " + searchValue);
        url = await DynamoScan(searchValue);
        console.log("url = " + url);
        setUrlArr(url);
   

        return url;
    }
    function DisplaySearchResult(props){
        const vids = document.querySelector('#video');
        if(vids){
            removeAllChildNodes(vids);
        }

      if(urlArr.Items ){  
        var numVideos = urlArr.Items.length;
        console.log("numVideos: " + numVideos);
        const myMap = new Map();

        for (var i = 0; i < numVideos; i++) {
            myMap.set(i, urlArr.Items[i].thumbnail_id);
        }
        const mapSort3 = new Map([...myMap.entries()].sort());
        for (let [i, value] of mapSort3) {
            if ((urlArr.Items[i]).video_id != 0) {
                var url4 = getS3url(urlArr.Items[i].thumbnail_id)
                var string = String('<a href="/video/' + urlArr.Items[i].video_id + '_' + urlArr.Items[i].category + '"> ' + "<img src = " + url4 + " width = 300px> </img> <br></br>" + urlArr.Items[i].video_title + '</a>' + '<br>')
                //console.log("String : " + string);
                document.getElementById("videos").innerHTML += "<div class= {'flexbox'}><h3> Description: " + urlArr.Items[i].description + "</h3>";
                document.getElementById("videos").innerHTML += "<h3> Creator: " + urlArr.Items[i].creator_name +"</h3>";
                document.getElementById("videos").innerHTML += "<h3> Published: " + urlArr.Items[i].date_of_publish + "</h3>";
        
                document.getElementById("video").innerHTML += "<h3> Category: " + urlArr.Items[i].category + "<h3>" + "<br />"
                document.getElementById("video").innerHTML += string +'</br>' + '</div>';
            }
        }
      }

    }
    function removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    return (
        <div class="search-bar" >
            <form className="search-bar-form" onSubmit={onsubmit}>

                <label class = "text">Looking for something specific? Search now!</label>
                <div>
                <input
                    required
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onChange={handleSearchInputChanges}
                    type="text"
                    placeholder="Search..."
                    class="search-box"
                />
                <button onClick={() => (history.push('/search'))} class = "search-button" type="submit">Search</button>
                </div>
            </form>
            <div>
            <SearchResult urlArr = {urlArr}/>
                <div class="text">Your top results...</div>
                <hr class = "line" color = "black"></hr>
            
                    {DisplaySearchResult()}
            </div>
            <DisplaySomeVideos class = "inner-video-box"/>
        </div>
    );

}

export default SearchBar;