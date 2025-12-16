// ============================================================================
// FBAS - Screen Renderer
// Handles all device screen states and animations
// ============================================================================

import * as THREE from 'three';
import { getClassById, getTeacherById, getStudentsByClass } from './data.js';

// Screen states
export const SCREEN_STATES = {
    OFF: 'off',
    BOOTING: 'booting',
    SHUTTING_DOWN: 'shutting_down',
    HOME: 'home',
    CLASS_SELECT: 'class_select',
    ATTENDANCE_READY: 'attendance_ready',
    PLACE_FINGER: 'place_finger',
    SCANNING: 'scanning',
    SUCCESS: 'success',
    ERROR: 'error',
    CHARGING: 'charging',
    PAIRING: 'pairing'
};

// Animation state
let animationFrame = 0;
let screenBrightness = 1.0;
let targetBrightness = 1.0;
let pulsePhase = 0;

// Boot/Shutdown animation state
let bootProgress = 0;
let shutdownProgress = 0;
let bootStartTime = 0;
let shutdownStartTime = 0;
const BOOT_DURATION = 2500; // 2.5 seconds
const SHUTDOWN_DURATION = 1500; // 1.5 seconds

// Current state
let currentState = SCREEN_STATES.HOME;
let stateData = {};

// Screen dimensions
const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 512;

// Colors
const COLORS = {
    background: '#ffffff',
    backgroundDim: '#1a1a1a',
    primary: '#3b82f6',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    text: '#1a1a1a',
    textLight: '#6b7280',
    textWhite: '#ffffff',
    accent: '#8b5cf6',
    scanning: '#06b6d4'
};

// ============================================================================
// Screen State Setters
// ============================================================================

export function setScreenState(state, data = {}) {
    currentState = state;
    stateData = data;
    pulsePhase = 0;
    
    // Adjust brightness based on state
    if (state === SCREEN_STATES.OFF) {
        targetBrightness = 0;
    } else {
        targetBrightness = 1.0;
    }
}

export function getScreenState() {
    return currentState;
}

// ============================================================================
// Main Render Function
// ============================================================================

export function renderScreen(ctx, canvas) {
    animationFrame++;
    pulsePhase += 0.05;
    
    // Smooth brightness transition
    screenBrightness += (targetBrightness - screenBrightness) * 0.1;
    
    // Clear with brightness-adjusted background
    const bgBrightness = Math.floor(screenBrightness * 255);
    ctx.fillStyle = `rgb(${bgBrightness}, ${bgBrightness}, ${bgBrightness})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (screenBrightness < 0.1) {
        return; // Screen is off
    }
    
    // Apply global alpha for fade effects
    ctx.globalAlpha = screenBrightness;
    
    switch (currentState) {
        case SCREEN_STATES.BOOTING:
            renderBootScreen(ctx);
            break;
        case SCREEN_STATES.SHUTTING_DOWN:
            renderShutdownScreen(ctx);
            break;
        case SCREEN_STATES.HOME:
            renderHomeScreen(ctx);
            break;
        case SCREEN_STATES.CLASS_SELECT:
            renderClassSelectScreen(ctx);
            break;
        case SCREEN_STATES.ATTENDANCE_READY:
            renderAttendanceReadyScreen(ctx);
            break;
        case SCREEN_STATES.PLACE_FINGER:
            renderPlaceFingerScreen(ctx);
            break;
        case SCREEN_STATES.SCANNING:
            renderScanningScreen(ctx);
            break;
        case SCREEN_STATES.SUCCESS:
            renderSuccessScreen(ctx);
            break;
        case SCREEN_STATES.ERROR:
            renderErrorScreen(ctx);
            break;
        case SCREEN_STATES.CHARGING:
            renderChargingScreen(ctx);
            break;
        case SCREEN_STATES.PAIRING:
            renderPairingScreen(ctx);
            break;
        default:
            renderHomeScreen(ctx);
    }
    
    ctx.globalAlpha = 1.0;
}

// ============================================================================
// Home Screen
// ============================================================================

function renderHomeScreen(ctx) {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1e3a5f');
    gradient.addColorStop(0.5, '#2d4a6f');
    gradient.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, 256, 80);
    
    // Date
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric'
    });
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(dateStr, 256, 110);
    
    // FBAS Logo/Title
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = COLORS.textWhite;
    ctx.fillText('FBAS', 256, 155);
    
    // Menu items (y=180, each 60px tall)
    const menuItems = [
        { icon: '📋', label: 'Start Attendance', desc: 'Begin a new session' },
        { icon: '📊', label: 'View Records', desc: 'Past attendance data' },
        { icon: '🔄', label: 'Sync Data', desc: 'Upload to server' },
        { icon: '⚙️', label: 'Settings', desc: 'Device configuration' }
    ];
    
    menuItems.forEach((item, i) => {
        const y = 180 + i * 60;
        const isHovered = Math.floor((animationFrame / 60) % 4) === i;
        
        // Menu item background
        ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)';
        roundRect(ctx, 30, y, 452, 52, 8);
        ctx.fill();
        
        // Icon
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.icon, 50, y + 35);
        
        // Label
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = COLORS.textWhite;
        ctx.fillText(item.label, 90, y + 28);
        
        // Description
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(item.desc, 90, y + 45);
        
        // Arrow
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.textAlign = 'right';
        ctx.fillText('›', 470, y + 35);
    });
    
    // Status bar at bottom
    renderStatusBar(ctx, true);
}

// ============================================================================
// Class Selection Screen
// ============================================================================

function renderClassSelectScreen(ctx) {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Header (0-100)
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 90);
    
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Select Class', 256, 55);
    
    // Classes list (100-400) - each ~50px tall
    const classes = stateData.classes || [];
    const selectedIndex = stateData.selectedIndex || 0;
    
    classes.slice(0, 6).forEach((cls, i) => {
        const y = 100 + i * 50;
        const isSelected = i === selectedIndex;
        
        // Row background
        ctx.fillStyle = isSelected ? '#dbeafe' : (i % 2 === 0 ? '#f9fafb' : '#ffffff');
        ctx.fillRect(0, y, CANVAS_WIDTH, 50);
        
        // Selection indicator
        if (isSelected) {
            ctx.fillStyle = COLORS.primary;
            ctx.fillRect(0, y, 5, 50);
        }
        
        ctx.fillStyle = isSelected ? COLORS.primary : COLORS.text;
        ctx.font = isSelected ? 'bold 16px Arial' : '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(cls.name, 20, y + 22);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = COLORS.textLight;
        ctx.fillText(`${cls.id} • Year ${cls.year} Sem ${cls.semester}`, 20, y + 40);
        
        // Student count
        ctx.textAlign = 'right';
        ctx.fillStyle = COLORS.textLight;
        ctx.font = '12px Arial';
        const studentCount = cls.studentIds ? cls.studentIds.length : 0;
        ctx.fillText(`${studentCount} students`, 492, y + 30);
    });
    
    // Bottom buttons area (420-480)
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 410, CANVAS_WIDTH, 102);
    
    // Start button (280-480)
    ctx.fillStyle = COLORS.success;
    roundRect(ctx, 280, 425, 200, 50, 8);
    ctx.fill();
    
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Start Attendance', 380, 458);
    
    // Back button (30-250)
    ctx.strokeStyle = COLORS.textLight;
    ctx.lineWidth = 2;
    roundRect(ctx, 30, 425, 200, 50, 8);
    ctx.stroke();
    
    ctx.fillStyle = COLORS.textLight;
    ctx.font = '18px Arial';
    ctx.fillText('← Back', 130, 458);
    
    renderStatusBar(ctx);
}

// ============================================================================
// Attendance Ready Screen
// ============================================================================

function renderAttendanceReadyScreen(ctx) {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const classInfo = stateData.classInfo;
    const teacher = stateData.teacher;
    
    // Header with class info
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 100);
    
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(classInfo?.name || 'Class', 256, 35);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`${classInfo?.id || ''} • Year ${classInfo?.year || ''} Sem ${classInfo?.semester || ''}`, 256, 58);
    ctx.fillText(teacher?.name || 'Teacher', 256, 80);
    
    // Session info
    ctx.fillStyle = COLORS.text;
    ctx.font = '16px Arial';
    const now = new Date();
    ctx.fillText(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), 256, 140);
    ctx.fillText(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 256, 165);
    
    // Ready button
    const pulse = 0.9 + Math.sin(pulsePhase * 2) * 0.1;
    ctx.fillStyle = COLORS.success;
    ctx.beginPath();
    ctx.arc(256, 300, 80 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 20px Arial';
    ctx.fillText('START', 256, 295);
    ctx.font = '14px Arial';
    ctx.fillText('ATTENDANCE', 256, 315);
    
    // Student count
    const students = stateData.students || [];
    ctx.fillStyle = COLORS.textLight;
    ctx.font = '14px Arial';
    ctx.fillText(`${students.length} students enrolled`, 256, 420);
    
    renderStatusBar(ctx);
}

// ============================================================================
// Place Finger Screen
// ============================================================================

function renderPlaceFingerScreen(ctx) {
    // Gradient background - blue theme
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e3a5f');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Class info at top
    const classInfo = stateData.classInfo;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(classInfo?.name || 'Attendance Mode', 256, 40);
    
    // Attendance count
    const present = stateData.presentCount || 0;
    const total = stateData.totalCount || 0;
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${present} / ${total}`, 256, 80);
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('PRESENT', 256, 100);
    
    // Fingerprint icon with pulse animation
    const pulse = 1 + Math.sin(pulsePhase * 1.5) * 0.08;
    const glowIntensity = 0.3 + Math.sin(pulsePhase * 1.5) * 0.2;
    
    // Outer glow
    ctx.beginPath();
    ctx.arc(256, 260, 100 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(59, 130, 246, ${glowIntensity})`;
    ctx.fill();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(256, 260, 70, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.fill();
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Fingerprint symbol
    ctx.font = '60px Arial';
    ctx.fillStyle = COLORS.textWhite;
    ctx.fillText('👆', 256, 280);
    
    // Main instruction
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = COLORS.textWhite;
    ctx.fillText('Place Finger', 256, 390);
    
    // Sub instruction with animation
    ctx.font = '16px Arial';
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(pulsePhase * 2) * 0.3})`;
    ctx.fillText('on the sensor below', 256, 420);
    
    renderStatusBar(ctx, true);
}

// ============================================================================
// Scanning Screen
// ============================================================================

function renderScanningScreen(ctx) {
    // Dark blue scanning background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#042f4a');
    gradient.addColorStop(0.5, '#0c4a6e');
    gradient.addColorStop(1, '#042f4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Scanning animation - rotating arcs
    ctx.save();
    ctx.translate(256, 240);
    
    for (let i = 0; i < 3; i++) {
        const rotation = (animationFrame * 0.03) + (i * Math.PI * 2 / 3);
        const radius = 80 + i * 20;
        const alpha = 0.7 - i * 0.2;
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, rotation, rotation + Math.PI * 0.5);
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    // Center scanning icon
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.fill();
    
    ctx.restore();
    
    // Fingerprint icon
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.scanning;
    ctx.fillText('👆', 256, 255);
    
    // Scanning text
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = COLORS.textWhite;
    ctx.fillText('Scanning...', 256, 380);
    
    // Animated dots
    const dots = '.'.repeat((Math.floor(animationFrame / 15) % 4));
    ctx.font = '28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(dots, 370, 380);
    ctx.textAlign = 'center';
    
    // Progress bar
    const progress = (animationFrame % 60) / 60;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, 100, 420, 312, 8, 4);
    ctx.fill();
    
    ctx.fillStyle = COLORS.scanning;
    roundRect(ctx, 100, 420, 312 * progress, 8, 4);
    ctx.fill();
    
    renderStatusBar(ctx, true);
}

// ============================================================================
// Success Screen
// ============================================================================

function renderSuccessScreen(ctx) {
    const student = stateData.student;
    const classInfo = stateData.classInfo;
    const teacher = stateData.teacher;
    
    // Green gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#064e3b');
    gradient.addColorStop(0.3, '#047857');
    gradient.addColorStop(0.7, '#047857');
    gradient.addColorStop(1, '#064e3b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Header info
    const now = new Date();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
    ctx.fillText(`${dateStr} | ${timeStr} | ${teacher?.name?.toUpperCase() || 'TEACHER'}`, 256, 30);
    
    // Class name
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 20px Arial';
    ctx.fillText(classInfo?.name || 'Course', 256, 65);
    
    // Department
    ctx.font = 'italic 14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(classInfo?.department || '', 256, 90);
    ctx.fillText(classInfo?.intake || '', 256, 110);
    
    // Year/Semester
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`Year ${classInfo?.year || ''} Semester ${classInfo?.semester || ''}`, 256, 130);
    
    // Success checkmark with animation
    const scale = 1 + Math.sin(pulsePhase * 3) * 0.05;
    ctx.save();
    ctx.translate(256, 200);
    ctx.scale(scale, scale);
    
    // Circle background
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    ctx.strokeStyle = COLORS.textWhite;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Checkmark
    ctx.font = 'bold 50px Arial';
    ctx.fillStyle = COLORS.textWhite;
    ctx.textAlign = 'center';
    ctx.fillText('✓', 0, 18);
    ctx.restore();
    
    // Student info
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 22px Arial';
    ctx.fillText(student?.regNo || 'REG-000', 256, 290);
    
    ctx.font = '20px Arial';
    ctx.fillText(student?.name || 'Student Name', 256, 320);
    
    // SUCCESS label
    ctx.font = 'bold 36px Arial';
    const successGlow = 0.8 + Math.sin(pulsePhase * 4) * 0.2;
    ctx.fillStyle = `rgba(255, 255, 255, ${successGlow})`;
    ctx.fillText('SUCCESS', 256, 380);
    
    // Attendance count
    const present = stateData.presentCount || 0;
    const total = stateData.totalCount || 0;
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`Attendance: ${present}/${total}`, 256, 420);
    
    renderStatusBar(ctx, true);
}

// ============================================================================
// Error Screen
// ============================================================================

function renderErrorScreen(ctx) {
    // Red gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#450a0a');
    gradient.addColorStop(0.3, '#7f1d1d');
    gradient.addColorStop(0.7, '#7f1d1d');
    gradient.addColorStop(1, '#450a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Error icon with shake animation
    const shake = Math.sin(animationFrame * 0.5) * 3;
    
    ctx.save();
    ctx.translate(256 + shake, 200);
    
    // X circle
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // X mark
    ctx.font = 'bold 70px Arial';
    ctx.fillStyle = '#fca5a5';
    ctx.textAlign = 'center';
    ctx.fillText('✗', 0, 25);
    
    ctx.restore();
    
    // Error messages
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText('SCAN FAILED', 256, 310);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Fingerprint not recognized', 256, 350);
    
    // Retry hint
    ctx.font = '16px Arial';
    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(pulsePhase * 2) * 0.3})`;
    ctx.fillText('Please try again', 256, 400);
    
    renderStatusBar(ctx, true);
}

// ============================================================================
// Charging Screen
// ============================================================================

function renderChargingScreen(ctx) {
    // Dark background
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const batteryLevel = stateData.batteryLevel || 85;
    
    // Large battery icon
    ctx.save();
    ctx.translate(256, 220);
    
    // Battery body
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 4;
    roundRect(ctx, -60, -40, 120, 80, 10);
    ctx.stroke();
    
    // Battery tip
    ctx.fillStyle = '#4ade80';
    roundRect(ctx, 60, -15, 10, 30, 3);
    ctx.fill();
    
    // Battery level fill
    const fillWidth = (110 * batteryLevel / 100);
    const gradient = ctx.createLinearGradient(-55, 0, -55 + fillWidth, 0);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(1, '#4ade80');
    ctx.fillStyle = gradient;
    roundRect(ctx, -55, -35, fillWidth, 70, 6);
    ctx.fill();
    
    // Lightning bolt animation
    const boltAlpha = 0.5 + Math.sin(pulsePhase * 3) * 0.5;
    ctx.font = '40px Arial';
    ctx.fillStyle = `rgba(255, 255, 255, ${boltAlpha})`;
    ctx.textAlign = 'center';
    ctx.fillText('⚡', 0, 15);
    
    ctx.restore();
    
    // Percentage
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#4ade80';
    ctx.textAlign = 'center';
    ctx.fillText(`${batteryLevel}%`, 256, 350);
    
    // Charging text
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Charging...', 256, 390);
    
    // Time to full (estimate)
    if (batteryLevel < 100) {
        const minutesToFull = Math.ceil((100 - batteryLevel) * 1.2);
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(`~${minutesToFull} min to full`, 256, 420);
    }
}

// ============================================================================
// Pairing Screen
// ============================================================================

function renderPairingScreen(ctx) {
    // Dark purple gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1e1b4b');
    gradient.addColorStop(0.5, '#312e81');
    gradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const status = stateData.status || 'waiting';
    
    // Pairing icon with waves
    ctx.save();
    ctx.translate(256, 160);
    
    if (status === 'waiting' || status === 'connecting') {
        // Animated waves
        for (let i = 0; i < 3; i++) {
            const radius = 40 + i * 30 + (animationFrame % 60);
            const alpha = Math.max(0, 0.5 - i * 0.15 - (animationFrame % 60) / 120);
            
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    // Icon based on status
    ctx.font = '50px Arial';
    ctx.fillStyle = COLORS.textWhite;
    ctx.textAlign = 'center';
    
    if (status === 'complete') {
        ctx.fillText('✅', 0, 18);
    } else if (status === 'syncing') {
        ctx.fillText('🔄', 0, 18);
    } else {
        ctx.fillText('📱', 0, 18);
    }
    
    ctx.restore();
    
    // Content based on status
    if (status === 'waiting') {
        // Pairing code
        const code = stateData.pairingCode || '4829';
        ctx.font = 'bold 56px monospace';
        ctx.fillStyle = COLORS.textWhite;
        ctx.textAlign = 'center';
        ctx.fillText(code, 256, 290);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('Enter this code on your computer', 256, 340);
        
        const dots = '.'.repeat((Math.floor(animationFrame / 20) % 4));
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(`Waiting for connection${dots}`, 256, 380);
        
    } else if (status === 'connecting') {
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#a78bfa';
        ctx.textAlign = 'center';
        ctx.fillText('Connecting...', 256, 280);
        
        // Progress dots
        const dotCount = 5;
        for (let i = 0; i < dotCount; i++) {
            const active = Math.floor(animationFrame / 15) % dotCount === i;
            ctx.beginPath();
            ctx.arc(180 + i * 38, 330, active ? 10 : 6, 0, Math.PI * 2);
            ctx.fillStyle = active ? '#a78bfa' : 'rgba(167, 139, 250, 0.3)';
            ctx.fill();
        }
        
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Establishing secure connection', 256, 390);
        
    } else if (status === 'syncing') {
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#60a5fa';
        ctx.textAlign = 'center';
        ctx.fillText('Syncing Data...', 256, 280);
        
        // Sync progress bar
        const progress = (animationFrame % 150) / 150;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        roundRect(ctx, 100, 310, 312, 20, 10);
        ctx.fill();
        
        ctx.fillStyle = '#60a5fa';
        roundRect(ctx, 100, 310, 312 * progress, 20, 10);
        ctx.fill();
        
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Downloading student data', 256, 370);
        
    } else if (status === 'complete') {
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#4ade80';
        ctx.textAlign = 'center';
        ctx.fillText('Paired Successfully!', 256, 280);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`Device: ${stateData.deviceId || 'FBAS-001'}`, 256, 330);
        ctx.fillText('Ready to use', 256, 360);
    }
    
    renderStatusBar(ctx, true);
}

// ============================================================================
// Status Bar (bottom of screen)
// ============================================================================

function renderStatusBar(ctx, dark = false) {
    const y = CANVAS_HEIGHT - 30;
    const textColor = dark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
    
    ctx.font = '12px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    
    // Time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    ctx.fillText(timeStr, 20, y);
    
    // Battery
    ctx.textAlign = 'right';
    const battery = stateData.batteryLevel || 85;
    ctx.fillText(`🔋 ${battery}%`, CANVAS_WIDTH - 20, y);
    
    // Connection status
    ctx.textAlign = 'center';
    const online = stateData.isOnline !== false;
    ctx.fillText(online ? '📶 Online' : '📵 Offline', 256, y);
}

// ============================================================================
// Utility: Rounded Rectangle
// ============================================================================

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// ============================================================================
// Screen Transition Effects
// ============================================================================

export function dimScreen() {
    targetBrightness = 0.3;
}

export function brightenScreen() {
    targetBrightness = 1.0;
}

export function turnOffScreen() {
    // Start shutdown animation
    startShutdownSequence();
}

export function turnOnScreen() {
    // Start boot animation
    startBootSequence();
}

// Start boot sequence animation
export function startBootSequence() {
    bootProgress = 0;
    bootStartTime = Date.now();
    targetBrightness = 1.0;
    currentState = SCREEN_STATES.BOOTING;
}

// Start shutdown sequence animation
export function startShutdownSequence() {
    shutdownProgress = 0;
    shutdownStartTime = Date.now();
    currentState = SCREEN_STATES.SHUTTING_DOWN;
}

// ============================================================================
// Boot Screen
// ============================================================================

function renderBootScreen(ctx) {
    const elapsed = Date.now() - bootStartTime;
    bootProgress = Math.min(1, elapsed / BOOT_DURATION);
    
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Phase 1: Screen flicker on (0-10%)
    if (bootProgress < 0.1) {
        const flicker = Math.random() > 0.5 ? 0.3 : 0;
        ctx.fillStyle = `rgba(30, 58, 95, ${flicker})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        return;
    }
    
    // Phase 2: Logo fade in (10-30%)
    if (bootProgress < 0.3) {
        const logoAlpha = (bootProgress - 0.1) / 0.2;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(256, 200, 0, 256, 200, 150);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${logoAlpha * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // FBAS Logo
        ctx.font = 'bold 72px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${logoAlpha})`;
        ctx.textAlign = 'center';
        ctx.fillText('FBAS', 256, 220);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${logoAlpha * 0.7})`;
        ctx.fillText('Fingerprint-Based Attendance System', 256, 260);
        return;
    }
    
    // Phase 3: Loading animation (30-90%)
    if (bootProgress < 0.9) {
        const loadProgress = (bootProgress - 0.3) / 0.6;
        
        // Background glow
        const gradient = ctx.createRadialGradient(256, 200, 0, 256, 200, 200);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // FBAS Logo (fully visible)
        ctx.font = 'bold 72px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('FBAS', 256, 180);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('Fingerprint-Based Attendance System', 256, 220);
        
        // Loading bar background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, 100, 300, 312, 12, 6);
        ctx.fill();
        
        // Loading bar progress
        const barWidth = 312 * loadProgress;
        const barGradient = ctx.createLinearGradient(100, 0, 412, 0);
        barGradient.addColorStop(0, '#3b82f6');
        barGradient.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = barGradient;
        roundRect(ctx, 100, 300, barWidth, 12, 6);
        ctx.fill();
        
        // Loading percentage
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`${Math.floor(loadProgress * 100)}%`, 256, 340);
        
        // Boot messages
        const messages = [
            'Initializing system...',
            'Loading fingerprint database...',
            'Connecting to server...',
            'Calibrating sensor...',
            'Starting services...'
        ];
        const msgIndex = Math.min(Math.floor(loadProgress * messages.length), messages.length - 1);
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(messages[msgIndex], 256, 380);
        
        // Spinning indicator
        ctx.save();
        ctx.translate(256, 420);
        ctx.rotate(animationFrame * 0.1);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const alpha = 0.2 + (i / 8) * 0.6;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 15, Math.sin(angle) * 15, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.fill();
        }
        ctx.restore();
        return;
    }
    
    // Phase 4: Transition to home (90-100%)
    const fadeProgress = (bootProgress - 0.9) / 0.1;
    
    // Flash white effect
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(fadeProgress * Math.PI) * 0.3})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Complete boot - transition to home
    if (bootProgress >= 1) {
        currentState = SCREEN_STATES.HOME;
        screenBrightness = 1.0;
    }
}

// ============================================================================
// Shutdown Screen
// ============================================================================

function renderShutdownScreen(ctx) {
    const elapsed = Date.now() - shutdownStartTime;
    shutdownProgress = Math.min(1, elapsed / SHUTDOWN_DURATION);
    
    // Phase 1: Show shutdown message (0-40%)
    if (shutdownProgress < 0.4) {
        // Dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        const alpha = 1 - (shutdownProgress / 0.4) * 0.3;
        
        // Shutdown icon
        ctx.font = '60px Arial';
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText('⏻', 256, 200);
        
        // Shutdown text
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText('Shutting down...', 256, 280);
        
        // Spinning dots
        ctx.save();
        ctx.translate(256, 340);
        ctx.rotate(-animationFrame * 0.15);
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const dotAlpha = alpha * (0.3 + (i / 6) * 0.7);
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 20, Math.sin(angle) * 20, 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239, 68, 68, ${dotAlpha})`;
            ctx.fill();
        }
        ctx.restore();
        return;
    }
    
    // Phase 2: Screen shrink effect (40-70%)
    if (shutdownProgress < 0.7) {
        const shrinkProgress = (shutdownProgress - 0.4) / 0.3;
        
        // Black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Shrinking white line (CRT effect)
        const lineHeight = CANVAS_HEIGHT * (1 - shrinkProgress);
        const lineY = (CANVAS_HEIGHT - lineHeight) / 2;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - shrinkProgress * 0.5})`;
        ctx.fillRect(0, lineY, CANVAS_WIDTH, lineHeight);
        return;
    }
    
    // Phase 3: Final dot fade (70-100%)
    const fadeProgress = (shutdownProgress - 0.7) / 0.3;
    
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Center dot shrinking
    const dotSize = 20 * (1 - fadeProgress);
    const dotAlpha = 1 - fadeProgress;
    
    if (dotSize > 0.5) {
        ctx.beginPath();
        ctx.arc(256, 256, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${dotAlpha})`;
        ctx.fill();
    }
    
    // Complete shutdown
    if (shutdownProgress >= 1) {
        currentState = SCREEN_STATES.OFF;
        targetBrightness = 0;
        screenBrightness = 0;
    }
}
