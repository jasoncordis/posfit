import {
    insertUser,
    retrieveUser,
    appendVideoKey,
    removeVideoKey,
    deleteUserEntries,
    POSFIT_USER_TABLE,
} from "../src/database/Dynamo_UserTable.js"
import {assert} from "chai";

describe("DynamoUserTableTest",  () => {

    describe("insertUser", () => {
        it("Returns same user info on successful entry", async () => {
            const email = "MochaTester@gmail.com";
            const username = "MochaTester";
            const type = "trainee";
            const bio = "I am a mocha tester testing our app.";
            const profilePic = "None";
            const expected = {
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
            }

            const actual =  await insertUser(email, username, type, bio, profilePic)
            assert.deepEqual(actual, expected)
        })
    })

    describe("retrieveUser", () => {
        it("Should retrieve user from DynamoDB posfit-user table with the same 'Item' attributes", async () => {
            const email = "MochaTester@gmail.com";
            const username = "MochaTester";
            const type = "trainee";
            const bio = "I am a mocha tester testing our app.";
            const profilePic = "None";
            const expected = {
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
            const result = await retrieveUser(email);
            assert.deepEqual(expected.Item, result.Item, "Attempted to retrieve user from DynamoDB");
        });
    });

    describe("appendVideoKey", () => {

        it("Should return a user with more videos in the uploads than last.", async () => {
            const email = "MochaTester@gmail.com";
            const previous = await retrieveUser(email);
            const result = await appendVideoKey(email, "mochaTestVideo_upload", false);
            assert.isBelow(previous.Item.video_id.length, result.length);
        });


        it("Should return a user with more videos in the playlist than last.", async () => {
            const email = "MochaTester@gmail.com";
            const previous = await retrieveUser(email);
            const result = await appendVideoKey(email, "mochaTestVideo_playlist", true);
            assert.isBelow(previous.Item.playlist.length, result.length);
        });


    });

    describe("removeVideoKey", () => {
        it("Should return a user with less videos in the uploads than last (min value 0)", async  () => {
            const email = "MochaTester@gmail.com";
            const previous = await retrieveUser(email);
            const result = await removeVideoKey(email, "mochaTestVideo_upload", false);
            assert.isAtLeast(previous.Item.video_id.length, result.length);
        });

        it("Should return a user with less videos in the playlist than last (min value 0)", async  () => {
            const email = "MochaTester@gmail.com";
            const previous = await retrieveUser(email);
            const result = await removeVideoKey(email, "mochaTestVideo_playlist", true);
            assert.isAtLeast(previous.Item.video_id.length, result.length);
        })


    });

    describe("deleteUserEntries", () => {
        it("Should remove an existing account 'MochaTester@gmail.com'", async () => {
            const email = "MochaTester@gmail.com";
            const result = await deleteUserEntries(email);
            assert.equal(email + " account deleted.", result);
        })
    });

})