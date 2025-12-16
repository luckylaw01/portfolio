// ============================================================================
// FBAS - Main Application Entry Point
// ============================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createDevice, getLedRing, LED_COLORS, getScreen, DEVICE_DIMENSIONS, createUSBCable } from './js/device.js';
import { createComputer, getComputerScreen, setComputerLedState } from './js/computer.js';
import { initAudio, resumeAudio, playButtonClick, playPowerOn, playPowerOff, playDoubleBeep, playErrorBuzz, playScanStart, playSyncSound, playPlugConnect, playPlugDisconnect } from './js/audio.js';
import {
    getDeviceState, updateDeviceState, saveAttendanceRecord, startSession, getCurrentSession,
    getAttendanceRecords, getAttendanceByClass, getAttendanceByStudent, clearAttendanceRecords,
    initializeStudents, getAllStudents, addStudent, updateStudent, deleteStudent, searchStudents, getStudentsByClassId,
    initializeTeachers, getAllTeachers, addTeacher, updateTeacher, deleteTeacher,
    initializeClasses, getAllClasses, addClass, updateClass, deleteClass,
    initializeDevices, getAllDevices, addDevice, updateDevice, deleteDevice, syncDevice,
    getActivityLog, addActivityLog, clearActivityLog,
    getSettings, updateSettings, resetAllData
} from './js/storage.js';
import { STUDENTS, CLASSES, TEACHERS, DEVICES, getStudentsByClass, getClassById, getTeacherById, getStudentById } from './js/data.js';
import { renderScreen, setScreenState, SCREEN_STATES, dimScreen, brightenScreen, turnOffScreen, turnOnScreen, startBootSequence, startShutdownSequence } from './js/screenRenderer.js';
import { renderComputerScreen, setComputerState, COMPUTER_STATES } from './js/computerScreenRenderer.js';
import { createFinger, startFingerScan, updateFingerAnimation, isFingerAnimating, getAnimationPhase, cancelFingerAnimation } from './js/finger.js';

// Initialize localStorage with default data from data.js
initializeStudents(STUDENTS);
initializeTeachers(TEACHERS);
initializeClasses(CLASSES);
initializeDevices(DEVICES);

// ============================================================================
// Scene Setup
// ============================================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc4b8a8);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

// Camera positions for different views
const CAMERA_POSITIONS = {
    default: { position: new THREE.Vector3(0, 0, 8), target: new THREE.Vector3(0, 0, 0) },
    front: { position: new THREE.Vector3(0, 0, 6), target: new THREE.Vector3(0, 0, 0) },
    top: { position: new THREE.Vector3(0, 8, 2), target: new THREE.Vector3(0, 0, 0) },
    side: { position: new THREE.Vector3(6, 0, 0), target: new THREE.Vector3(0, 0, 0) },
    setupView: { position: new THREE.Vector3(0.25, 0.5, 9), target: new THREE.Vector3(0.25, 0, 0) },
    deviceOnly: { position: new THREE.Vector3(-2, 0, 6), target: new THREE.Vector3(-2, 0, 0) },
    computerOnly: { position: new THREE.Vector3(2.5, 0.5, 6), target: new THREE.Vector3(2.5, 0, 0) },
    dualView: { position: new THREE.Vector3(0.25, 0.5, 8), target: new THREE.Vector3(0.25, 0, 0) }
};

camera.position.copy(CAMERA_POSITIONS.default.position);

// Try to create WebGL renderer with fallback options
let renderer;
try {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
    });
} catch (e) {
    console.warn('WebGL with antialias failed, trying without:', e);
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'low-power',
            failIfMajorPerformanceCaveat: false
        });
    } catch (e2) {
        console.error('WebGL not available:', e2);
        document.body.innerHTML = `
            <div style="padding: 40px; font-family: Arial; text-align: center;">
                <h1>WebGL Not Supported</h1>
                <p>Your browser or graphics card doesn't support WebGL.</p>
                <p>Try updating your graphics drivers or using a different browser.</p>
            </div>
        `;
        throw new Error('WebGL not available');
    }
}

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
renderer.shadowMap.enabled = false; // Disable shadows for older GPUs
document.body.appendChild(renderer.domElement);

// ============================================================================
// Controls
// ============================================================================

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 15;

let controlsPaused = false;

function pauseControls() {
    controlsPaused = true;
    controls.enabled = false;
}

function resumeControls() {
    controlsPaused = false;
    controls.enabled = true;
}

function resetToFrontView() {
    const targetPos = CAMERA_POSITIONS.front.position.clone();
    const targetLookAt = CAMERA_POSITIONS.front.target.clone();

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = Date.now();
    const duration = 500;

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const easeT = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(startPos, targetPos, easeT);
        controls.target.lerpVectors(startTarget, targetLookAt, easeT);

        if (t < 1) {
            requestAnimationFrame(animateCamera);
        }
    }

    animateCamera();
}

// Pan camera in a direction
const PAN_SPEED = 0.5;

function panCamera(direction) {
    // Get the camera's right and up vectors in world space
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();

    camera.getWorldDirection(new THREE.Vector3());
    right.setFromMatrixColumn(camera.matrix, 0); // X axis (right)
    up.setFromMatrixColumn(camera.matrix, 1); // Y axis (up)

    let offset = new THREE.Vector3();

    switch (direction) {
        case 'left':
            offset = right.multiplyScalar(-PAN_SPEED);
            break;
        case 'right':
            offset = right.multiplyScalar(PAN_SPEED);
            break;
        case 'up':
            offset = up.multiplyScalar(PAN_SPEED);
            break;
        case 'down':
            offset = up.multiplyScalar(-PAN_SPEED);
            break;
    }

    // Move both camera and target together to pan
    camera.position.add(offset);
    controls.target.add(offset);
}

// ============================================================================
// Lighting
// ============================================================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 10, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-5, 5, 5);
scene.add(fillLight);

// ============================================================================
// Device
// ============================================================================

const device = createDevice();
device.position.set(-2, 0, 0); // Position device on the left
scene.add(device);

// Add finger to scene
const finger = createFinger();
finger.position.x = -2; // Match device position
scene.add(finger);

// USB Cable (for charging scenario)
const usbCable = createUSBCable();
usbCable.position.set(-2, -DEVICE_DIMENSIONS.bodyHeight / 2 + 0.03, 0);
usbCable.visible = false; // Hidden by default, shown during charging
scene.add(usbCable);

// ============================================================================
// Computer Monitor
// ============================================================================

const computer = createComputer();
computer.position.set(2.5, 0, 0); // Position computer on the right
computer.visible = false; // Hidden by default, shown in scenarios 4 & 5
scene.add(computer);

// ============================================================================
// Connection Particles (for pairing animation)
// ============================================================================

const connectionParticles = new THREE.Group();
connectionParticles.name = 'connectionParticles';
connectionParticles.visible = false;
scene.add(connectionParticles);

// Create particles
const particleCount = 20;
const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
const particleMaterial = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.8
});

for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
    particle.userData.offset = i / particleCount;
    particle.userData.speed = 0.5 + Math.random() * 0.5;
    connectionParticles.add(particle);
}

// Animation state for connection
let isConnectionAnimating = false;

function updateConnectionParticles() {
    if (!isConnectionAnimating || !connectionParticles.visible) return;

    const time = Date.now() * 0.002;
    const startX = device.position.x + 1.5;
    const endX = computer.position.x - 2.5;
    const distance = endX - startX;

    connectionParticles.children.forEach((particle, i) => {
        const offset = particle.userData.offset;
        const speed = particle.userData.speed;
        const progress = ((time * speed + offset) % 1);

        particle.position.x = startX + distance * progress;
        particle.position.y = Math.sin(progress * Math.PI) * 0.5 + Math.sin(time * 3 + i) * 0.1;
        particle.position.z = Math.cos(time * 2 + i * 0.5) * 0.2;

        // Fade in/out at edges
        const fade = Math.sin(progress * Math.PI);
        particle.material.opacity = fade * 0.8;

        // Scale based on position
        const scale = 0.8 + fade * 0.4;
        particle.scale.setScalar(scale);
    });
}

function startConnectionAnimation() {
    isConnectionAnimating = true;
    connectionParticles.visible = true;
}

function stopConnectionAnimation() {
    isConnectionAnimating = false;
    connectionParticles.visible = false;
}

// ============================================================================
// Screen Update System
// ============================================================================

let lastTime = 0;
const clock = new THREE.Clock();

function updateDeviceScreen() {
    const screen = getScreen(device);
    if (!screen || !screen.userData.ctx) return;

    renderScreen(screen.userData.ctx, screen.userData.canvas);
    screen.userData.texture.needsUpdate = true;
}

function updateComputerScreen() {
    if (!computer.visible) return;

    const screen = getComputerScreen(computer);
    if (!screen || !screen.userData.ctx) return;

    renderComputerScreen(screen.userData.ctx, screen.userData.canvas);
    screen.userData.texture.needsUpdate = true;
}

// ============================================================================
// Raycaster for Screen Interaction
// ============================================================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    // Ignore clicks on the control panel
    if (event.target.closest('#control-panel')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const screen = getScreen(device);
    if (screen) {
        const intersects = raycaster.intersectObject(screen);
        if (intersects.length > 0) {
            handleScreenClick(intersects[0]);
        }
    }
}

function handleScreenClick(intersection) {
    const uv = intersection.uv;
    const pixelX = Math.floor(uv.x * 512);
    const pixelY = Math.floor((1 - uv.y) * 512);

    playButtonClick();

    // Handle click based on current scenario and screen state
    switch (currentScenario) {
        case 1: // Attendance mode
            handleAttendanceScreenClick(pixelX, pixelY);
            break;
        case 2: // Class Selection
            handleClassSelectScreenClick(pixelX, pixelY);
            break;
        case 3: // Charging - no interaction needed
            break;
        case 4: // Setup/Pairing
            handleSetupScreenClick(pixelX, pixelY);
            break;
        case 5: // Dashboard/Home
            handleDashboardScreenClick(pixelX, pixelY);
            break;
    }
}

function handleAttendanceScreenClick(pixelX, pixelY) {
    if (isScanning) return;

    // Get students not yet scanned
    const students = getStudentsByClass(currentClassId);
    const unscannedStudents = students.filter(s => !attendedStudents.has(s.id));

    if (unscannedStudents.length === 0) {
        console.log('All students have been scanned!');
        return;
    }

    // Pick a random unscanned student
    const randomStudent = unscannedStudents[Math.floor(Math.random() * unscannedStudents.length)];
    simulateFingerScan(randomStudent.id);
}

function handleClassSelectScreenClick(pixelX, pixelY) {
    // Screen layout for class selection:
    // Top area (0-100): Header
    // Class list (100-400): Each class takes ~50px height
    // Bottom (400-512): Navigation buttons

    if (pixelY < 100) {
        // Header tap - no action
        return;
    }

    if (pixelY >= 100 && pixelY < 400) {
        // Calculate which class was tapped
        const classIndex = Math.floor((pixelY - 100) / 50);
        if (classIndex >= 0 && classIndex < CLASSES.length) {
            selectedClassIndex = classIndex;
            playButtonClick();

            // Update screen to show selection
            setScreenState(SCREEN_STATES.CLASS_SELECT, {
                classes: CLASSES,
                selectedIndex: selectedClassIndex,
                batteryLevel,
                isOnline: true
            });
        }
    }

    if (pixelY >= 420 && pixelY < 480) {
        // Bottom button area
        if (pixelX >= 280 && pixelX < 480) {
            // "Start" button - transition to attendance
            const selectedClass = CLASSES[selectedClassIndex];
            if (selectedClass) {
                currentClassId = selectedClass.id;
                playDoubleBeep();

                // Transition to attendance mode
                currentScenario = 1;
                attendedStudents.clear();
                populateStudentList(currentClassId);

                // Update scenario buttons
                document.querySelectorAll('.scenario-btn').forEach((btn, i) => {
                    btn.classList.toggle('active', i === 0);
                });
                document.getElementById('student-panel').style.display = 'block';

                transitionToAttendanceMode();
            }
        }
    }
}

function handleSetupScreenClick(pixelX, pixelY) {
    // Setup screen has a "Complete Setup" button at bottom
    if (pixelY >= 400 && pixelY < 470) {
        if (pixelX >= 130 && pixelX < 380) {
            playDoubleBeep();
            // Transition to home after setup
            setScreenState(SCREEN_STATES.HOME, {
                batteryLevel,
                isOnline: true
            });
        }
    }
}

function handleDashboardScreenClick(pixelX, pixelY) {
    // Dashboard/Home screen menu items:
    // Each menu item is roughly 60px tall starting at y=180

    if (pixelY >= 180 && pixelY < 420) {
        const menuIndex = Math.floor((pixelY - 180) / 60);
        playButtonClick();

        switch (menuIndex) {
            case 0: // Start Attendance
                currentScenario = 2;
                loadScenario(2);
                break;
            case 1: // View Records
                // TODO: Implement records view
                console.log('View Records clicked');
                break;
            case 2: // Sync Data
                playSyncSound();
                console.log('Sync Data clicked');
                break;
            case 3: // Settings
                // TODO: Implement settings
                console.log('Settings clicked');
                break;
        }
    }
}

renderer.domElement.addEventListener('click', onMouseClick);

// ============================================================================
// LED Ring Animation
// ============================================================================

let glowIntensity = 0;
let currentLedColor = LED_COLORS.IDLE;
let targetLedColor = LED_COLORS.IDLE;
let ledPulseSpeed = 0.03;

function updateLedRing() {
    const ledRing = getLedRing(device);
    if (!ledRing) return;

    glowIntensity += ledPulseSpeed;
    const pulse = 0.7 + 0.3 * Math.sin(glowIntensity);
    ledRing.material.opacity = pulse;

    // Smooth color transition
    const currentColor = new THREE.Color(currentLedColor);
    const targetColor = new THREE.Color(targetLedColor);
    currentColor.lerp(targetColor, 0.1);
    ledRing.material.color.copy(currentColor);
    currentLedColor = currentColor.getHex();
}

function setLedState(state) {
    targetLedColor = LED_COLORS[state] || LED_COLORS.IDLE;

    // Adjust pulse speed based on state
    if (state === 'SCANNING') {
        ledPulseSpeed = 0.15;
    } else if (state === 'CHARGING') {
        ledPulseSpeed = 0.02;
    } else {
        ledPulseSpeed = 0.03;
    }
}

// ============================================================================
// Attendance State
// ============================================================================

let currentClassId = 'CIT-225';
let attendedStudents = new Set();
let currentScenario = 1;
let isDevicePoweredOn = true;
let batteryLevel = 85;
let isScanning = false;

// Class Selection State
let selectedClassIndex = 0;
let isChargingAnimating = false;
let chargingInterval = null;

// ============================================================================
// Screen State Helpers
// ============================================================================

function getCurrentScreenState() {
    return currentScenario === 1 ? 'attendance' : 'home';
}

function transitionToAttendanceMode() {
    const classInfo = getClassById(currentClassId);
    const teacher = classInfo ? getTeacherById(classInfo.teacherId) : null;
    const students = getStudentsByClass(currentClassId);

    setScreenState(SCREEN_STATES.PLACE_FINGER, {
        classInfo,
        teacher,
        students,
        presentCount: attendedStudents.size,
        totalCount: students.length,
        batteryLevel,
        isOnline: true
    });

    setLedState('IDLE');
}

function showHomeScreen() {
    setScreenState(SCREEN_STATES.HOME, {
        batteryLevel,
        isOnline: true
    });
}

// ============================================================================
// Control Panel UI
// ============================================================================

let isDashboardFullscreen = false;

function createControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'control-panel';
    panel.innerHTML = `
        <div class="panel-header">
            <h2>🖐️ FBAS Simulation</h2>
        </div>
        
        <div class="panel-section">
            <h3>Scenarios</h3>
            <div class="button-grid">
                <button id="btn-scenario-1" class="scenario-btn active">1. Attendance</button>
                <button id="btn-scenario-2" class="scenario-btn">2. Class Select</button>
                <button id="btn-scenario-3" class="scenario-btn">3. Charging</button>
                <button id="btn-scenario-4" class="scenario-btn">4. Setup</button>
                <button id="btn-scenario-5" class="scenario-btn">5. Dashboard</button>
            </div>
        </div>
        
        <div class="panel-section">
            <h3>View Controls</h3>
            <div class="button-row">
                <button id="btn-pause" class="control-btn">⏸ Pause Rotation</button>
                <button id="btn-reset-view" class="control-btn">🎯 Front View</button>
            </div>
            <div class="pan-controls">
                <div class="pan-row">
                    <button id="btn-pan-up" class="pan-btn" title="Pan Up">▲</button>
                </div>
                <div class="pan-row">
                    <button id="btn-pan-left" class="pan-btn" title="Pan Left">◀</button>
                    <button id="btn-pan-center" class="pan-btn center" title="Center View">⊙</button>
                    <button id="btn-pan-right" class="pan-btn" title="Pan Right">▶</button>
                </div>
                <div class="pan-row">
                    <button id="btn-pan-down" class="pan-btn" title="Pan Down">▼</button>
                </div>
            </div>
            <button id="btn-fullscreen-dashboard" class="control-btn fullscreen-btn" style="display: none;">
                🖥️ Bring Dashboard to Screen
            </button>
        </div>
        
        <div class="panel-section">
            <h3>Device State</h3>
            <div class="device-status">
                <div class="status-row">
                    <span>Battery:</span>
                    <div class="battery-bar">
                        <div class="battery-level" id="battery-level"></div>
                    </div>
                    <span id="battery-percent">85%</span>
                </div>
                <div class="status-row">
                    <span>Status:</span>
                    <span class="status-indicator online" id="connection-status">● Online</span>
                </div>
            </div>
            <div class="button-row">
                <button id="btn-power" class="control-btn">⏻ Power</button>
                <button id="btn-charge" class="control-btn">🔌 Charge</button>
            </div>
        </div>
        
        <div class="panel-section" id="student-panel" style="display: none;">
            <h3 id="class-title">Students</h3>
            <div class="class-info" id="class-info"></div>
            <div class="student-list" id="student-list"></div>
            <div class="attendance-footer">
                <div class="attendance-count">
                    Present: <span id="present-count">0</span>/<span id="total-count">0</span>
                </div>
                <button id="btn-end-session" class="control-btn danger">End Session</button>
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    // Create fullscreen dashboard overlay
    createDashboardOverlay();

    // Set initial battery level
    updateBatteryDisplay(85);

    // Event Listeners
    document.getElementById('btn-pause').addEventListener('click', () => {
        if (controlsPaused) {
            resumeControls();
            document.getElementById('btn-pause').textContent = '⏸ Pause Rotation';
            document.getElementById('btn-pause').classList.remove('active');
        } else {
            pauseControls();
            document.getElementById('btn-pause').textContent = '▶ Resume Rotation';
            document.getElementById('btn-pause').classList.add('active');
        }
        playButtonClick();
    });

    document.getElementById('btn-reset-view').addEventListener('click', () => {
        resetToFrontView();
        playButtonClick();
    });

    // Pan control buttons
    document.getElementById('btn-pan-up').addEventListener('click', () => {
        panCamera('up');
        playButtonClick();
    });

    document.getElementById('btn-pan-down').addEventListener('click', () => {
        panCamera('down');
        playButtonClick();
    });

    document.getElementById('btn-pan-left').addEventListener('click', () => {
        panCamera('left');
        playButtonClick();
    });

    document.getElementById('btn-pan-right').addEventListener('click', () => {
        panCamera('right');
        playButtonClick();
    });

    document.getElementById('btn-pan-center').addEventListener('click', () => {
        resetToFrontView();
        playButtonClick();
    });

    document.getElementById('btn-power').addEventListener('click', () => {
        toggleDevicePower();
    });

    document.getElementById('btn-charge').addEventListener('click', () => {
        playButtonClick();
        const btn = document.getElementById('btn-charge');
        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            btn.textContent = '🔌 Charge';
            setLedState('IDLE');
        } else {
            btn.classList.add('active');
            btn.textContent = '🔌 Charging...';
            setLedState('CHARGING');
        }
    });

    document.getElementById('btn-end-session').addEventListener('click', () => {
        playButtonClick();
        attendedStudents.clear();
        populateStudentList(currentClassId);
    });

    // Fullscreen dashboard button
    document.getElementById('btn-fullscreen-dashboard').addEventListener('click', () => {
        playButtonClick();
        toggleDashboardFullscreen();
    });

    // Scenario buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            playButtonClick();

            const scenarioId = e.target.id.replace('btn-scenario-', '');
            loadScenario(parseInt(scenarioId));
        });
    });
}

// ============================================================================
// Fullscreen Dashboard Overlay
// ============================================================================

let currentDashboardPage = 'dashboard';

function createDashboardOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'dashboard-overlay';
    overlay.className = 'dashboard-overlay hidden';
    overlay.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-sidebar">
                <div class="sidebar-header">
                    <span class="logo">📊 FBAS</span>
                    <span class="logo-sub">Attendance Manager</span>
                </div>
                <nav class="sidebar-nav">
                    <button class="nav-item active" data-page="dashboard">🏠 Dashboard</button>
                    <button class="nav-item" data-page="attendance">📋 Attendance</button>
                    <button class="nav-item" data-page="students">👥 Students</button>
                    <button class="nav-item" data-page="teachers">👨‍🏫 Teachers</button>
                    <button class="nav-item" data-page="devices">📱 Devices</button>
                    <button class="nav-item" data-page="reports">📈 Reports</button>
                    <button class="nav-item" data-page="settings">⚙️ Settings</button>
                </nav>
                <div class="sidebar-footer">
                    <button id="btn-exit-fullscreen" class="exit-btn">✕ Exit Fullscreen</button>
                </div>
            </div>
            <div class="dashboard-content" id="dashboard-content">
                <!-- Content will be dynamically inserted -->
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Navigation event listeners
    overlay.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            overlay.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            playButtonClick();
            currentDashboardPage = e.target.dataset.page;
            renderDashboardPage(currentDashboardPage);
        });
    });

    // Exit fullscreen button
    document.getElementById('btn-exit-fullscreen').addEventListener('click', () => {
        playButtonClick();
        toggleDashboardFullscreen();
    });

    // ESC key to exit
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isDashboardFullscreen) {
            toggleDashboardFullscreen();
        }
    });
}

function toggleDashboardFullscreen() {
    isDashboardFullscreen = !isDashboardFullscreen;
    const overlay = document.getElementById('dashboard-overlay');
    const btn = document.getElementById('btn-fullscreen-dashboard');

    if (isDashboardFullscreen) {
        overlay.classList.remove('hidden');
        btn.textContent = '🖥️ Exit Fullscreen';
        renderDashboardPage(currentDashboardPage);
    } else {
        overlay.classList.add('hidden');
        btn.textContent = '🖥️ Bring Dashboard to Screen';
    }
}

function renderDashboardPage(page) {
    const content = document.getElementById('dashboard-content');

    switch (page) {
        case 'dashboard':
            content.innerHTML = renderDashboardHome();
            break;
        case 'attendance':
            content.innerHTML = renderAttendancePage();
            break;
        case 'students':
            content.innerHTML = renderStudentsPage();
            break;
        case 'teachers':
            content.innerHTML = renderTeachersPage();
            break;
        case 'devices':
            content.innerHTML = renderDevicesPage();
            break;
        case 'reports':
            content.innerHTML = renderReportsPage();
            break;
        case 'settings':
            content.innerHTML = renderSettingsPage();
            break;
        default:
            content.innerHTML = renderDashboardHome();
    }

    // Attach event listeners for interactive elements
    attachDashboardEventListeners(page);
}

function renderDashboardHome() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Get real data from localStorage
    const students = getAllStudents();
    const teachers = getAllTeachers();
    const devices = getAllDevices();
    const attendanceRecords = getAttendanceRecords();
    const activityLog = getActivityLog();

    // Calculate today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(r => r.timestamp?.startsWith(today));
    const presentToday = new Set(todayRecords.map(r => r.studentId)).size;
    const absentToday = students.length - presentToday;
    const onlineDevices = devices.filter(d => d.isOnline).length;

    // Calculate weekly data
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const weekData = weekDays.map((day, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (4 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayRecords = attendanceRecords.filter(r => r.timestamp?.startsWith(dateStr));
        return new Set(dayRecords.map(r => r.studentId)).size;
    });
    const maxWeek = Math.max(...weekData, students.length) || students.length;

    return `
        <div class="page-header">
            <h1>Dashboard</h1>
            <span class="date">${dateStr}</span>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card primary">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <span class="stat-value">${students.length}</span>
                    <span class="stat-label">Total Students</span>
                </div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">✓</div>
                <div class="stat-info">
                    <span class="stat-value">${presentToday}</span>
                    <span class="stat-label">Present Today</span>
                </div>
            </div>
            <div class="stat-card danger">
                <div class="stat-icon">✗</div>
                <div class="stat-info">
                    <span class="stat-value">${absentToday}</span>
                    <span class="stat-label">Absent Today</span>
                </div>
            </div>
            <div class="stat-card info">
                <div class="stat-icon">📱</div>
                <div class="stat-info">
                    <span class="stat-value">${onlineDevices}</span>
                    <span class="stat-label">Devices Online</span>
                </div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="card chart-card">
                <h3>Weekly Attendance</h3>
                <div class="chart-container">
                    <div class="bar-chart">
                        ${weekData.map((count, i) => `
                            <div class="bar" style="height: ${maxWeek > 0 ? (count / maxWeek * 100) : 0}%">
                                <span>${count}</span>
                                <label>${weekDays[i]}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="card activity-card">
                <h3>Recent Activity</h3>
                <div class="activity-list">
                    ${activityLog.slice(0, 5).map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `
                            <div class="activity-item ${log.type}">
                                <span class="time">${time}</span>
                                <span class="text">${log.message}</span>
                            </div>
                        `;
    }).join('') || '<div class="activity-item info"><span class="text">No recent activity</span></div>'}
                </div>
            </div>
        </div>
        
        <div class="card devices-card">
            <h3>Connected Devices</h3>
            <div class="devices-grid">
                ${devices.slice(0, 4).map(d => {
        const teacher = teachers.find(t => t.id === d.assignedTeacherId);
        return `
                        <div class="device-item">
                            <span class="device-icon">📱</span>
                            <div class="device-info">
                                <span class="device-name">${d.id}</span>
                                <span class="device-teacher">${teacher?.name || 'Unassigned'}</span>
                            </div>
                            <div class="device-status">
                                <span class="battery">🔋 ${d.batteryLevel}%</span>
                                <span class="status ${d.isOnline ? 'online' : 'offline'}">● ${d.isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

function renderAttendancePage() {
    const classes = getAllClasses();
    const students = getAllStudents();
    const attendanceRecords = getAttendanceRecords();
    const classOptions = classes.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('');

    // Get today's date as default
    const today = new Date().toISOString().split('T')[0];

    return `
        <div class="page-header">
            <h1>Attendance Records</h1>
            <div class="header-actions">
                <select id="attendance-class-filter" class="filter-select">
                    <option value="">All Classes</option>
                    ${classOptions}
                </select>
                <input type="date" id="attendance-date-filter" class="filter-input" value="${today}">
                <button id="btn-export-attendance" class="btn-primary">📥 Export</button>
                <button id="btn-mark-manual" class="btn-secondary">✏️ Manual Entry</button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table" id="attendance-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Reg No</th>
                        <th>Class</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="attendance-tbody">
                    ${renderAttendanceRows(students, attendanceRecords, '', today)}
                </tbody>
            </table>
        </div>
        
        <!-- Manual Entry Modal -->
        <div id="manual-entry-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Manual Attendance Entry</h3>
                    <button class="modal-close" data-close-modal>&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Student</label>
                        <select id="manual-student" class="form-input">
                            ${students.map(s => `<option value="${s.id}">${s.name} (${s.regNo})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="manual-date" class="form-input" value="${today}">
                    </div>
                    <div class="form-group">
                        <label>Time</label>
                        <input type="time" id="manual-time" class="form-input" value="${new Date().toTimeString().slice(0, 5)}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" data-close-modal>Cancel</button>
                    <button id="btn-save-manual" class="btn-primary">Save</button>
                </div>
            </div>
        </div>
    `;
}

function renderAttendanceRows(students, records, classFilter, dateFilter) {
    const classes = getAllClasses();

    // Filter students by class
    let filteredStudents = students;
    if (classFilter) {
        filteredStudents = students.filter(s => s.classId === classFilter);
    }

    // Get attendance for the selected date
    const dateRecords = records.filter(r => r.timestamp?.startsWith(dateFilter));
    const presentIds = new Set(dateRecords.map(r => r.studentId));

    return filteredStudents.map(s => {
        const classInfo = classes.find(c => c.id === s.classId);
        const isPresent = presentIds.has(s.id);
        const record = dateRecords.find(r => r.studentId === s.id);
        const time = record ? new Date(record.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';

        return `
            <tr data-student-id="${s.id}">
                <td><strong>${s.name}</strong></td>
                <td>${s.regNo}</td>
                <td>${classInfo?.id || '-'}</td>
                <td>${time}</td>
                <td><span class="badge ${isPresent ? 'badge-success' : 'badge-danger'}">${isPresent ? 'Present' : 'Absent'}</span></td>
                <td>
                    ${!isPresent ? `<button class="btn-small btn-mark-present" data-student-id="${s.id}">Mark Present</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function renderStudentsPage() {
    const students = getAllStudents();
    const classes = getAllClasses();
    const attendanceRecords = getAttendanceRecords();

    // Calculate attendance rate for each student
    const studentStats = students.map(s => {
        const studentRecords = attendanceRecords.filter(r => r.studentId === s.id);
        // Assume 20 possible classes in the period
        const rate = studentRecords.length > 0 ? Math.min(100, Math.round((studentRecords.length / 20) * 100)) : 0;
        const lastRecord = studentRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        const lastSeen = lastRecord ? getRelativeTime(lastRecord.timestamp) : 'Never';
        return { ...s, rate, lastSeen };
    });

    return `
        <div class="page-header">
            <h1>Students</h1>
            <div class="header-actions">
                <input type="text" id="student-search" class="search-input" placeholder="Search students...">
                <select id="class-filter-students" class="filter-select">
                    <option value="">All Classes</option>
                    ${classes.map(c => `<option value="${c.id}">${c.id} - ${c.name}</option>`).join('')}
                </select>
                <button id="btn-add-student" class="btn-primary">+ Add Student</button>
            </div>
        </div>
        
        <div class="card">
            <table class="data-table" id="students-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Reg No</th>
                        <th>Class</th>
                        <th>Attendance Rate</th>
                        <th>Last Seen</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="students-tbody">
                    ${studentStats.map(s => {
        const classInfo = classes.find(c => c.id === s.classId);
        return `
                            <tr data-student-id="${s.id}">
                                <td><strong>${s.name}</strong></td>
                                <td>${s.regNo}</td>
                                <td>${classInfo?.id || '-'}</td>
                                <td>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: ${s.rate}%"></div>
                                        <span>${s.rate}%</span>
                                    </div>
                                </td>
                                <td>${s.lastSeen}</td>
                                <td class="action-buttons">
                                    <button class="btn-icon btn-edit-student" data-student-id="${s.id}" title="Edit">✏️</button>
                                    <button class="btn-icon btn-delete-student" data-student-id="${s.id}" title="Delete">🗑️</button>
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- Add/Edit Student Modal -->
        <div id="student-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="student-modal-title">Add Student</h3>
                    <button class="modal-close" data-close-modal>&times;</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="student-edit-id">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="student-name" class="form-input" placeholder="Enter full name">
                    </div>
                    <div class="form-group">
                        <label>Registration Number</label>
                        <input type="text" id="student-regno" class="form-input" placeholder="e.g., CIT-225-067/2025">
                    </div>
                    <div class="form-group">
                        <label>Class</label>
                        <select id="student-class" class="form-input">
                            ${classes.map(c => `<option value="${c.id}">${c.id} - ${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" data-close-modal>Cancel</button>
                    <button id="btn-save-student" class="btn-primary">Save Student</button>
                </div>
            </div>
        </div>
        
        <!-- Delete Confirmation Modal -->
        <div id="delete-confirm-modal" class="modal hidden">
            <div class="modal-content modal-small">
                <div class="modal-header">
                    <h3>Confirm Delete</h3>
                    <button class="modal-close" data-close-modal>&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete <strong id="delete-student-name"></strong>?</p>
                    <p class="text-muted">This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" data-close-modal>Cancel</button>
                    <button id="btn-confirm-delete" class="btn-danger">Delete</button>
                </div>
            </div>
        </div>
    `;
}

function getRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
}

function renderTeachersPage() {
    const teachers = getAllTeachers();
    const classes = getAllClasses();
    const devices = getAllDevices();

    return `
        <div class="page-header">
            <h1>Teachers</h1>
            <button id="btn-add-teacher" class="btn-primary">+ Add Teacher</button>
        </div>
        
        <div class="teachers-grid">
            ${teachers.map(t => {
        const teacherClasses = classes.filter(c => c.teacherId === t.id);
        const device = devices.find(d => d.assignedTeacherId === t.id);
        return `
                    <div class="teacher-card" data-teacher-id="${t.id}">
                        <div class="teacher-avatar">👨‍🏫</div>
                        <div class="teacher-info">
                            <h3>${t.name}</h3>
                            <p>${t.department}</p>
                            <p class="teacher-email">${t.email || ''}</p>
                        </div>
                        <div class="teacher-details">
                            <div class="detail-row">
                                <span>ID:</span>
                                <span>${t.id}</span>
                            </div>
                            <div class="detail-row">
                                <span>Device:</span>
                                <span class="${device ? 'text-success' : 'text-muted'}">${device?.id || 'None'}</span>
                            </div>
                            <div class="detail-row">
                                <span>Classes:</span>
                                <span>${teacherClasses.length}</span>
                            </div>
                        </div>
                        <div class="teacher-classes">
                            ${teacherClasses.map(c => `<span class="class-tag">${c.id}</span>`).join('')}
                        </div>
                        <div class="teacher-actions">
                            <button class="btn-small btn-edit-teacher" data-teacher-id="${t.id}">Edit</button>
                            <button class="btn-small btn-danger btn-delete-teacher" data-teacher-id="${t.id}">Delete</button>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
        
        <!-- Add/Edit Teacher Modal -->
        <div id="teacher-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="teacher-modal-title">Add Teacher</h3>
                    <button class="modal-close" data-close-modal>&times;</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="teacher-edit-id">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="teacher-name" class="form-input" placeholder="Enter full name">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="teacher-email" class="form-input" placeholder="email@university.ac.ke">
                    </div>
                    <div class="form-group">
                        <label>Department</label>
                        <input type="text" id="teacher-department" class="form-input" placeholder="e.g., Computer Science">
                    </div>
                    <div class="form-group">
                        <label>Assigned Device</label>
                        <select id="teacher-device" class="form-input">
                            <option value="">No device</option>
                            ${devices.filter(d => !d.assignedTeacherId || teachers.every(t => t.assignedDeviceId !== d.id))
            .map(d => `<option value="${d.id}">${d.id}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" data-close-modal>Cancel</button>
                    <button id="btn-save-teacher" class="btn-primary">Save Teacher</button>
                </div>
            </div>
        </div>
    `;
}

function renderDevicesPage() {
    const devices = getAllDevices();
    const teachers = getAllTeachers();

    return `
        <div class="page-header">
            <h1>Devices</h1>
            <button id="btn-add-device" class="btn-primary">+ Pair New Device</button>
        </div>
        
        <div class="devices-list">
            ${devices.map(d => {
        const teacher = teachers.find(t => t.id === d.assignedTeacherId);
        const lastSyncTime = d.lastSync ? getRelativeTime(d.lastSync) : 'Never';
        return `
                    <div class="device-card ${d.isOnline ? 'online' : 'offline'}" data-device-id="${d.id}">
                        <div class="device-header">
                            <span class="device-id">📱 ${d.id}</span>
                            <span class="status-badge ${d.isOnline ? 'online' : 'offline'}">${d.isOnline ? '● Online' : '○ Offline'}</span>
                        </div>
                        <div class="device-body">
                            <div class="device-row">
                                <span>Assigned to:</span>
                                <strong>${teacher?.name || 'Unassigned'}</strong>
                            </div>
                            <div class="device-row">
                                <span>Battery:</span>
                                <div class="battery-indicator ${d.batteryLevel < 20 ? 'low' : ''}">
                                    <div class="battery-fill" style="width: ${d.batteryLevel}%"></div>
                                    <span>${d.batteryLevel}%${d.isCharging ? ' ⚡' : ''}</span>
                                </div>
                            </div>
                            <div class="device-row">
                                <span>Last Sync:</span>
                                <span>${lastSyncTime}</span>
                            </div>
                            <div class="device-row">
                                <span>Firmware:</span>
                                <span>v${d.firmwareVersion || '1.0.0'}</span>
                            </div>
                        </div>
                        <div class="device-actions">
                            <button class="btn-secondary btn-sync-device" data-device-id="${d.id}">🔄 Sync</button>
                            <button class="btn-secondary btn-edit-device" data-device-id="${d.id}">⚙️ Settings</button>
                            <button class="btn-danger btn-small btn-delete-device" data-device-id="${d.id}">🗑️</button>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
        
        <!-- Add/Edit Device Modal -->
        <div id="device-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="device-modal-title">Pair New Device</h3>
                    <button class="modal-close" data-close-modal>&times;</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="device-edit-id">
                    <div class="form-group">
                        <label>Serial Number</label>
                        <input type="text" id="device-serial" class="form-input" placeholder="e.g., FBAS-2025-004-NTU">
                    </div>
                    <div class="form-group">
                        <label>Assign to Teacher</label>
                        <select id="device-teacher" class="form-input">
                            <option value="">No assignment</option>
                            ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" data-close-modal>Cancel</button>
                    <button id="btn-save-device" class="btn-primary">Save Device</button>
                </div>
            </div>
        </div>
    `;
}

function renderReportsPage() {
    const students = getAllStudents();
    const classes = getAllClasses();
    const devices = getAllDevices();
    const attendanceRecords = getAttendanceRecords();

    // Calculate statistics
    const totalRecords = attendanceRecords.length;
    const uniqueStudents = new Set(attendanceRecords.map(r => r.studentId)).size;
    const avgAttendance = students.length > 0 ? Math.round((uniqueStudents / students.length) * 100) : 0;
    const onlineDevices = devices.filter(d => d.isOnline).length;

    return `
        <div class="page-header">
            <h1>Reports</h1>
            <div class="header-actions">
                <select id="report-period" class="filter-select">
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="semester">This Semester</option>
                    <option value="custom">Custom Range</option>
                </select>
                <button id="btn-export-report" class="btn-primary">📥 Export All</button>
            </div>
        </div>
        
        <div class="reports-grid">
            <div class="report-card" data-report="summary">
                <div class="report-icon">📊</div>
                <h3>Attendance Summary</h3>
                <p>Overall attendance statistics for all classes</p>
                <button class="btn-primary btn-generate-report" data-report="summary">Generate</button>
            </div>
            <div class="report-card" data-report="student">
                <div class="report-icon">👥</div>
                <h3>Student Report</h3>
                <p>Individual student attendance records</p>
                <button class="btn-primary btn-generate-report" data-report="student">Generate</button>
            </div>
            <div class="report-card" data-report="class">
                <div class="report-icon">📚</div>
                <h3>Class Report</h3>
                <p>Attendance breakdown by class</p>
                <button class="btn-primary btn-generate-report" data-report="class">Generate</button>
            </div>
            <div class="report-card" data-report="daily">
                <div class="report-icon">📅</div>
                <h3>Daily Log</h3>
                <p>Detailed daily attendance log</p>
                <button class="btn-primary btn-generate-report" data-report="daily">Generate</button>
            </div>
        </div>
        
        <div class="card">
            <h3>Quick Stats</h3>
            <div class="quick-stats">
                <div class="quick-stat">
                    <span class="value">${avgAttendance}%</span>
                    <span class="label">Average Attendance</span>
                </div>
                <div class="quick-stat">
                    <span class="value">${students.length}</span>
                    <span class="label">Total Students</span>
                </div>
                <div class="quick-stat">
                    <span class="value">${classes.length}</span>
                    <span class="label">Active Classes</span>
                </div>
                <div class="quick-stat">
                    <span class="value">${onlineDevices}</span>
                    <span class="label">Devices Active</span>
                </div>
            </div>
        </div>
        
        <div class="card" id="report-output" style="display: none;">
            <div class="report-header">
                <h3 id="report-title">Report</h3>
                <button class="btn-secondary" id="btn-close-report">✕ Close</button>
            </div>
            <div id="report-content"></div>
        </div>
    `;
}

function renderSettingsPage() {
    const settings = getSettings();
    const students = getAllStudents();
    const teachers = getAllTeachers();
    const classes = getAllClasses();
    const devices = getAllDevices();
    const attendanceRecords = getAttendanceRecords();

    return `
        <div class="page-header">
            <h1>Settings</h1>
        </div>
        
        <div class="settings-sections">
            <div class="card settings-card">
                <h3>🏫 School Information</h3>
                <div class="form-group">
                    <label>School Name</label>
                    <input type="text" id="setting-school-name" value="${settings.schoolName || 'Nairobi Technical University'}" class="form-input">
                </div>
                <div class="form-group">
                    <label>School Code</label>
                    <input type="text" id="setting-school-code" value="${settings.schoolCode || 'NTU'}" class="form-input">
                </div>
                <button id="btn-save-school-info" class="btn-primary">Save Changes</button>
            </div>
            
            <div class="card settings-card">
                <h3>⏰ Attendance Settings</h3>
                <div class="form-group">
                    <label>Late Threshold (minutes)</label>
                    <input type="number" id="setting-late-threshold" value="15" class="form-input">
                </div>
                <div class="form-group">
                    <label>Scan Failure Rate (%)</label>
                    <input type="number" id="setting-failure-rate" value="${(settings.scanFailureRate || 0.02) * 100}" min="0" max="20" class="form-input">
                </div>
                <div class="form-group">
                    <label>Auto-sync Interval</label>
                    <select id="setting-sync-interval" class="form-input">
                        <option value="5">Every 5 minutes</option>
                        <option value="15" selected>Every 15 minutes</option>
                        <option value="30">Every 30 minutes</option>
                        <option value="0">Manual only</option>
                    </select>
                </div>
                <button id="btn-save-attendance-settings" class="btn-primary">Save Changes</button>
            </div>
            
            <div class="card settings-card">
                <h3>🔊 Sound Settings</h3>
                <div class="toggle-group">
                    <label>
                        <input type="checkbox" id="setting-sound-enabled" ${settings.soundEnabled !== false ? 'checked' : ''}> 
                        Enable sound effects
                    </label>
                </div>
                <div class="form-group">
                    <label>Volume</label>
                    <input type="range" id="setting-volume" min="0" max="100" value="${(settings.volume || 0.7) * 100}" class="form-range">
                    <span id="volume-display">${Math.round((settings.volume || 0.7) * 100)}%</span>
                </div>
                <button id="btn-save-sound-settings" class="btn-primary">Save Changes</button>
            </div>
            
            <div class="card settings-card">
                <h3>🔔 Notifications</h3>
                <div class="toggle-group">
                    <label>
                        <input type="checkbox" id="setting-email-low-attendance" checked> 
                        Email alerts for low attendance
                    </label>
                </div>
                <div class="toggle-group">
                    <label>
                        <input type="checkbox" id="setting-device-offline" checked> 
                        Device offline alerts
                    </label>
                </div>
                <div class="toggle-group">
                    <label>
                        <input type="checkbox" id="setting-daily-summary"> 
                        Daily summary reports
                    </label>
                </div>
            </div>
            
            <div class="card settings-card">
                <h3>💾 Data Management</h3>
                <div class="data-stats">
                    <p>📊 Students: <strong>${students.length}</strong></p>
                    <p>👨‍🏫 Teachers: <strong>${teachers.length}</strong></p>
                    <p>📚 Classes: <strong>${classes.length}</strong></p>
                    <p>📱 Devices: <strong>${devices.length}</strong></p>
                    <p>📋 Attendance Records: <strong>${attendanceRecords.length}</strong></p>
                </div>
                <div class="button-group">
                    <button id="btn-export-data" class="btn-secondary">📥 Export All Data</button>
                    <button id="btn-import-data" class="btn-secondary">📤 Import Data</button>
                </div>
                <input type="file" id="import-file-input" accept=".json" style="display: none;">
            </div>
            
            <div class="card settings-card danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <p class="text-muted">These actions cannot be undone. Please proceed with caution.</p>
                <div class="button-group">
                    <button id="btn-clear-attendance" class="btn-danger">Clear Attendance Records</button>
                    <button id="btn-reset-all" class="btn-danger">Reset All Data</button>
                </div>
            </div>
        </div>
    `;
}

function attachDashboardEventListeners(page) {
    // Close modal buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            playButtonClick();
        });
    });

    // Page-specific event listeners
    switch (page) {
        case 'attendance':
            attachAttendanceListeners();
            break;
        case 'students':
            attachStudentListeners();
            break;
        case 'teachers':
            attachTeacherListeners();
            break;
        case 'devices':
            attachDeviceListeners();
            break;
        case 'reports':
            attachReportListeners();
            break;
        case 'settings':
            attachSettingsListeners();
            break;
    }
}

function attachAttendanceListeners() {
    const classFilter = document.getElementById('attendance-class-filter');
    const dateFilter = document.getElementById('attendance-date-filter');
    const tbody = document.getElementById('attendance-tbody');

    function refreshTable() {
        const students = getAllStudents();
        const records = getAttendanceRecords();
        tbody.innerHTML = renderAttendanceRows(students, records, classFilter.value, dateFilter.value);
        attachMarkPresentButtons();
    }

    function attachMarkPresentButtons() {
        document.querySelectorAll('.btn-mark-present').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.target.dataset.studentId;
                const student = getAllStudents().find(s => s.id === studentId);
                if (student) {
                    saveAttendanceRecord({
                        studentId: student.id,
                        studentName: student.name,
                        classId: student.classId,
                        method: 'manual'
                    });
                    addActivityLog('success', `${student.name} marked present (manual)`);
                    playDoubleBeep();
                    refreshTable();
                }
            });
        });
    }

    if (classFilter) classFilter.addEventListener('change', refreshTable);
    if (dateFilter) dateFilter.addEventListener('change', refreshTable);

    // Manual entry button
    const manualBtn = document.getElementById('btn-mark-manual');
    if (manualBtn) {
        manualBtn.addEventListener('click', () => {
            document.getElementById('manual-entry-modal').classList.remove('hidden');
            playButtonClick();
        });
    }

    // Save manual entry
    const saveManualBtn = document.getElementById('btn-save-manual');
    if (saveManualBtn) {
        saveManualBtn.addEventListener('click', () => {
            const studentId = document.getElementById('manual-student').value;
            const date = document.getElementById('manual-date').value;
            const time = document.getElementById('manual-time').value;
            const student = getAllStudents().find(s => s.id === studentId);

            if (student) {
                const timestamp = new Date(`${date}T${time}`).toISOString();
                saveAttendanceRecord({
                    studentId: student.id,
                    studentName: student.name,
                    classId: student.classId,
                    timestamp,
                    method: 'manual'
                });
                addActivityLog('success', `${student.name} marked present (manual entry)`);
                playDoubleBeep();
                document.getElementById('manual-entry-modal').classList.add('hidden');
                refreshTable();
            }
        });
    }

    // Export button
    const exportBtn = document.getElementById('btn-export-attendance');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const records = getAttendanceRecords();
            downloadJSON(records, 'attendance_records.json');
            playButtonClick();
        });
    }

    attachMarkPresentButtons();
}

function attachStudentListeners() {
    const searchInput = document.getElementById('student-search');
    const classFilter = document.getElementById('class-filter-students');
    let deleteStudentId = null;

    function filterStudents() {
        const query = searchInput?.value.toLowerCase() || '';
        const classId = classFilter?.value || '';

        document.querySelectorAll('#students-tbody tr').forEach(row => {
            const name = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';
            const rowClassId = row.querySelector('td:nth-child(3)')?.textContent || '';
            const matchesSearch = name.includes(query);
            const matchesClass = !classId || rowClassId === classId;
            row.style.display = matchesSearch && matchesClass ? '' : 'none';
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterStudents);
    if (classFilter) classFilter.addEventListener('change', filterStudents);

    // Add student button
    const addBtn = document.getElementById('btn-add-student');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('student-modal-title').textContent = 'Add Student';
            document.getElementById('student-edit-id').value = '';
            document.getElementById('student-name').value = '';
            document.getElementById('student-regno').value = '';
            document.getElementById('student-modal').classList.remove('hidden');
            playButtonClick();
        });
    }

    // Edit student buttons
    document.querySelectorAll('.btn-edit-student').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const studentId = e.target.dataset.studentId;
            const student = getAllStudents().find(s => s.id === studentId);
            if (student) {
                document.getElementById('student-modal-title').textContent = 'Edit Student';
                document.getElementById('student-edit-id').value = student.id;
                document.getElementById('student-name').value = student.name;
                document.getElementById('student-regno').value = student.regNo;
                document.getElementById('student-class').value = student.classId;
                document.getElementById('student-modal').classList.remove('hidden');
                playButtonClick();
            }
        });
    });

    // Delete student buttons
    document.querySelectorAll('.btn-delete-student').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteStudentId = e.target.dataset.studentId;
            const student = getAllStudents().find(s => s.id === deleteStudentId);
            if (student) {
                document.getElementById('delete-student-name').textContent = student.name;
                document.getElementById('delete-confirm-modal').classList.remove('hidden');
                playButtonClick();
            }
        });
    });

    // Save student button
    const saveBtn = document.getElementById('btn-save-student');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const editId = document.getElementById('student-edit-id').value;
            const name = document.getElementById('student-name').value.trim();
            const regNo = document.getElementById('student-regno').value.trim();
            const classId = document.getElementById('student-class').value;

            if (!name || !regNo) {
                alert('Please fill in all fields');
                return;
            }

            if (editId) {
                updateStudent(editId, { name, regNo, classId });
            } else {
                addStudent({ name, regNo, classId, fingerprintId: `FP${Date.now()}` });
            }

            playDoubleBeep();
            document.getElementById('student-modal').classList.add('hidden');
            renderDashboardPage('students');
        });
    }

    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (deleteStudentId) {
                deleteStudent(deleteStudentId);
                playButtonClick();
                document.getElementById('delete-confirm-modal').classList.add('hidden');
                renderDashboardPage('students');
            }
        });
    }
}

function attachTeacherListeners() {
    let editTeacherId = null;

    // Add teacher button
    const addBtn = document.getElementById('btn-add-teacher');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('teacher-modal-title').textContent = 'Add Teacher';
            document.getElementById('teacher-edit-id').value = '';
            document.getElementById('teacher-name').value = '';
            document.getElementById('teacher-email').value = '';
            document.getElementById('teacher-department').value = '';
            document.getElementById('teacher-device').value = '';
            document.getElementById('teacher-modal').classList.remove('hidden');
            playButtonClick();
        });
    }

    // Edit teacher buttons
    document.querySelectorAll('.btn-edit-teacher').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const teacherId = e.target.dataset.teacherId;
            const teacher = getAllTeachers().find(t => t.id === teacherId);
            if (teacher) {
                document.getElementById('teacher-modal-title').textContent = 'Edit Teacher';
                document.getElementById('teacher-edit-id').value = teacher.id;
                document.getElementById('teacher-name').value = teacher.name;
                document.getElementById('teacher-email').value = teacher.email || '';
                document.getElementById('teacher-department').value = teacher.department || '';
                document.getElementById('teacher-device').value = teacher.assignedDeviceId || '';
                document.getElementById('teacher-modal').classList.remove('hidden');
                playButtonClick();
            }
        });
    });

    // Delete teacher buttons
    document.querySelectorAll('.btn-delete-teacher').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const teacherId = e.target.dataset.teacherId;
            if (confirm('Are you sure you want to delete this teacher?')) {
                deleteTeacher(teacherId);
                playButtonClick();
                renderDashboardPage('teachers');
            }
        });
    });

    // Save teacher button
    const saveBtn = document.getElementById('btn-save-teacher');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const editId = document.getElementById('teacher-edit-id').value;
            const name = document.getElementById('teacher-name').value.trim();
            const email = document.getElementById('teacher-email').value.trim();
            const department = document.getElementById('teacher-department').value.trim();
            const assignedDeviceId = document.getElementById('teacher-device').value;

            if (!name) {
                alert('Please enter a name');
                return;
            }

            if (editId) {
                updateTeacher(editId, { name, email, department, assignedDeviceId });
            } else {
                addTeacher({ name, email, department, assignedDeviceId, classes: [] });
            }

            playDoubleBeep();
            document.getElementById('teacher-modal').classList.add('hidden');
            renderDashboardPage('teachers');
        });
    }
}

function attachDeviceListeners() {
    // Add device button
    const addBtn = document.getElementById('btn-add-device');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('device-modal-title').textContent = 'Pair New Device';
            document.getElementById('device-edit-id').value = '';
            document.getElementById('device-serial').value = '';
            document.getElementById('device-teacher').value = '';
            document.getElementById('device-modal').classList.remove('hidden');
            playButtonClick();
        });
    }

    // Sync device buttons
    document.querySelectorAll('.btn-sync-device').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const deviceId = e.target.dataset.deviceId;
            syncDevice(deviceId);
            playSyncSound();
            addActivityLog('success', `Device ${deviceId} synced`);
            renderDashboardPage('devices');
        });
    });

    // Edit device buttons
    document.querySelectorAll('.btn-edit-device').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const deviceId = e.target.dataset.deviceId;
            const device = getAllDevices().find(d => d.id === deviceId);
            if (device) {
                document.getElementById('device-modal-title').textContent = 'Edit Device';
                document.getElementById('device-edit-id').value = device.id;
                document.getElementById('device-serial').value = device.serialNumber || '';
                document.getElementById('device-teacher').value = device.assignedTeacherId || '';
                document.getElementById('device-modal').classList.remove('hidden');
                playButtonClick();
            }
        });
    });

    // Delete device buttons
    document.querySelectorAll('.btn-delete-device').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const deviceId = e.target.dataset.deviceId;
            if (confirm('Are you sure you want to remove this device?')) {
                deleteDevice(deviceId);
                playButtonClick();
                renderDashboardPage('devices');
            }
        });
    });

    // Save device button
    const saveBtn = document.getElementById('btn-save-device');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const editId = document.getElementById('device-edit-id').value;
            const serialNumber = document.getElementById('device-serial').value.trim();
            const assignedTeacherId = document.getElementById('device-teacher').value;

            if (editId) {
                updateDevice(editId, { serialNumber, assignedTeacherId });
            } else {
                addDevice({ serialNumber, assignedTeacherId });
            }

            playDoubleBeep();
            document.getElementById('device-modal').classList.add('hidden');
            renderDashboardPage('devices');
        });
    }
}

function attachReportListeners() {
    // Generate report buttons
    document.querySelectorAll('.btn-generate-report').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reportType = e.target.dataset.report;
            generateReport(reportType);
            playButtonClick();
        });
    });

    // Close report button
    const closeBtn = document.getElementById('btn-close-report');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('report-output').style.display = 'none';
            playButtonClick();
        });
    }

    // Export button
    const exportBtn = document.getElementById('btn-export-report');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                students: getAllStudents(),
                teachers: getAllTeachers(),
                classes: getAllClasses(),
                devices: getAllDevices(),
                attendance: getAttendanceRecords(),
                exportDate: new Date().toISOString()
            };
            downloadJSON(data, 'fbas_full_report.json');
            playButtonClick();
        });
    }
}

function generateReport(type) {
    const output = document.getElementById('report-output');
    const title = document.getElementById('report-title');
    const content = document.getElementById('report-content');

    const students = getAllStudents();
    const classes = getAllClasses();
    const records = getAttendanceRecords();

    let html = '';

    switch (type) {
        case 'summary':
            title.textContent = 'Attendance Summary Report';
            html = `
                <table class="data-table">
                    <thead>
                        <tr><th>Class</th><th>Students</th><th>Avg Attendance</th><th>Total Records</th></tr>
                    </thead>
                    <tbody>
                        ${classes.map(c => {
                const classStudents = students.filter(s => s.classId === c.id);
                const classRecords = records.filter(r => r.classId === c.id);
                const avg = classStudents.length > 0 ? Math.round((classRecords.length / (classStudents.length * 20)) * 100) : 0;
                return `<tr><td>${c.id}</td><td>${classStudents.length}</td><td>${Math.min(100, avg)}%</td><td>${classRecords.length}</td></tr>`;
            }).join('')}
                    </tbody>
                </table>
            `;
            break;
        case 'student':
            title.textContent = 'Student Attendance Report';
            html = `
                <table class="data-table">
                    <thead>
                        <tr><th>Student</th><th>Class</th><th>Records</th><th>Rate</th></tr>
                    </thead>
                    <tbody>
                        ${students.slice(0, 20).map(s => {
                const studentRecords = records.filter(r => r.studentId === s.id);
                const rate = Math.min(100, Math.round((studentRecords.length / 20) * 100));
                return `<tr><td>${s.name}</td><td>${s.classId}</td><td>${studentRecords.length}</td><td>${rate}%</td></tr>`;
            }).join('')}
                    </tbody>
                </table>
            `;
            break;
        case 'class':
            title.textContent = 'Class Report';
            html = classes.map(c => {
                const classStudents = students.filter(s => s.classId === c.id);
                return `
                    <div class="report-section">
                        <h4>${c.id} - ${c.name}</h4>
                        <p>Students: ${classStudents.length} | Schedule: ${c.schedule || 'N/A'} | Room: ${c.room || 'N/A'}</p>
                    </div>
                `;
            }).join('');
            break;
        case 'daily':
            title.textContent = 'Daily Attendance Log';
            const today = new Date().toISOString().split('T')[0];
            const todayRecords = records.filter(r => r.timestamp?.startsWith(today));
            html = `
                <p>Date: ${today} | Total Check-ins: ${todayRecords.length}</p>
                <table class="data-table">
                    <thead>
                        <tr><th>Time</th><th>Student</th><th>Class</th><th>Method</th></tr>
                    </thead>
                    <tbody>
                        ${todayRecords.map(r => {
                const time = new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return `<tr><td>${time}</td><td>${r.studentName || r.studentId}</td><td>${r.classId}</td><td>${r.method || 'fingerprint'}</td></tr>`;
            }).join('') || '<tr><td colspan="4">No records for today</td></tr>'}
                    </tbody>
                </table>
            `;
            break;
    }

    content.innerHTML = html;
    output.style.display = 'block';
}

function attachSettingsListeners() {
    // Save school info
    const saveSchoolBtn = document.getElementById('btn-save-school-info');
    if (saveSchoolBtn) {
        saveSchoolBtn.addEventListener('click', () => {
            const name = document.getElementById('setting-school-name').value;
            const code = document.getElementById('setting-school-code').value;
            updateSettings({ schoolName: name, schoolCode: code });
            playDoubleBeep();
            addActivityLog('info', 'School information updated');
        });
    }

    // Volume slider
    const volumeSlider = document.getElementById('setting-volume');
    const volumeDisplay = document.getElementById('volume-display');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            volumeDisplay.textContent = `${volumeSlider.value}%`;
        });
    }

    // Save sound settings
    const saveSoundBtn = document.getElementById('btn-save-sound-settings');
    if (saveSoundBtn) {
        saveSoundBtn.addEventListener('click', () => {
            const soundEnabled = document.getElementById('setting-sound-enabled').checked;
            const volume = document.getElementById('setting-volume').value / 100;
            updateSettings({ soundEnabled, volume });
            playDoubleBeep();
            addActivityLog('info', 'Sound settings updated');
        });
    }

    // Save attendance settings
    const saveAttendanceBtn = document.getElementById('btn-save-attendance-settings');
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener('click', () => {
            const failureRate = document.getElementById('setting-failure-rate').value / 100;
            updateSettings({ scanFailureRate: failureRate });
            playDoubleBeep();
            addActivityLog('info', 'Attendance settings updated');
        });
    }

    // Export data
    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                students: getAllStudents(),
                teachers: getAllTeachers(),
                classes: getAllClasses(),
                devices: getAllDevices(),
                attendance: getAttendanceRecords(),
                settings: getSettings(),
                activityLog: getActivityLog(),
                exportDate: new Date().toISOString()
            };
            downloadJSON(data, 'fbas_backup.json');
            playButtonClick();
            addActivityLog('success', 'Data exported successfully');
        });
    }

    // Import data
    const importBtn = document.getElementById('btn-import-data');
    const importInput = document.getElementById('import-file-input');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (data.students) initializeStudents(data.students);
                        if (data.teachers) initializeTeachers(data.teachers);
                        if (data.classes) initializeClasses(data.classes);
                        if (data.devices) initializeDevices(data.devices);
                        playDoubleBeep();
                        addActivityLog('success', 'Data imported successfully');
                        renderDashboardPage('settings');
                    } catch (err) {
                        alert('Invalid file format');
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    // Clear attendance
    const clearAttendanceBtn = document.getElementById('btn-clear-attendance');
    if (clearAttendanceBtn) {
        clearAttendanceBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all attendance records? This cannot be undone.')) {
                clearAttendanceRecords();
                playButtonClick();
                addActivityLog('warning', 'All attendance records cleared');
                renderDashboardPage('settings');
            }
        });
    }

    // Reset all data
    const resetAllBtn = document.getElementById('btn-reset-all');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset ALL data? This will restore default values and cannot be undone.')) {
                if (confirm('This is your last chance to cancel. Proceed with reset?')) {
                    resetAllData();
                    initializeStudents(STUDENTS);
                    initializeTeachers(TEACHERS);
                    initializeClasses(CLASSES);
                    initializeDevices(DEVICES);
                    playButtonClick();
                    addActivityLog('warning', 'All data reset to defaults');
                    renderDashboardPage('settings');
                }
            }
        });
    }
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function updateBatteryDisplay(level) {
    const batteryLevel = document.getElementById('battery-level');
    const batteryPercent = document.getElementById('battery-percent');

    if (batteryLevel && batteryPercent) {
        batteryLevel.style.width = `${level}%`;
        batteryPercent.textContent = `${level}%`;

        // Color based on level
        if (level > 50) {
            batteryLevel.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
        } else if (level > 20) {
            batteryLevel.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        } else {
            batteryLevel.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        }
    }
}

function loadScenario(id) {
    console.log('Loading scenario:', id);
    currentScenario = id;

    const studentPanel = document.getElementById('student-panel');
    const chargeBtn = document.getElementById('btn-charge');

    // Reset charge state
    chargeBtn.classList.remove('active');
    chargeBtn.textContent = '🔌 Charge';

    const classInfo = getClassById(currentClassId);
    const teacher = classInfo ? getTeacherById(classInfo.teacherId) : null;
    const students = getStudentsByClass(currentClassId);

    // Stop any existing charging animation
    if (chargingInterval) {
        clearInterval(chargingInterval);
        chargingInterval = null;
    }

    // Stop connection animation
    stopConnectionAnimation();

    // Hide USB cable
    usbCable.visible = false;

    // Reset visibility
    device.visible = true;
    computer.visible = false;

    // Show/hide fullscreen dashboard button
    const fullscreenBtn = document.getElementById('btn-fullscreen-dashboard');
    if (fullscreenBtn) {
        fullscreenBtn.style.display = (id === 5) ? 'block' : 'none';
    }

    // Exit fullscreen if switching away from dashboard
    if (id !== 5 && isDashboardFullscreen) {
        toggleDashboardFullscreen();
    }

    switch (id) {
        case 1: // Attendance
            studentPanel.style.display = 'block';
            attendedStudents.clear();
            populateStudentList(currentClassId);
            setLedState('IDLE');
            animateCameraTo('deviceOnly');
            // Set screen to Place Finger state
            setScreenState(SCREEN_STATES.PLACE_FINGER, {
                classInfo,
                teacher,
                students,
                presentCount: attendedStudents.size,
                totalCount: students.length,
                batteryLevel,
                isOnline: true
            });
            break;
        case 2: // Class Selection
            studentPanel.style.display = 'none';
            selectedClassIndex = 0;
            setLedState('IDLE');
            animateCameraTo('deviceOnly');
            setScreenState(SCREEN_STATES.CLASS_SELECT, {
                classes: CLASSES,
                selectedIndex: selectedClassIndex,
                batteryLevel,
                isOnline: true
            });
            break;
        case 3: // Charging
            studentPanel.style.display = 'none';
            setLedState('CHARGING');
            chargeBtn.classList.add('active');
            chargeBtn.textContent = '🔌 Charging...';
            playPlugConnect();
            animateCameraTo('deviceOnly');

            // Show USB cable with animation
            usbCable.visible = true;
            usbCable.position.z = -0.5; // Start behind
            const cableAnimStart = Date.now();
            function animateCableIn() {
                const elapsed = Date.now() - cableAnimStart;
                const t = Math.min(elapsed / 300, 1);
                usbCable.position.z = -0.5 + t * 0.5; // Move to 0
                if (t < 1) requestAnimationFrame(animateCableIn);
            }
            animateCableIn();

            // Start charging animation - increase battery every 500ms
            chargingInterval = setInterval(() => {
                if (batteryLevel < 100) {
                    batteryLevel += 1;
                    updateBatteryDisplay(batteryLevel);
                    setScreenState(SCREEN_STATES.CHARGING, {
                        batteryLevel,
                        isCharging: true
                    });
                } else {
                    // Fully charged
                    clearInterval(chargingInterval);
                    chargingInterval = null;
                    playDoubleBeep();
                }
            }, 500);

            setScreenState(SCREEN_STATES.CHARGING, {
                batteryLevel,
                isCharging: true
            });
            break;
        case 4: // Setup / Pairing
            studentPanel.style.display = 'none';
            computer.visible = true;
            setLedState('IDLE');
            animateCameraTo('dualView');

            // Start pairing sequence
            startPairingSequence();
            break;
        case 5: // Dashboard / Home
            studentPanel.style.display = 'none';
            device.visible = false;
            computer.visible = true;
            setLedState('OFF');
            animateCameraTo('computerOnly');

            // Show dashboard
            // Calculate real stats for the 3D monitor
            const allStudents = getAllStudents();
            const allDevices = getAllDevices();
            const allAttendance = getAttendanceRecords();

            const todayStr = new Date().toISOString().split('T')[0];
            const todayRecs = allAttendance.filter(r => r.timestamp?.startsWith(todayStr));
            const presentCount = new Set(todayRecs.map(r => r.studentId)).size;

            setComputerState(COMPUTER_STATES.DASHBOARD, {
                studentCount: allStudents.length,
                classCount: CLASSES.length,
                teacherCount: TEACHERS.length,
                presentToday: presentCount,
                absentToday: allStudents.length - presentCount,
                devicesOnline: allDevices.filter(d => d.isOnline).length
            });
            setComputerLedState(computer, 'on');
            break;
    }
}

// ============================================================================
// Pairing Sequence
// ============================================================================

let pairingStep = 0;
let pairingInterval = null;

function startPairingSequence() {
    pairingStep = 0;

    // Device shows pairing code
    setScreenState(SCREEN_STATES.PAIRING, {
        pairingCode: '7294',
        deviceId: 'FBAS-001',
        status: 'waiting'
    });

    // Computer starts searching
    setComputerState(COMPUTER_STATES.SEARCHING, {});
    setComputerLedState(computer, 'syncing');

    // Advance through pairing steps
    pairingInterval = setInterval(() => {
        pairingStep++;

        switch (pairingStep) {
            case 1: // Device found (after 2 seconds)
                setComputerState(COMPUTER_STATES.DEVICE_FOUND, {
                    deviceId: 'FBAS-001',
                    batteryLevel: batteryLevel
                });
                playDoubleBeep();
                break;

            case 2: // Enter code
                setComputerState(COMPUTER_STATES.ENTER_CODE, {
                    enteredCode: '____'
                });
                break;

            case 3: // Code entered
                setComputerState(COMPUTER_STATES.ENTER_CODE, {
                    enteredCode: '72__'
                });
                playButtonClick();
                break;

            case 4: // More code
                setComputerState(COMPUTER_STATES.ENTER_CODE, {
                    enteredCode: '7294'
                });
                playButtonClick();
                break;

            case 5: // Connecting
                setComputerState(COMPUTER_STATES.CONNECTING, {
                    progress: 0
                });
                setScreenState(SCREEN_STATES.PAIRING, {
                    pairingCode: '7294',
                    deviceId: 'FBAS-001',
                    status: 'connecting'
                });
                startConnectionAnimation();
                playSyncSound();
                break;

            case 6: // Syncing
                setComputerState(COMPUTER_STATES.SYNCING, {
                    studentCount: STUDENTS.length,
                    classCount: CLASSES.length,
                    teacherCount: TEACHERS.length
                });
                setScreenState(SCREEN_STATES.PAIRING, {
                    pairingCode: '7294',
                    deviceId: 'FBAS-001',
                    status: 'syncing'
                });
                break;

            case 7: // Complete
                stopConnectionAnimation();
                setComputerState(COMPUTER_STATES.SYNC_COMPLETE, {
                    deviceId: 'FBAS-001',
                    studentCount: STUDENTS.length,
                    classCount: CLASSES.length,
                    teacherCount: TEACHERS.length
                });
                setScreenState(SCREEN_STATES.PAIRING, {
                    pairingCode: '7294',
                    deviceId: 'FBAS-001',
                    status: 'complete'
                });
                setComputerLedState(computer, 'on');
                playDoubleBeep();

                // Stop the interval
                clearInterval(pairingInterval);
                pairingInterval = null;
                break;
        }
    }, 2000);
}

// ============================================================================
// Camera Animation
// ============================================================================

let cameraAnimating = false;
let cameraTargetPosition = null;
let cameraTargetLookAt = null;

function animateCameraTo(viewName) {
    const view = CAMERA_POSITIONS[viewName];
    if (!view) return;

    cameraTargetPosition = view.position.clone();
    cameraTargetLookAt = view.target.clone();
    cameraAnimating = true;
}

function updateCameraAnimation() {
    if (!cameraAnimating) return;

    const speed = 0.05;

    camera.position.lerp(cameraTargetPosition, speed);
    controls.target.lerp(cameraTargetLookAt, speed);

    // Check if close enough
    if (camera.position.distanceTo(cameraTargetPosition) < 0.01) {
        camera.position.copy(cameraTargetPosition);
        controls.target.copy(cameraTargetLookAt);
        cameraAnimating = false;
    }

    controls.update();
}

function populateStudentList(classId) {
    const students = getStudentsByClass(classId);
    const classInfo = getClassById(classId);
    const listContainer = document.getElementById('student-list');
    const classTitle = document.getElementById('class-title');
    const classInfoDiv = document.getElementById('class-info');
    const totalCount = document.getElementById('total-count');
    const presentCount = document.getElementById('present-count');

    currentClassId = classId;

    if (classInfo) {
        classTitle.textContent = classInfo.id;
        classInfoDiv.innerHTML = `
            <div>${classInfo.name}</div>
            <div class="class-meta">${classInfo.intake} • Year ${classInfo.year} Sem ${classInfo.semester}</div>
        `;
    }

    totalCount.textContent = students.length;
    presentCount.textContent = attendedStudents.size;

    listContainer.innerHTML = students.map(student => {
        const isPresent = attendedStudents.has(student.id);
        return `
            <div class="student-item ${isPresent ? 'present' : ''}" data-id="${student.id}">
                <span class="student-status">${isPresent ? '✓' : '○'}</span>
                <div class="student-info">
                    <span class="student-name">${student.name}</span>
                    <span class="student-reg">${student.regNo}</span>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers
    listContainer.querySelectorAll('.student-item').forEach(item => {
        item.addEventListener('click', () => {
            if (!item.classList.contains('present')) {
                const studentId = item.dataset.id;
                simulateFingerScan(studentId);
            }
        });
    });
}

function simulateFingerScan(studentId) {
    const student = getStudentById(studentId);
    if (!student || isScanning) return;

    isScanning = true;
    console.log('Scanning:', student.name);

    const classInfo = getClassById(student.classId);
    const teacher = classInfo ? getTeacherById(classInfo.teacherId) : null;
    const students = getStudentsByClass(student.classId);

    // Start finger animation
    startFingerScan(() => {
        // Called when finger reaches scanner (pressing phase)
        setLedState('SCANNING');
        playScanStart();

        // Set scanning screen state
        setScreenState(SCREEN_STATES.SCANNING, {
            studentName: student.name,
            batteryLevel,
            isOnline: true
        });
    });

    // Simulate scan processing
    setTimeout(() => {
        // 2% failure rate
        const success = Math.random() > 0.02;

        if (success) {
            // Success
            setLedState('SUCCESS');
            playDoubleBeep();

            attendedStudents.add(studentId);

            // Save to localStorage
            saveAttendanceRecord({
                studentId: student.id,
                studentName: student.name,
                classId: student.classId,
                method: 'fingerprint'
            });
            addActivityLog('success', `${student.name} marked present`);

            const item = document.querySelector(`.student-item[data-id="${studentId}"]`);
            if (item) {
                item.classList.add('present');
                item.querySelector('.student-status').textContent = '✓';
            }

            document.getElementById('present-count').textContent = attendedStudents.size;

            // Update device screen with success state
            setScreenState(SCREEN_STATES.SUCCESS, {
                student,
                classInfo,
                teacher,
                presentCount: attendedStudents.size,
                totalCount: students.length,
                batteryLevel,
                isOnline: true
            });

        } else {
            // Failure
            setLedState('ERROR');
            playErrorBuzz();

            // Show error on screen
            setScreenState(SCREEN_STATES.ERROR, {
                message: 'Fingerprint not recognized',
                batteryLevel,
                isOnline: true
            });
        }

        // Return to Place Finger after delay
        setTimeout(() => {
            setLedState('IDLE');
            isScanning = false;

            // Return to Place Finger state
            setScreenState(SCREEN_STATES.PLACE_FINGER, {
                classInfo,
                teacher,
                students,
                presentCount: attendedStudents.size,
                totalCount: students.length,
                batteryLevel,
                isOnline: true
            });
        }, 2000);

    }, 1200);
}

// ============================================================================
// Window Resize
// ============================================================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================================
// Initialize
// ============================================================================

function init() {
    document.addEventListener('click', () => {
        initAudio();
        resumeAudio();
    }, { once: true });

    createControlPanel();
    loadScenario(1);

    console.log('FBAS Simulation initialized');
    console.log(`Loaded: ${STUDENTS.length} students, ${CLASSES.length} classes, ${TEACHERS.length} teachers`);
}

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }

    // Don't trigger when dashboard is open (except ESC)
    if (isDashboardFullscreen && e.key !== 'Escape') {
        return;
    }

    switch (e.key) {
        // Scenario shortcuts (1-5)
        case '1':
            loadScenario(1);
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('btn-scenario-1').classList.add('active');
            break;
        case '2':
            loadScenario(2);
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('btn-scenario-2').classList.add('active');
            break;
        case '3':
            loadScenario(3);
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('btn-scenario-3').classList.add('active');
            break;
        case '4':
            loadScenario(4);
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('btn-scenario-4').classList.add('active');
            break;
        case '5':
            loadScenario(5);
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('btn-scenario-5').classList.add('active');
            break;

        // Power toggle (P)
        case 'p':
        case 'P':
            toggleDevicePower();
            break;

        // Charge toggle (C)
        case 'c':
        case 'C':
            document.getElementById('btn-charge').click();
            break;

        // Reset view (R)
        case 'r':
        case 'R':
            resetToFrontView();
            playButtonClick();
            break;

        // Pause controls (Space)
        case ' ':
            e.preventDefault();
            document.getElementById('btn-pause').click();
            break;

        // Dashboard fullscreen (D) - only in scenarios 4 or 5
        case 'd':
        case 'D':
            if (currentScenario === 4 || currentScenario === 5) {
                toggleDashboardFullscreen();
            }
            break;

        // Scan finger (S) - trigger scan in attendance mode
        case 's':
        case 'S':
            if (currentScenario === 1 && !isScanning) {
                triggerFingerprintScan();
            }
            break;

        // Arrow keys for pan
        case 'ArrowUp':
            e.preventDefault();
            panCamera('up');
            break;
        case 'ArrowDown':
            e.preventDefault();
            panCamera('down');
            break;
        case 'ArrowLeft':
            e.preventDefault();
            panCamera('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            panCamera('right');
            break;
    }
});

// Toggle device power on/off with animation
function toggleDevicePower() {
    if (isDevicePoweredOn) {
        // Power OFF sequence
        playPowerOff();
        setLedState('SCANNING'); // Brief red flash
        setTimeout(() => setLedState('OFF'), 500);
        turnOffScreen(); // This triggers shutdown animation
        addActivityLog('info', 'Device powered off');
        isDevicePoweredOn = false;
    } else {
        // Power ON sequence
        isDevicePoweredOn = true;
        playPowerOn();
        setLedState('SCANNING'); // Warm up LED
        turnOnScreen(); // This triggers boot animation

        // LED sequence during boot
        setTimeout(() => setLedState('WARNING'), 300);
        setTimeout(() => setLedState('SCANNING'), 600);
        setTimeout(() => setLedState('SUCCESS'), 1200);
        setTimeout(() => setLedState('IDLE'), 2500); // Match boot duration

        addActivityLog('info', 'Device powered on');
    }

    // Update power button in control panel
    const powerBtn = document.getElementById('btn-power');
    if (powerBtn) {
        powerBtn.classList.toggle('active', !isDevicePoweredOn);
        powerBtn.textContent = isDevicePoweredOn ? '⏻ Power' : '⏻ Power On';
    }
}

// ============================================================================
// Animation Loop
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = 0.016; // ~60fps

    // Update LED ring animation
    updateLedRing();

    // Update finger animation
    updateFingerAnimation(finger, deltaTime);

    // Update screen rendering (animations, transitions)
    updateDeviceScreen();
    updateComputerScreen();

    // Update connection particles
    updateConnectionParticles();

    // Update camera animation
    updateCameraAnimation();

    controls.update();
    renderer.render(scene, camera);
}

init();
animate();

// Debug exports
window.FBAS = {
    scene, camera, device, computer, finger, controls,
    setLedState, resetToFrontView, setScreenState, SCREEN_STATES,
    setComputerState, COMPUTER_STATES, startConnectionAnimation, stopConnectionAnimation
};
