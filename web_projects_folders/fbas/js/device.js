// ============================================================================
// FBAS - Device 3D Model
// ============================================================================

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Device dimensions (exported for use in other modules)
export const DEVICE_DIMENSIONS = {
    bodyWidth: 2.4,
    bodyHeight: 4.2,
    bodyDepth: 0.4,
    bodyRadius: 0.25,
    screenWidth: 1.8,
    screenHeight: 1.6
};

// Create the screen texture with dynamic content
export function createScreenTexture(content = null) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Default content if none provided
    if (!content) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 512);

        // Header text - Date/Time and Professor
        ctx.fillStyle = '#333333';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('11/10/25 | 8:32 AM | PROF. ANDREW', 256, 40);

        // Course Title
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Data Structures and Algorithms', 256, 80);

        // Department (green italic)
        ctx.fillStyle = '#22aa22';
        ctx.font = 'italic 18px Arial';
        ctx.fillText('Computer Science', 256, 110);
        ctx.fillText('September 2025 Intake', 256, 135);

        // Year/Semester
        ctx.fillStyle = '#333333';
        ctx.font = '16px Arial';
        ctx.fillText('Year 2 Semester 2', 256, 160);

        // Student avatar circle placeholder
        ctx.beginPath();
        ctx.arc(256, 220, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#dddddd';
        ctx.fill();
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Avatar icon (simple silhouette)
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(256, 210, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(256, 245, 25, 18, 0, Math.PI, 0, true);
        ctx.fill();

        // Student ID
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('CIT-225-067/2025', 256, 295);

        // Student Name
        ctx.font = '18px Arial';
        ctx.fillText('Anthony Kimani', 256, 320);

        // Success checkmark and text
        ctx.fillStyle = '#22bb22';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('✓ SUCCESS', 256, 370);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return { texture, canvas, ctx };
}

// Create the FBAS device 3D model
export function createDevice() {
    const deviceGroup = new THREE.Group();
    deviceGroup.name = 'fbas-device';

    const { bodyWidth, bodyHeight, bodyDepth, bodyRadius } = DEVICE_DIMENSIONS;

    // Main Body - Rounded rectangle (brushed silver/aluminum)
    const bodyGeometry = new RoundedBoxGeometry(bodyWidth, bodyHeight, bodyDepth, 6, bodyRadius);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xd8d8d8,
        roughness: 0.35,
        metalness: 0.8,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.name = 'device-body';
    body.castShadow = true;
    body.receiveShadow = true;
    deviceGroup.add(body);

    // Screen bezel (dark frame around screen)
    const bezelGeometry = new RoundedBoxGeometry(2.0, 1.8, 0.08, 4, 0.08);
    const bezelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.3,
    });
    const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
    bezel.name = 'screen-bezel';
    bezel.position.set(0, 1.0, bodyDepth / 2 + 0.02);
    deviceGroup.add(bezel);

    // Display Screen with texture
    const screenGeometry = new THREE.PlaneGeometry(DEVICE_DIMENSIONS.screenWidth, DEVICE_DIMENSIONS.screenHeight);
    const { texture: screenTexture, canvas: screenCanvas, ctx: screenCtx } = createScreenTexture();
    const screenMaterial = new THREE.MeshBasicMaterial({
        map: screenTexture,
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.name = 'device-screen';
    screen.position.set(0, 1.0, bodyDepth / 2 + 0.07);
    
    // Store canvas reference for dynamic updates
    screen.userData.canvas = screenCanvas;
    screen.userData.ctx = screenCtx;
    screen.userData.texture = screenTexture;
    
    deviceGroup.add(screen);

    // Biometric Scanner Housing (outer ring - dark)
    const scannerOuterGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.15, 64);
    const scannerOuterMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.5,
    });
    const scannerOuter = new THREE.Mesh(scannerOuterGeometry, scannerOuterMaterial);
    scannerOuter.name = 'scanner-housing';
    scannerOuter.rotation.x = Math.PI / 2;
    scannerOuter.position.set(0, -0.9, bodyDepth / 2 + 0.05);
    deviceGroup.add(scannerOuter);

    // Blue LED Ring (glowing ring around scanner)
    const ringGeometry = new THREE.TorusGeometry(0.68, 0.04, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.9,
    });
    const ledRing = new THREE.Mesh(ringGeometry, ringMaterial);
    ledRing.name = 'led-ring';
    ledRing.position.set(0, -0.9, bodyDepth / 2 + 0.12);
    deviceGroup.add(ledRing);

    // Scanner Dome (dark glossy dome in center)
    const domeGeometry = new THREE.SphereGeometry(0.5, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.1,
        metalness: 0.9,
        envMapIntensity: 1.0,
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.name = 'scanner-dome';
    dome.rotation.x = -Math.PI / 2;
    dome.position.set(0, -0.9, bodyDepth / 2 + 0.08);
    deviceGroup.add(dome);

    // Inner dark ring around dome
    const innerRingGeometry = new THREE.RingGeometry(0.5, 0.62, 64);
    const innerRingMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.2,
        metalness: 0.6,
        side: THREE.DoubleSide,
    });
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
    innerRing.name = 'scanner-inner-ring';
    innerRing.position.set(0, -0.9, bodyDepth / 2 + 0.1);
    deviceGroup.add(innerRing);

    // Power Button on right side (recessed into the frame)
    const powerRecessGeometry = new THREE.BoxGeometry(0.08, 0.35, 0.12);
    const powerRecessMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.4,
        metalness: 0.6,
    });
    const powerRecess = new THREE.Mesh(powerRecessGeometry, powerRecessMaterial);
    powerRecess.position.set(bodyWidth / 2 - 0.02, bodyHeight / 2 - 0.5, 0);
    deviceGroup.add(powerRecess);

    const powerBtnGeometry = new THREE.BoxGeometry(0.04, 0.28, 0.08);
    const powerBtnMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.25,
        metalness: 0.8,
    });
    const powerButton = new THREE.Mesh(powerBtnGeometry, powerBtnMaterial);
    powerButton.name = 'power-button';
    powerButton.position.set(bodyWidth / 2 - 0.01, bodyHeight / 2 - 0.5, 0);
    deviceGroup.add(powerButton);

    // USB Type-C Port at bottom (recessed)
    const usbRecessGeometry = new THREE.BoxGeometry(0.4, 0.06, 0.16);
    const usbRecessMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.3,
        metalness: 0.5,
    });
    const usbRecess = new THREE.Mesh(usbRecessGeometry, usbRecessMaterial);
    usbRecess.position.set(0, -bodyHeight / 2 + 0.03, 0);
    deviceGroup.add(usbRecess);

    const usbInnerGeometry = new THREE.BoxGeometry(0.3, 0.04, 0.1);
    const usbInnerMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.1,
        metalness: 0.4,
    });
    const usbInner = new THREE.Mesh(usbInnerGeometry, usbInnerMaterial);
    usbInner.name = 'usb-port';
    usbInner.position.set(0, -bodyHeight / 2 + 0.03, 0.04);
    deviceGroup.add(usbInner);

    const usbEndGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 16);
    const usbEndMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.1,
        metalness: 0.4,
    });
    const usbEndLeft = new THREE.Mesh(usbEndGeometry, usbEndMaterial);
    usbEndLeft.rotation.x = Math.PI / 2;
    usbEndLeft.position.set(-0.13, -bodyHeight / 2 + 0.03, 0.04);
    deviceGroup.add(usbEndLeft);

    const usbEndRight = new THREE.Mesh(usbEndGeometry, usbEndMaterial);
    usbEndRight.rotation.x = Math.PI / 2;
    usbEndRight.position.set(0.13, -bodyHeight / 2 + 0.03, 0.04);
    deviceGroup.add(usbEndRight);

    return deviceGroup;
}

// Get the LED ring from device group
export function getLedRing(deviceGroup) {
    return deviceGroup.getObjectByName('led-ring');
}

// Get the screen mesh from device group
export function getScreen(deviceGroup) {
    return deviceGroup.getObjectByName('device-screen');
}

// Set LED ring color
export function setLedRingColor(deviceGroup, color) {
    const ledRing = getLedRing(deviceGroup);
    if (ledRing) {
        ledRing.material.color.setHex(color);
    }
}

// Set LED ring opacity
export function setLedRingOpacity(deviceGroup, opacity) {
    const ledRing = getLedRing(deviceGroup);
    if (ledRing) {
        ledRing.material.opacity = opacity;
    }
}

// LED ring color presets
export const LED_COLORS = {
    IDLE: 0x00aaff,      // Blue - ready
    SCANNING: 0x00ffff,  // Cyan - scanning
    SUCCESS: 0x00ff00,   // Green - success
    ERROR: 0xff0000,     // Red - error
    CHARGING: 0xffaa00,  // Orange - charging
    OFF: 0x333333        // Dark gray - off
};

// ============================================================================
// USB Cable Model
// ============================================================================

export function createUSBCable() {
    const cableGroup = new THREE.Group();
    cableGroup.name = 'usb-cable';
    
    // USB-C connector (the plug part)
    const connectorGeometry = new THREE.BoxGeometry(0.28, 0.06, 0.15);
    const connectorMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.3,
        metalness: 0.7,
    });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    connector.name = 'usb-connector';
    connector.position.set(0, 0, 0.075);
    cableGroup.add(connector);
    
    // Metal tip of connector
    const tipGeometry = new THREE.BoxGeometry(0.22, 0.04, 0.08);
    const tipMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.2,
        metalness: 0.9,
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.set(0, 0, 0.14);
    cableGroup.add(tip);
    
    // Cable (curved path)
    const cablePoints = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = 0;
        const y = -t * 2; // Go down
        const z = 0.15 + Math.sin(t * Math.PI) * 0.3; // Curve outward then back
        cablePoints.push(new THREE.Vector3(x, y, z));
    }
    
    const cablePath = new THREE.CatmullRomCurve3(cablePoints);
    const cableGeometry = new THREE.TubeGeometry(cablePath, 20, 0.04, 8, false);
    const cableMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.8,
        metalness: 0.1,
    });
    const cable = new THREE.Mesh(cableGeometry, cableMaterial);
    cable.name = 'cable-wire';
    cableGroup.add(cable);
    
    // Strain relief (where cable meets connector)
    const strainGeometry = new THREE.CylinderGeometry(0.05, 0.04, 0.1, 8);
    const strainMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.6,
        metalness: 0.2,
    });
    const strain = new THREE.Mesh(strainGeometry, strainMaterial);
    strain.rotation.x = Math.PI / 2;
    strain.position.set(0, -0.05, 0.15);
    cableGroup.add(strain);
    
    return cableGroup;
}
