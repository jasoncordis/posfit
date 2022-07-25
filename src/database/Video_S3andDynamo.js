import dynamo from "./AWS.js";
import {appendVideoKey} from "./Dynamo_UserTable.js";
import { v4 as uuidV4 } from 'uuid';
import {s3} from "./s3.js";

export async function retrieveVideoMeta(video_id) {
    /**
     * Retrieves video meta data from 'videos' table from DynamoDB given a specific video_id
     * @type {video_id : string}
     */
    return new Promise((resolve, reject) => {
        const params = {
            TableName: "videos",
            Key: {
                video_id: video_id + ".mp4"
            }
        };

        // gets video from database.
        dynamo.get(params, (err, data) => {
            if(err) {
                // on failure an error for the retrieval is displayed.
                console.log("Could not retrieve video data\n", err);
                reject(err);
            } else {
                console.log("Successful video retrieval\n", data);
                resolve(data);
            }
        })
    })
}

export async function uploadVideo(username, email, video) {
    /**
     * Uploads a video onto S3 and records the meta-data of the video onto DynamoDB
     * @type{{username: string, email: string,
     * video:
     *      {
     *          video: .mp4 file,
     *          thumbnail: .jpeg file,
     *          video_title: string,
     *          category: string,
     *          description: string,
     *      }
     * }}
     */
    return await new Promise((resolve, reject) => {
        // creates a meta-data entry for the following s3-stashed video
        let today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        // creates the "unique" id per video to enforce uniqueness in s3.
        const unique_id = uuidV4();
        const params_dynamoVideos = {
            TableName: "videos",
            Item: {
                // video and thumbnail image from s3
                video_id: unique_id + ".mp4",
                video_title: video.title,
                thumbnail_id: unique_id + ".jpg",
                category: video.category,
                description: video.description,
                date_of_publish: today,
                // user profile-pic image from s3
                creator_profile_pic: email + "_profile_pic.jpg",
                creator_name: username,
                user_comments: []
            }
        };
        // puts the entry in the videos table.
         dynamo.put(params_dynamoVideos, (err) => {
            if(err) {
                console.error(err, "could not enter new video entries in dynamodb videos table: " + video.title);
                reject(err)
            } else {
                console.log("uploading videos entry successful... loading videos onto s3..");
                // append it to user's upload list
                appendVideoKey(email, unique_id, false);
                const params_thumbnail = {
                    Body: video.thumbnail,
                    Bucket: "posfit-bucket",
                    Key: unique_id + ".jpg",
                }
                // puts the thumbnail object in our s3 video bucket
                s3.putObject(params_thumbnail, (err) => {
                    if(err) {
                        console.error(err, "could not put thumbnail onto s3");
                        reject(err)
                    } else {
                        console.log("thumbnail upload success.");
                        const params_video = {
                            Body: video.video,
                            Bucket: "posfit-bucket",
                            Key: unique_id + ".mp4",
                        }
                        // puts the video object in our s3 video bucket
                        s3.putObject(params_video, (err) => {
                            if(err) {
                                console.error(err, "could not put video onto s3");
                                reject(err)
                            } else {
                                console.log("video upload success.");
                                resolve(true);
                            }
                        });
                    }
                });
            }
        });
    })
}
