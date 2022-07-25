import {VideoContext} from "../database/Video_S3andDynamo.js";
import {useState, useContext} from "react";
import {Link} from 'react-router-dom';
import { dynamoQuery } from "../database/Dynamo_Video.js";
import { DynamoScan } from "../database/Dynamo_Video.js";

import {useHistory} from "react-router-dom";

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

function SearchResult(props){
    const history = useHistory(); 
    const [urlArr, setUrlArr] = useState("");

    return (
        <div className="search-bar">
        </div>
        
    );
}

export default SearchResult;