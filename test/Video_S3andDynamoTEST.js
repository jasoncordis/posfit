import {uploadVideo} from "../src/database/Video_S3andDynamo.js"
import {assert} from "chai";
import {insertUser} from "../src/database/Dynamo_UserTable.js";
import fs from 'fs';

describe("Video_S3andDynamoTest",  () => {
    describe("uploadVideo", () => {
        // TODO: implement
        it("Should show a successful upload of the 'video' and thumbnail", async () => {

            const email = "MochaTester@gmail.com";
            const username = "MochaTester";
            const type = "trainee";
            const bio = "I am a mocha tester testing our app.";
            const profilePic = "None";

            const video  = {
                video: fs.readFileSync("./src/videos/yoga.mp4"),
                thumbnail: fs.readFileSync("./src/images/Slider/Yoga.jpg"),
                description: "Yoga test video",
                title: "MochaTest_uploadVideo",
                category: "Misc."
            }

            await insertUser(email, username, type, bio, profilePic)
            const result = await uploadVideo(username, email, video)
            assert.equal(true, result);

        });
    })
})