import dynamo from "./AWS.js";
import {s3} from "../database/s3.js";

export const POSFIT_USER_TABLE = "posfit_users";

export async function insertUser (email, username, type, bio, profilePic) {

    /**
     * Inserts user onto DynamoDB & S3 for later reference in any of the component.
     * @type {{TableName: string, Item: {email_id, user_type, playlist: *[],
     * user_name, bio, user_profile: string, video_id: *[]}}}
     */

    const params = {
        TableName: POSFIT_USER_TABLE,
        Item: {
            email_id: email,
            user_type: type,
            user_name: username,
            user_profile: email + "_profile_pic.jpg",
            bio: bio,
            playlist: [],
            video_id: []
        }
    };

    return await new Promise((resolve, reject) => {

        // logs new user into DynamoDB
        dynamo.put(params, (err) => {
            if(err) {
                // on failure it will log an err
                console.error("Failure in: insertUser\n", err);
                reject(err);
            } else {
                // on success it will store prof-pic in s3
                console.log("Entered user data into DynamoDB.")
                const params_pfp = {
                    Body: profilePic,
                    Bucket: "posfit-bucket",
                    Key: email + "_profile_pic.jpg",
                };
                // upload their profile_pic onto s3
                s3.putObject(params_pfp, (err) => {
                    if (err) {
                        console.error(err, "could not put profile pic onto s3");
                        reject(err)
                    } else {
                        // on success, notification of picture upload is logged.
                        console.log("pfp upload success.");
                        console.log("User registration successful.")
                        resolve(params);
                    }
                });
            }
        });
    })
}

export async function deleteUserEntries(email) {

    /**
     * Deletes user entries from DynamoDB only
     * @type {{email: string}}
     */

    return await new Promise((resolve, reject) => {
        const params = {
            TableName: POSFIT_USER_TABLE,
            Key: {
                email_id: email,
            }
        }

        // delete user entries from dynamodb
        dynamo.delete(params, (err) => {
            if(err) {
                // failure to delete logs the err
                console.error("Failure in: deleteUserEntries\n", err);
                reject(err);
            } else {
                console.log("Successfully deleted user in DynamoDB. \nDeleting profile pic in S3");
                const params_pfp = {
                    Bucket: "posfit-bucket",
                    Key: email + "_profile_pic.jpg",
                };
                // delete their profile_pic stored in s3
                s3.deleteObject(params_pfp, (err) => {
                    if (err) {
                        console.error(err, "could not delete profile pic from S3");
                        reject(err)
                    } else {
                        // on success deletion success is logged
                        console.log("profile pic delete success.\n" + email + " account deleted.");
                        resolve(email + " account deleted.");
                    }
                });
            }
        })
    }).catch(err => {
        console.error(err);
    })

}

export async function retrieveUser(email) {

    /**
     * Retrieves user entries from DynamoDB for use inside any component.
     * @type {{email: string}}
     */

    return await  new Promise((resolve, reject) => {
        const params = {
            TableName: POSFIT_USER_TABLE,
            Key: {
                email_id: email,
            }
        }
        dynamo.get(params, (err, data) => {
            if(err) {
                // on failure, log err
                console.error(err);
                reject(err);
            } else {
                // on success user data is returned.
                resolve(data);
            }
        })
    })
}

// Helper for appendVideo and removeVideo
function updateTable(resolve, reject , result) {
    /**
     * Helper func. Updates the table given an updated results object
     * with the following attributes
     * {
     *      email_id:
            user_type:
            playlist:
            bio:
            profilePic_id:
            user_name:
            user_profile:
            video_id:
     * }
     * @type {{TableName: string, Item: {email_id: (string|*), user_type: *,
     * profilePic_id, playlist: ([]|*[]|*), user_name: *, bio: *, user_profile: (string|*),
     * video_id: ([]|string|*[]|*)}}}
     */
    const params = {
        TableName: POSFIT_USER_TABLE,
        Item: {
            email_id: result.Item.email_id,
            user_type: result.Item.user_type,
            playlist: result.Item.playlist,
            bio: result.Item.bio,
            profilePic_id: result.Item.profilePic_id,
            user_name: result.Item.user_name,
            user_profile: result.Item.user_profile,
            video_id: result.Item.video_id
        }
    };

    dynamo.put(params, (err) => {
        if(err) {
            // on failure, err is logged
            console.error("Failure in updateTable:\n", err);
            reject(err);
        } else {
            // on success table is updated
            resolve();
        }
    });
}

export async function appendVideoKey(email, video_key, isPlaylist) {
    /**
     * Appends video key used in S3, to user's entry of video_ids or playlist_ids
     * @type {{email: string, video_key: string, isPlaylist: boolean}}
     */
     return await new Promise((resolve, reject) => {
         retrieveUser(email).then((result) => {
             if(isPlaylist) {
                 result.Item.playlist.push(video_key);
             } else {
                 result.Item.video_id.push(video_key);
             }
             return result;
            }).then((result) => {
                console.log("appending video: " + video_key);
                isPlaylist ? console.log("appending to: playlist") : console.log("appending to: video_id");
                updateTable(resolve, reject, result);
            })
     })
}

export async function removeVideoKey(email, video_key, isPlaylist) {
    /**
     * Removes a video key used in S3, to user's entry of video_ids or playlist_ids
     * @type {{email: string, video_key: string, isPlaylist: boolean}}
     */
    return await new Promise((resolve, reject) => {
        retrieveUser(email).then((result) => {
            if(isPlaylist) {
                let index = result.Item.playlist.indexOf(video_key);
                result.Item.playlist.splice(index, 1);
            } else {
                let index = result.Item.video_id.indexOf(video_key);
                result.Item.video_id.splice(index, 1);
            }
            return result;
        }).then((result) => {
            console.log("removing video: " + video_key);
            isPlaylist ? console.log("removing from: playlist") : console.log("removing from: video_id");
            updateTable(resolve, reject, result);
        })
    })
}
