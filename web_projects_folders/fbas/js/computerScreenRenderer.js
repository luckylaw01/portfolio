// ============================================================================
// FBAS - Computer Screen Renderer
// Handles all computer monitor screen states and animations
// ============================================================================

// Screen states for computer
export const COMPUTER_STATES = {
    OFF: 'off',
    DESKTOP: 'desktop',
    SEARCHING: 'searching',
    DEVICE_FOUND: 'device_found',
    ENTER_CODE: 'enter_code',
    CONNECTING: 'connecting',
    SYNCING: 'syncing',
    SYNC_COMPLETE: 'sync_complete',
    DASHBOARD: 'dashboard'
};

// Animation state
let animationFrame = 0;
let pulsePhase = 0;

// Current state
let currentState = COMPUTER_STATES.OFF;
let stateData = {};

// Screen dimensions
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 640;

// Colors
const COLORS = {
    background: '#1a1a2e',
    backgroundLight: '#16213e',
    primary: '#3b82f6',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    text: '#ffffff',
    textDim: '#94a3b8',
    accent: '#8b5cf6',
    cardBg: '#0f3460'
};

// ============================================================================
// Screen State Setters
// ============================================================================

export function setComputerState(state, data = {}) {
    currentState = state;
    stateData = data;
    pulsePhase = 0;
}

export function getComputerState() {
    return currentState;
}

// ============================================================================
// Main Render Function
// ============================================================================

export function renderComputerScreen(ctx, canvas) {
    animationFrame++;
    pulsePhase += 0.05;
    
    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (currentState === COMPUTER_STATES.OFF) {
        return; // Screen is off
    }
    
    switch (currentState) {
        case COMPUTER_STATES.DESKTOP:
            renderDesktop(ctx);
            break;
        case COMPUTER_STATES.SEARCHING:
            renderSearching(ctx);
            break;
        case COMPUTER_STATES.DEVICE_FOUND:
            renderDeviceFound(ctx);
            break;
        case COMPUTER_STATES.ENTER_CODE:
            renderEnterCode(ctx);
            break;
        case COMPUTER_STATES.CONNECTING:
            renderConnecting(ctx);
            break;
        case COMPUTER_STATES.SYNCING:
            renderSyncing(ctx);
            break;
        case COMPUTER_STATES.SYNC_COMPLETE:
            renderSyncComplete(ctx);
            break;
        case COMPUTER_STATES.DASHBOARD:
            renderDashboard(ctx);
            break;
        default:
            renderDesktop(ctx);
    }
}

// ============================================================================
// Desktop Screen
// ============================================================================

function renderDesktop(ctx) {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Window title bar
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(50, 50, CANVAS_WIDTH - 100, 40);
    
    // Window title
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('FBAS Manager - Device Setup', 70, 78);
    
    // Window close/minimize buttons
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 80, 70, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 105, 70, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 130, 70, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Window content area
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(50, 90, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 150);
    
    // Welcome text
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome to FBAS Manager', CANVAS_WIDTH / 2, 180);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText('Fingerprint-Based Attendance System', CANVAS_WIDTH / 2, 220);
    
    // Setup button
    const btnWidth = 280;
    const btnHeight = 60;
    const btnX = (CANVAS_WIDTH - btnWidth) / 2;
    const btnY = 300;
    
    ctx.fillStyle = COLORS.primary;
    roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 10);
    ctx.fill();
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 20px Arial';
    ctx.fillText('🔗 Pair New Device', CANVAS_WIDTH / 2, btnY + 38);
    
    // Version info
    ctx.font = '14px Arial';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText('Version 1.0.0 | Nairobi Technical University', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
}

// ============================================================================
// Searching for Devices
// ============================================================================

function renderSearching(ctx) {
    renderWindowFrame(ctx, 'FBAS Manager - Searching...');
    
    // Searching animation
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Searching for FBAS Devices...', CANVAS_WIDTH / 2, 200);
    
    // Animated radar circles
    const centerX = CANVAS_WIDTH / 2;
    const centerY = 350;
    
    for (let i = 0; i < 3; i++) {
        const radius = 50 + ((animationFrame * 2 + i * 60) % 180);
        const opacity = 1 - (radius - 50) / 180;
        
        ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Center dot
    ctx.fillStyle = COLORS.primary;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Scanning text
    const dots = '.'.repeat((Math.floor(animationFrame / 20) % 4));
    ctx.font = '18px Arial';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText(`Scanning${dots}`, CANVAS_WIDTH / 2, 500);
}

// ============================================================================
// Device Found
// ============================================================================

function renderDeviceFound(ctx) {
    renderWindowFrame(ctx, 'FBAS Manager - Device Found');
    
    ctx.fillStyle = COLORS.success;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✓ Device Found!', CANVAS_WIDTH / 2, 180);
    
    // Device info card
    ctx.fillStyle = COLORS.cardBg;
    roundRect(ctx, 200, 220, CANVAS_WIDTH - 400, 180, 15);
    ctx.fill();
    
    // Device icon
    ctx.font = '60px Arial';
    ctx.fillText('📱', 280, 320);
    
    // Device details
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(stateData.deviceId || 'FBAS-001', 370, 280);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText('Fingerprint Attendance Device', 370, 310);
    ctx.fillText(`Signal: Strong | Battery: ${stateData.batteryLevel || 85}%`, 370, 340);
    ctx.fillText('Status: Ready to pair', 370, 370);
    
    // Pair button
    ctx.fillStyle = COLORS.primary;
    roundRect(ctx, (CANVAS_WIDTH - 200) / 2, 430, 200, 50, 8);
    ctx.fill();
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pair Device', CANVAS_WIDTH / 2, 462);
}

// ============================================================================
// Enter Pairing Code
// ============================================================================

function renderEnterCode(ctx) {
    renderWindowFrame(ctx, 'FBAS Manager - Enter Pairing Code');
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Enter the code shown on the device', CANVAS_WIDTH / 2, 180);
    
    // Code input boxes
    const code = stateData.enteredCode || '____';
    const boxSize = 70;
    const gap = 20;
    const totalWidth = boxSize * 4 + gap * 3;
    const startX = (CANVAS_WIDTH - totalWidth) / 2;
    
    for (let i = 0; i < 4; i++) {
        const x = startX + i * (boxSize + gap);
        const char = code[i] || '_';
        const isActive = i === code.replace(/_/g, '').length;
        
        ctx.fillStyle = isActive ? '#1e3a5f' : COLORS.cardBg;
        ctx.strokeStyle = isActive ? COLORS.primary : '#334155';
        ctx.lineWidth = 3;
        roundRect(ctx, x, 230, boxSize, boxSize, 10);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 36px Arial';
        ctx.fillText(char === '_' ? '' : char, x + boxSize / 2, 280);
    }
    
    // Animated cursor
    if (Math.floor(animationFrame / 30) % 2 === 0) {
        const cursorIndex = Math.min(code.replace(/_/g, '').length, 3);
        const cursorX = startX + cursorIndex * (boxSize + gap) + boxSize / 2;
        ctx.fillStyle = COLORS.primary;
        ctx.fillRect(cursorX - 2, 250, 4, 40);
    }
    
    // Virtual keyboard (simplified)
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const keySize = 60;
    const keyGap = 15;
    const keyStartX = (CANVAS_WIDTH - (keySize * 5 + keyGap * 4)) / 2;
    
    keys.forEach((key, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const x = keyStartX + col * (keySize + keyGap);
        const y = 350 + row * (keySize + keyGap);
        
        ctx.fillStyle = '#334155';
        roundRect(ctx, x, y, keySize, keySize, 8);
        ctx.fill();
        
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 24px Arial';
        ctx.fillText(key, x + keySize / 2, y + keySize / 2 + 8);
    });
    
    // Submit button
    ctx.fillStyle = code.includes('_') ? '#334155' : COLORS.success;
    roundRect(ctx, (CANVAS_WIDTH - 200) / 2, 520, 200, 50, 8);
    ctx.fill();
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Verify Code', CANVAS_WIDTH / 2, 552);
}

// ============================================================================
// Connecting Animation
// ============================================================================

function renderConnecting(ctx) {
    renderWindowFrame(ctx, 'FBAS Manager - Connecting');
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Establishing Secure Connection...', CANVAS_WIDTH / 2, 180);
    
    // Connection animation - two devices with data flowing between
    const leftX = 250;
    const rightX = CANVAS_WIDTH - 250;
    const centerY = 330;
    
    // Computer icon
    ctx.font = '80px Arial';
    ctx.fillText('🖥️', leftX, centerY + 30);
    
    // Device icon
    ctx.fillText('📱', rightX, centerY + 30);
    
    // Animated connection dots
    const numDots = 5;
    for (let i = 0; i < numDots; i++) {
        const progress = ((animationFrame * 3 + i * 50) % 300) / 300;
        const x = leftX + 80 + (rightX - leftX - 160) * progress;
        const y = centerY + Math.sin(progress * Math.PI * 2) * 10;
        const opacity = Math.sin(progress * Math.PI);
        
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Progress bar
    const barWidth = 400;
    const barHeight = 20;
    const barX = (CANVAS_WIDTH - barWidth) / 2;
    const barY = 450;
    const progress = stateData.progress || ((animationFrame % 200) / 200);
    
    ctx.fillStyle = '#334155';
    roundRect(ctx, barX, barY, barWidth, barHeight, 10);
    ctx.fill();
    
    ctx.fillStyle = COLORS.primary;
    roundRect(ctx, barX, barY, barWidth * progress, barHeight, 10);
    ctx.fill();
    
    ctx.font = '16px Arial';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText(`${Math.floor(progress * 100)}%`, CANVAS_WIDTH / 2, barY + 50);
}

// ============================================================================
// Syncing Data
// ============================================================================

function renderSyncing(ctx) {
    renderWindowFrame(ctx, 'FBAS Manager - Syncing Data');
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Syncing School Data...', CANVAS_WIDTH / 2, 160);
    
    // Data items being synced
    const items = [
        { icon: '👥', label: 'Students', count: stateData.studentCount || 47, done: true },
        { icon: '📚', label: 'Classes', count: stateData.classCount || 6, done: true },
        { icon: '👨‍🏫', label: 'Teachers', count: stateData.teacherCount || 3, done: true },
        { icon: '⚙️', label: 'Settings', count: 1, done: animationFrame > 100 }
    ];
    
    items.forEach((item, i) => {
        const y = 210 + i * 70;
        
        ctx.fillStyle = COLORS.cardBg;
        roundRect(ctx, 200, y, CANVAS_WIDTH - 400, 55, 8);
        ctx.fill();
        
        ctx.font = '30px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.icon, 230, y + 40);
        
        ctx.font = '18px Arial';
        ctx.fillStyle = COLORS.text;
        ctx.fillText(`${item.label} (${item.count})`, 290, y + 35);
        
        ctx.textAlign = 'right';
        if (item.done) {
            ctx.fillStyle = COLORS.success;
            ctx.fillText('✓ Synced', CANVAS_WIDTH - 230, y + 35);
        } else {
            ctx.fillStyle = COLORS.primary;
            const dots = '.'.repeat((Math.floor(animationFrame / 15) % 4));
            ctx.fillText(`Syncing${dots}`, CANVAS_WIDTH - 230, y + 35);
        }
    });
    
    // Overall progress
    const progress = Math.min(1, animationFrame / 150);
    const barWidth = 400;
    const barX = (CANVAS_WIDTH - barWidth) / 2;
    const barY = 520;
    
    ctx.fillStyle = '#334155';
    roundRect(ctx, barX, barY, barWidth, 15, 8);
    ctx.fill();
    
    ctx.fillStyle = COLORS.success;
    roundRect(ctx, barX, barY, barWidth * progress, 15, 8);
    ctx.fill();
}

// ============================================================================
// Sync Complete
// ============================================================================

function renderSyncComplete(ctx) {
    renderWindowFrame(ctx, 'FBAS Manager - Setup Complete');
    
    // Success checkmark with animation
    const scale = 1 + Math.sin(pulsePhase) * 0.05;
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 250);
    ctx.scale(scale, scale);
    
    ctx.fillStyle = COLORS.success;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✓', 0, 22);
    ctx.restore();
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Device Paired Successfully!', CANVAS_WIDTH / 2, 370);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText(`${stateData.deviceId || 'FBAS-001'} is now connected and ready to use`, CANVAS_WIDTH / 2, 410);
    
    // Summary
    ctx.fillStyle = COLORS.cardBg;
    roundRect(ctx, 250, 440, CANVAS_WIDTH - 500, 80, 10);
    ctx.fill();
    
    ctx.font = '16px Arial';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(`📊 ${stateData.studentCount || 47} Students | 📚 ${stateData.classCount || 6} Classes | 👨‍🏫 ${stateData.teacherCount || 3} Teachers`, CANVAS_WIDTH / 2, 490);
    
    // Continue button
    ctx.fillStyle = COLORS.primary;
    roundRect(ctx, (CANVAS_WIDTH - 200) / 2, 550, 200, 50, 8);
    ctx.fill();
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Go to Dashboard', CANVAS_WIDTH / 2, 582);
}

// ============================================================================
// Dashboard
// ============================================================================

function renderDashboard(ctx) {
    // Dark theme dashboard
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Sidebar
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 220, CANVAS_HEIGHT);
    
    // Sidebar logo
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('📊 FBAS', 20, 45);
    
    ctx.font = '12px Arial';
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText('Attendance Manager', 20, 65);
    
    // Sidebar menu
    const menuItems = [
        { icon: '🏠', label: 'Dashboard', active: true },
        { icon: '📋', label: 'Attendance', active: false },
        { icon: '👥', label: 'Students', active: false },
        { icon: '👨‍🏫', label: 'Teachers', active: false },
        { icon: '📱', label: 'Devices', active: false },
        { icon: '📈', label: 'Reports', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
    ];
    
    menuItems.forEach((item, i) => {
        const y = 100 + i * 50;
        
        if (item.active) {
            ctx.fillStyle = COLORS.primary + '30';
            ctx.fillRect(0, y - 5, 220, 40);
            ctx.fillStyle = COLORS.primary;
            ctx.fillRect(0, y - 5, 4, 40);
        }
        
        ctx.font = '18px Arial';
        ctx.fillText(item.icon, 25, y + 20);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = item.active ? COLORS.text : COLORS.textDim;
        ctx.fillText(item.label, 60, y + 20);
    });
    
    // Main content area
    const contentX = 240;
    const contentWidth = CANVAS_WIDTH - 260;
    
    // Header
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial';
    ctx.fillText('Dashboard', contentX, 50);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = COLORS.textDim;
    const now = new Date();
    ctx.fillText(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), contentX, 75);
    
    // Stats cards
    const stats = [
        { label: 'Total Students', value: stateData.studentCount || 47, icon: '👥', color: COLORS.primary },
        { label: 'Present Today', value: stateData.presentToday || 38, icon: '✓', color: COLORS.success },
        { label: 'Absent', value: stateData.absentToday || 9, icon: '✗', color: COLORS.error },
        { label: 'Devices Online', value: stateData.devicesOnline || 2, icon: '📱', color: COLORS.accent }
    ];
    
    const cardWidth = (contentWidth - 60) / 4;
    stats.forEach((stat, i) => {
        const x = contentX + i * (cardWidth + 20);
        const y = 100;
        
        ctx.fillStyle = '#1f2937';
        roundRect(ctx, x, y, cardWidth, 90, 10);
        ctx.fill();
        
        ctx.font = '28px Arial';
        ctx.fillText(stat.icon, x + 15, y + 40);
        
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = stat.color;
        ctx.textAlign = 'right';
        ctx.fillText(stat.value.toString(), x + cardWidth - 15, y + 40);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = COLORS.textDim;
        ctx.fillText(stat.label, x + cardWidth - 15, y + 65);
    });
    
    // Attendance chart placeholder
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1f2937';
    roundRect(ctx, contentX, 210, contentWidth / 2 - 10, 200, 10);
    ctx.fill();
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Weekly Attendance', contentX + 20, 240);
    
    // Simple bar chart
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const values = [42, 45, 38, 47, 44];
    const maxVal = 50;
    const barWidth = 40;
    const chartX = contentX + 40;
    const chartY = 380;
    const chartHeight = 100;
    
    days.forEach((day, i) => {
        const x = chartX + i * 70;
        const height = (values[i] / maxVal) * chartHeight;
        
        ctx.fillStyle = COLORS.primary;
        roundRect(ctx, x, chartY - height, barWidth, height, 4);
        ctx.fill();
        
        ctx.fillStyle = COLORS.textDim;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(day, x + barWidth / 2, chartY + 20);
        ctx.fillText(values[i].toString(), x + barWidth / 2, chartY - height - 10);
    });
    
    // Recent activity
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1f2937';
    roundRect(ctx, contentX + contentWidth / 2 + 10, 210, contentWidth / 2 - 10, 200, 10);
    ctx.fill();
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Recent Activity', contentX + contentWidth / 2 + 30, 240);
    
    const activities = [
        { time: '09:15', text: 'CIT-225 attendance started', type: 'info' },
        { time: '09:20', text: 'Anthony Kimani checked in', type: 'success' },
        { time: '09:21', text: 'Jane Wanjiku checked in', type: 'success' },
        { time: '09:22', text: 'Scan failed - retry', type: 'error' }
    ];
    
    activities.forEach((act, i) => {
        const y = 270 + i * 30;
        const x = contentX + contentWidth / 2 + 30;
        
        ctx.font = '12px Arial';
        ctx.fillStyle = COLORS.textDim;
        ctx.fillText(act.time, x, y);
        
        ctx.fillStyle = act.type === 'success' ? COLORS.success : 
                        act.type === 'error' ? COLORS.error : COLORS.text;
        ctx.fillText(act.text, x + 50, y);
    });
    
    // Devices section
    ctx.fillStyle = '#1f2937';
    roundRect(ctx, contentX, 430, contentWidth, 100, 10);
    ctx.fill();
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Connected Devices', contentX + 20, 460);
    
    // Device cards
    const devices = [
        { id: 'FBAS-001', teacher: 'Prof. Mwangi', battery: 85, status: 'active' },
        { id: 'FBAS-002', teacher: 'Dr. Otieno', battery: 62, status: 'active' }
    ];
    
    devices.forEach((device, i) => {
        const x = contentX + 20 + i * 360;
        const y = 480;
        
        ctx.fillStyle = '#374151';
        roundRect(ctx, x, y, 340, 40, 6);
        ctx.fill();
        
        ctx.font = '14px Arial';
        ctx.fillStyle = COLORS.text;
        ctx.fillText(`📱 ${device.id}`, x + 10, y + 25);
        ctx.fillText(device.teacher, x + 130, y + 25);
        
        ctx.fillStyle = COLORS.success;
        ctx.fillText(`🔋 ${device.battery}%`, x + 270, y + 25);
    });
}

// ============================================================================
// Utility Functions
// ============================================================================

function renderWindowFrame(ctx, title) {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Window title bar
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(50, 30, CANVAS_WIDTH - 100, 40);
    
    // Window title
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(title, 70, 56);
    
    // Window buttons
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 80, 50, 7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 100, 50, 7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 120, 50, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Window content area
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(50, 70, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 100);
    
    ctx.textAlign = 'center';
}

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
