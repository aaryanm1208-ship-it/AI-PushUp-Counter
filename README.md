# AI-Based Push-Up Counter & Body Posture Analyzer

## Overview
A real-time computer vision web application that uses MediaPipe Pose to detect body landmarks, count push-ups accurately, and analyze posture quality — all running entirely in the browser.

## Technologies Used
- HTML5
- CSS3 (Responsive Dark UI)
- JavaScript (Vanilla)
- MediaPipe Pose (CDN)
- Web Camera API

## How It Works
- Uses MediaPipe Pose to detect 33 body landmarks.
- Calculates elbow angles using vector mathematics.
- Counts push-ups using state-based angle transitions.
- Analyzes posture for sagging hips, bent back, and uneven shoulders.
- Displays real-time skeleton overlay, angles, warnings, accuracy, and timer.

## How to Run
1. Download all files into one folder
2. Open `index.html` in Chrome/Edge
3. Allow camera access
4. Start doing push-ups

## Resume-Ready Description
Built a real-time AI fitness application using browser-based pose estimation to track exercise repetitions and posture with high accuracy.
