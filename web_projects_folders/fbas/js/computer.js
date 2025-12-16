// ============================================================================
// FBAS - Computer Monitor 3D Model
// A floating monitor for dashboard and pairing scenarios
// ============================================================================

import * as THREE from 'three';

// Monitor dimensions (in Three.js units)
export const MONITOR_DIMENSIONS = {
    width: 4.5,           // 16:9 aspect ratio
    height: 2.8,
    depth: 0.15,
    bezelWidth: 0.08,
    screenWidth: 4.3,
    screenHeight: 2.6,
    standHeight: 0.8,
    standWidth: 1.2,
    standDepth: 0.6
};

// ============================================================================
// Create Monitor Model
// ============================================================================

export function createComputer() {
    const monitor = new THREE.Group();
    monitor.name = 'computer';
    
    const dims = MONITOR_DIMENSIONS;
    
    // Monitor body (dark gray plastic)
    const bodyGeometry = new THREE.BoxGeometry(dims.width, dims.height, dims.depth);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.4,
        metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.name = 'monitor_body';
    monitor.add(body);
    
    // Bezel (slightly darker frame around screen)
    const bezelGeometry = new THREE.BoxGeometry(
        dims.screenWidth + dims.bezelWidth * 2,
        dims.screenHeight + dims.bezelWidth * 2,
        0.02
    );
    const bezelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.2
    });
    const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
    bezel.position.z = dims.depth / 2 + 0.01;
    bezel.name = 'monitor_bezel';
    monitor.add(bezel);
    
    // Screen (with dynamic texture)
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 640;
    const screenCtx = screenCanvas.getContext('2d');
    
    // Initialize with a blank screen
    screenCtx.fillStyle = '#1a1a2e';
    screenCtx.fillRect(0, 0, 1024, 640);
    
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;
    screenTexture.generateMipmaps = false; // Disable mipmaps to prevent scan lines
    
    const screenGeometry = new THREE.PlaneGeometry(dims.screenWidth, dims.screenHeight);
    const screenMaterial = new THREE.MeshBasicMaterial({
        map: screenTexture,
        side: THREE.FrontSide
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = dims.depth / 2 + 0.02;
    screen.name = 'computer_screen';
    
    // Store canvas and context for dynamic updates
    screen.userData.canvas = screenCanvas;
    screen.userData.ctx = screenCtx;
    screen.userData.texture = screenTexture;
    
    monitor.add(screen);
    
    // Stand neck (vertical part)
    const neckGeometry = new THREE.BoxGeometry(0.15, dims.standHeight, 0.1);
    const neckMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.5,
        metalness: 0.3
    });
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.y = -dims.height / 2 - dims.standHeight / 2;
    neck.position.z = -0.02;
    neck.name = 'monitor_neck';
    monitor.add(neck);
    
    // Stand base (flat elliptical base)
    const baseGeometry = new THREE.CylinderGeometry(
        dims.standWidth / 2,
        dims.standWidth / 2,
        0.08,
        32
    );
    baseGeometry.scale(1, 1, 0.5); // Make it elliptical
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.5,
        metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -dims.height / 2 - dims.standHeight - 0.04;
    base.rotation.x = 0;
    base.name = 'monitor_base';
    monitor.add(base);
    
    // Power LED (small indicator on bezel bottom)
    const ledGeometry = new THREE.CircleGeometry(0.03, 16);
    const ledMaterial = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.9
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(0, -dims.screenHeight / 2 - dims.bezelWidth * 1.5, dims.depth / 2 + 0.025);
    led.name = 'monitor_led';
    monitor.add(led);
    
    // Store LED reference for animations
    monitor.userData.led = led;
    
    return monitor;
}

// ============================================================================
// Get Computer Screen
// ============================================================================

export function getComputerScreen(computer) {
    if (!computer) return null;
    return computer.getObjectByName('computer_screen');
}

// ============================================================================
// Get Computer LED
// ============================================================================

export function getComputerLed(computer) {
    if (!computer) return null;
    return computer.userData.led;
}

// ============================================================================
// Update Computer LED
// ============================================================================

export function setComputerLedColor(computer, color) {
    const led = getComputerLed(computer);
    if (led) {
        led.material.color.setHex(color);
    }
}

export function setComputerLedState(computer, state) {
    const colors = {
        on: 0x22c55e,      // Green
        standby: 0xf59e0b, // Amber
        off: 0x666666,     // Gray
        syncing: 0x3b82f6  // Blue
    };
    setComputerLedColor(computer, colors[state] || colors.on);
}
