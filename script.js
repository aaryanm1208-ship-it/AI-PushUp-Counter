/* =========================================================
   AI Push-Up Counter using MediaPipe Pose
   ========================================================= */

// HTML elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const pushupCountEl = document.getElementById("pushupCount");
const phaseEl = document.getElementById("phase");
const postureEl = document.getElementById("posture");
const accuracyEl = document.getElementById("accuracy");
const timerEl = document.getElementById("timer");
const warningsEl = document.getElementById("warnings");

const leftAngleEl = document.getElementById("leftAngle");
const rightAngleEl = document.getElementById("rightAngle");

let pushups = 0;
let correctReps = 0;
let phase = "UP";
let camera = null;
let startTime = null;
let timerInterval = null;

// ================= ANGLE CALCULATION =====================
// Angle between three points A-B-C using vector dot product
function calculateAngle(a, b, c) {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };

    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
    const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);

    const angleRad = Math.acos(dot / (magAB * magCB));
    return Math.round(angleRad * (180 / Math.PI));
}

// ================= POSTURE CHECK =========================
function checkPosture(landmarks) {
    const shoulderDiff = Math.abs(
        landmarks[11].y - landmarks[12].y
    );
    const hipDiff = Math.abs(
        landmarks[23].y - landmarks[11].y
    );

    let warnings = [];

    if (shoulderDiff > 0.05) warnings.push("Uneven Shoulders");
    if (hipDiff > 0.25) warnings.push("Sagging Hips / Bent Back");

    return warnings;
}

// ================= POSE CALLBACK =========================
function onResults(results) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.poseLandmarks) return;

    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS,
        { color: "#22c55e", lineWidth: 3 });
    drawLandmarks(ctx, results.poseLandmarks,
        { color: "#ef4444", lineWidth: 2 });

    const lm = results.poseLandmarks;

    const leftAngle = calculateAngle(lm[11], lm[13], lm[15]);
    const rightAngle = calculateAngle(lm[12], lm[14], lm[16]);

    leftAngleEl.innerText = leftAngle;
    rightAngleEl.innerText = rightAngle;

    const avgAngle = (leftAngle + rightAngle) / 2;

    // ================= PUSH-UP LOGIC ======================
    if (avgAngle < 90 && phase === "UP") {
        phase = "DOWN";
        phaseEl.innerText = "Down";
    }

    if (avgAngle > 160 && phase === "DOWN") {
        phase = "UP";
        pushups++;
        correctReps++;
        pushupCountEl.innerText = pushups;
        phaseEl.innerText = "Up";
    }

    // ================= POSTURE ============================
    const postureWarnings = checkPosture(lm);

    if (postureWarnings.length === 0) {
        postureEl.innerText = "Correct";
        postureEl.className = "status correct";
    } else {
        postureEl.innerText = "Incorrect";
        postureEl.className = "status incorrect";
    }

    warningsEl.innerText = postureWarnings.join(" | ");

    // ================= ACCURACY ===========================
    accuracyEl.innerText = Math.round((correctReps / Math.max(pushups, 1)) * 100) + "%";
}

// ================= CAMERA SETUP ==========================
const pose = new Pose({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onResults);

// ================= TIMER ================================
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const diff = Date.now() - startTime;
        const mins = String(Math.floor(diff / 60000)).padStart(2, "0");
        const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
        timerEl.innerText = `${mins}:${secs}`;
    }, 1000);
}

// ================= BUTTONS ===============================
document.getElementById("startBtn").onclick = () => {
    camera = new Camera(video, {
        onFrame: async () => {
            await pose.send({ image: video });
        },
        width: 640,
        height: 480
    });
    camera.start();
    startTimer();
};

document.getElementById("stopBtn").onclick = () => {
    if (camera) camera.stop();
    clearInterval(timerInterval);
};

document.getElementById("resetBtn").onclick = () => {
    pushups = 0;
    correctReps = 0;
    phase = "UP";
    pushupCountEl.innerText = "0";
    phaseEl.innerText = "--";
    accuracyEl.innerText = "0%";
    timerEl.innerText = "00:00";
    warningsEl.innerText = "";
};
