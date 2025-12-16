// ============================================================================
// FBAS - Finger Model and Animation
// ============================================================================

import * as THREE from 'three';

// Finger animation state
let fingerGroup = null;
let isAnimating = false;
let animationPhase = 'idle'; // idle, approaching, pressing, holding, retracting
let animationProgress = 0;
let animationCallback = null;

// Positions
const FINGER_START = new THREE.Vector3(2.5, -0.9, 2);
const FINGER_SCAN = new THREE.Vector3(0, -0.9, 0.65);
const FINGER_PRESS = new THREE.Vector3(0, -0.9, 0.55);

// ============================================================================
// Create Finger 3D Model
// ============================================================================

export function createFinger() {
    fingerGroup = new THREE.Group();
    fingerGroup.name = 'finger';
    
    // Finger base (main body)
    const fingerGeometry = new THREE.CapsuleGeometry(0.15, 0.6, 8, 16);
    const fingerMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4a574, // Skin tone
        roughness: 0.7,
        metalness: 0.0,
    });
    const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
    finger.rotation.x = Math.PI / 2.2;
    finger.rotation.z = -0.1;
    fingerGroup.add(finger);
    
    // Fingernail
    const nailGeometry = new THREE.BoxGeometry(0.18, 0.02, 0.25);
    const nailMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5deb3,
        roughness: 0.3,
        metalness: 0.1,
    });
    const nail = new THREE.Mesh(nailGeometry, nailMaterial);
    nail.position.set(0, 0.12, -0.35);
    nail.rotation.x = 0.2;
    fingerGroup.add(nail);
    
    // Fingertip (slightly different color)
    const tipGeometry = new THREE.SphereGeometry(0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const tipMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8c4a0,
        roughness: 0.8,
        metalness: 0.0,
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.rotation.x = Math.PI;
    tip.position.set(0, -0.02, 0.38);
    fingerGroup.add(tip);
    
    // Knuckle wrinkle lines (subtle)
    const wrinkleGeometry = new THREE.BoxGeometry(0.2, 0.01, 0.02);
    const wrinkleMaterial = new THREE.MeshStandardMaterial({
        color: 0xc49a6c,
        roughness: 0.9,
    });
    
    for (let i = 0; i < 2; i++) {
        const wrinkle = new THREE.Mesh(wrinkleGeometry, wrinkleMaterial);
        wrinkle.position.set(0, 0.13, -0.1 - i * 0.12);
        fingerGroup.add(wrinkle);
    }
    
    // Position at start
    fingerGroup.position.copy(FINGER_START);
    fingerGroup.visible = false;
    
    // Rotate to point toward sensor
    fingerGroup.rotation.y = -0.5;
    
    return fingerGroup;
}

// ============================================================================
// Get Finger Group
// ============================================================================

export function getFingerGroup() {
    return fingerGroup;
}

// ============================================================================
// Finger Animation
// ============================================================================

export function startFingerScan(onComplete) {
    if (isAnimating || !fingerGroup) return;
    
    isAnimating = true;
    animationPhase = 'approaching';
    animationProgress = 0;
    animationCallback = onComplete;
    
    fingerGroup.visible = true;
    fingerGroup.position.copy(FINGER_START);
}

export function updateFingerAnimation(deltaTime = 0.016) {
    if (!isAnimating || !fingerGroup) return null;
    
    const speed = 2.5;
    animationProgress += deltaTime * speed;
    
    let event = null;
    
    switch (animationPhase) {
        case 'approaching':
            // Move from start to scan position
            const approachT = easeOutCubic(Math.min(animationProgress, 1));
            fingerGroup.position.lerpVectors(FINGER_START, FINGER_SCAN, approachT);
            
            // Rotate to align with sensor
            fingerGroup.rotation.y = -0.5 + approachT * 0.5;
            
            if (animationProgress >= 1) {
                animationPhase = 'pressing';
                animationProgress = 0;
                event = 'scan_start';
            }
            break;
            
        case 'pressing':
            // Press down slightly
            const pressT = easeOutCubic(Math.min(animationProgress * 2, 1));
            fingerGroup.position.lerpVectors(FINGER_SCAN, FINGER_PRESS, pressT);
            
            if (animationProgress >= 0.5) {
                animationPhase = 'holding';
                animationProgress = 0;
                event = 'scan_contact';
            }
            break;
            
        case 'holding':
            // Hold in place (wait for result)
            // Slight vibration effect
            fingerGroup.position.x = FINGER_PRESS.x + Math.sin(animationProgress * 30) * 0.005;
            
            if (animationProgress >= 0.8) {
                animationPhase = 'retracting';
                animationProgress = 0;
                event = 'scan_complete';
            }
            break;
            
        case 'retracting':
            // Move back to start
            const retractT = easeInCubic(Math.min(animationProgress, 1));
            fingerGroup.position.lerpVectors(FINGER_PRESS, FINGER_START, retractT);
            fingerGroup.rotation.y = 0 - retractT * 0.5;
            
            if (animationProgress >= 1) {
                animationPhase = 'idle';
                isAnimating = false;
                fingerGroup.visible = false;
                
                if (animationCallback) {
                    animationCallback();
                    animationCallback = null;
                }
                event = 'animation_complete';
            }
            break;
    }
    
    return event;
}

// ============================================================================
// Cancel Animation
// ============================================================================

export function cancelFingerAnimation() {
    if (fingerGroup) {
        fingerGroup.visible = false;
        fingerGroup.position.copy(FINGER_START);
    }
    isAnimating = false;
    animationPhase = 'idle';
    animationProgress = 0;
    animationCallback = null;
}

// ============================================================================
// Check if Animating
// ============================================================================

export function isFingerAnimating() {
    return isAnimating;
}

export function getAnimationPhase() {
    return animationPhase;
}

// ============================================================================
// Easing Functions
// ============================================================================

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t) {
    return t * t * t;
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
