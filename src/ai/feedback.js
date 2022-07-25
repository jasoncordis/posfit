const COCO_KEYPOINTS = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear', 'left_shoulder',
  'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist',
  'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle',
  'right_ankle'
];


const COCO_CONNECTED_KEYPOINTS_PAIRS = [
  [5, 6], [5, 7], [5, 11], [6, 8], [6, 12],
  [7, 9], [8, 10], [11, 12], [11, 13], [12, 14], [13, 15], [14, 16]
];



function drawKeypoint(keypoint, ctx) {
  const circle = new Path2D();
  circle.arc(
      keypoint.x, keypoint.y, 4 /* radius */, 0 /* startAngle */, 2 * Math.PI);
  ctx.fill(circle);
  ctx.stroke(circle);
  
}

function drawSkeleton(keypoints, ctx, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  const pairs = COCO_CONNECTED_KEYPOINTS_PAIRS;
  for (const pair of pairs) {
    const [i, j] = pair;
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];
    if (kp1 != undefined & kp2 != undefined) {
      ctx.beginPath();
      let x1 = 640 - kp1.x;
      let x2 = 640 - kp2.x;
      ctx.moveTo(x1, kp1.y);
      ctx.lineTo(x2, kp2.y);
      ctx.stroke();
    }
    
  }
  //clearDrawing(ctx);
}



export default function checkJoints(keypoints, ctx, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  for (const keypoint in keypoints) {
    drawKeypoint(keypoint, ctx);
  }
  drawSkeleton(keypoints, ctx, color);
}

