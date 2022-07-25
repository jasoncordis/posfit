import '../css/PlayVideo.css'
import Webcam from 'react-webcam';
import { useRef, useState } from "react";
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

import drawJoints from "../ai/draw"; 
import checkJoints from "../ai/feedback";


// var frameRate = Web.MediaTrackSettings.frameRate;
// console.log(frameRate);

const KEYPOINTS_PAIRS = [
  [5, 6], [5, 7], [5, 11], [6, 8], [6, 12], [7, 9], [8, 10], 
  [11, 12], [11, 13], [12, 14], [13, 15], [14, 16]
];

// differences cannot be above 10 degrees
const threshold = 20 * 3.1416 / 180;

// Pose detection
// -------------------------------------------------------------------------------------------------

const getDetector = async () => {
  const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};
  const detector1 = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig); 
  const detector2 = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig); 
  return {detector1, detector2}
}; 

let callDetector;

export const PoseDetection = async (videoDivId, vidCanvas, webcamRef, camCanvas, drawSkeleton) => {
  let detectors = await getDetector()
  if (!drawSkeleton) {
    console.log(callDetector)
    clearInterval(callDetector)
  }
    callDetector = setInterval (() => {

        let videoData = document.getElementById(videoDivId);
        let vidPoints = trackVideo(videoData, vidCanvas, detectors.detector1, drawSkeleton);
        let camPoints = trackCamera(webcamRef, camCanvas, detectors.detector2, drawSkeleton);   
        comparison(vidPoints, camPoints);
    }, 30)
}


const trackVideo = async (videoData, vidCanvas, detector, drawSkeleton) => {
  const canvas = document.getElementById(vidCanvas);
  if (canvas != null) {
    canvas.width = 1900;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (videoData){
      const poses = await detector.estimatePoses(videoData);
      if (poses[0] != undefined) {
        if (drawSkeleton) {
          drawJoints(poses[0].keypoints, ctx, "#3335FF")
        }
        return poses[0].keypoints;
      }
    }
  }
  return null
}


const trackCamera = async (webcamRef, camCanvas, detector, drawSkeleton) => {
  const canvas = document.getElementById(camCanvas);
  if (canvas != null) {
    const ctx2 = canvas.getContext('2d');
    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4){
      // get video properties
      const camVideo = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight

      canvas.width = videoWidth
      canvas.height = videoHeight
  
      // detection
      const poses = await detector.estimatePoses(camVideo);  
      if (poses[0] != undefined) {
        // if (drawSkeleton) {
        //   drawJoints(poses[0].keypoints, ctx2, "#3335FF")
        // }
        return poses[0].keypoints;
      }
    }
  } 
  return null
}


const jointAngle = (vPoints, cPoints) => {
  let dict = {}
  if (vPoints != null & cPoints != null) {
    KEYPOINTS_PAIRS.map(pair => {
        let vpt1 = vPoints[pair[0]];
        let vpt2 = vPoints[pair[1]];
        let cpt1 = cPoints[pair[0]];
        let cpt2 = cPoints[pair[1]];

        let vAngle = Math.atan((vpt1.y - vpt2.y) / (vpt1.x - vpt2.x))
        let cAngle = Math.atan((cpt1.y - cpt2.y) / (cpt1.x - cpt2.x))
        if (Math.abs(Math.abs(vAngle) - Math.abs(cAngle)) > threshold) {
          dict[pair[0]] = cpt1
          dict[pair[1]] = cpt2
        }
    })
  }
  return dict
}

const comparison = (vidPoints, camPoints) => {
  if (vidPoints != null & camPoints != null) {
    vidPoints.then(vPoints => {
      camPoints.then(cPoints => {
        let poseDiff = jointAngle(vPoints, cPoints)
        const isMyObjectEmpty = Object.keys(poseDiff).length === 0;
        if (!isMyObjectEmpty) {
          const canvas = document.getElementById("camCanvas");
          const ctx = canvas.getContext('2d');
          //console.log(poseDiff)
          checkJoints(poseDiff, ctx, "#FF0000")
        }
      })
    })
  }
}
