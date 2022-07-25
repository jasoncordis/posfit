import '../css/PlayVideo.css'
import Webcam from 'react-webcam';
import { useRef, useState } from "react";
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

import videos from '../videos/yoga.mp4';
import drawJoints from '../ai/draw'; 

// var frameRate = Web.MediaTrackSettings.frameRate;
// console.log(frameRate);

const KEYPOINTS_PAIRS = [
  [5, 6], [5, 7], [5, 11], [6, 8], [6, 12], [7, 9], [8, 10], 
  [11, 12], [11, 13], [12, 14], [13, 15], [14, 16]
];

// differences cannot be above 10 degrees
const threshold = 10 * 3.1416 / 180;

// Pose detection
// -------------------------------------------------------------------------------------------------
export const PoseDetection = async (webcamRef, canvasRef, drawSkeleton) => {
  
  const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
  const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
  const canvas = document.getElementById('output1');
  canvas.width = 1500;
  canvas.height = 1000;
  //console.log(videoRef.current.width)
  const ctx = canvas.getContext('2d');
  setInterval (() => {
    let videoData = document.getElementById("videoDataRef");
    let vidPoints = trackVideo(videoData, ctx, detector, drawSkeleton);
    let camPoints = trackCamera(webcamRef, ctx, detector, drawSkeleton);   
    comparison(vidPoints, camPoints);
  }, Math.floor(1000 / 30))
  
}; 


const trackVideo = async (videoData, ctx, detector, drawSkeleton) => {
  if (videoData != null){
    ctx.clearRect(0, 0, 1500, 1000);
    const poses = await detector.estimatePoses(videoData);
    //console.log(poses[0].keypoints[0])
    if (poses[0] != undefined) {
      if (drawSkeleton) {
        drawJoints(poses[0].keypoints, ctx, "#FF0000")
      }
      return poses[0].keypoints;
    }
  }
  return null
}


const trackCamera = async (webcamRef, ctx, detector, drawSkeleton) => {
  
  if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4){
    // get video properties
    const camVideo = webcamRef.current.video
    const videoWidth = webcamRef.current.video.videoWidth
    const videoHeight = webcamRef.current.video.videoHeight
    
    // set video width
    webcamRef.current.video.width = videoWidth
    webcamRef.current.video.height = videoHeight

    // detection
    const poses = await detector.estimatePoses(camVideo);   
    if (poses[0] != undefined) {
      if (drawSkeleton) {
        drawJoints(poses[0].keypoints, ctx, "#FF0000")
      }
      return poses[0].keypoints;
    }
  }
  return null
}


const jointAngle = (vPoints, cPoints) => {
  //console.log(vPoints)
  let arr = []
  if (vPoints != null & cPoints != null) {
    KEYPOINTS_PAIRS.map(pair => {
        let vpt1 = vPoints[pair[0]];
        let vpt2 = vPoints[pair[1]];
        let cpt1 = cPoints[pair[0]];
        let cpt2 = cPoints[pair[1]];
        let vAngle = Math.atan((vpt1.y - vpt2.y) / (vpt1.x - vpt2.x))
        let cAngle = Math.atan((cpt1.y - cpt2.y) / (cpt1.x - cpt2.x))
        if (Math.abs(vAngle - cAngle) > threshold) {
          arr.push(pair)
        }
    })
  }
  return arr
}


const comparison = (vidPoints, camPoints) => {
  if (vidPoints != null & camPoints != null) {
    vidPoints.then(vPoints => {
      camPoints.then(cPoints => {
        let poseDiff = jointAngle(vPoints, cPoints)
        if (poseDiff.length > 0) {
          console.log(poseDiff)
        }
      })
    })
  }
}


function PlayVideo() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [drawSkeleton, setDrawing] = useState(false);
  PoseDetection(webcamRef, canvasRef, drawSkeleton);

  return (
    <>
      <div style={{padding: 200}}>
        <div id = "hey"></div>
        <video id="video" ref={videoRef} controls style={{width: 800, height: 800}}>
          <source src = {videos} type="video/mp4"></source>
        </video>
        <button onClick={() => setDrawing(!drawSkeleton)}>
          Click me
        </button>
        <Webcam ref={webcamRef} style={{ width: 640, height:480, transform: "translateX(10px) scaleX(-1)"}}/>
        <canvas id="output1" ref={canvasRef} style={{backgroundColor: 'rgba(52, 52, 52, 0.8)'}}/>
      </div>
    </>
  );
}


export default PlayVideo;