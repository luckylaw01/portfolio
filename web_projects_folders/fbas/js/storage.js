// ============================================================================
// FBAS - LocalStorage Utilities
// ============================================================================

const STORAGE_KEYS = {
    ATTENDANCE_RECORDS: 'fbas_attendance_records',
    CURRENT_SESSION: 'fbas_current_session',
    DEVICE_STATE: 'fbas_device_state',
    SYNC_QUEUE: 'fbas_sync_queue',
    SETTINGS: 'fbas_settings',
    STUDENTS: 'fbas_students',
    TEACHERS: 'fbas_teachers',
    CLASSES: 'fbas_classes',
    DEVICES: 'fbas_devices',
    ACTIVITY_LOG: 'fbas_activity_log'
};

// ============================================================================
// Generic Storage Helpers
// ============================================================================

function getItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error(`Error reading ${key} from localStorage:`, e);
        return defaultValue;
    }
}

function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error(`Error writing ${key} to localStorage:`, e);
        return false;
    }
}

function removeItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error(`Error removing ${key} from localStorage:`, e);
        return false;
    }
}

// ============================================================================
// Activity Log
// ============================================================================

export function getActivityLog() {
    return getItem(STORAGE_KEYS.ACTIVITY_LOG, []);
}

export function addActivityLog(type, message, data = {}) {
    const log = getActivityLog();
    log.unshift({
        id: `LOG-${Date.now()}`,
        type, // 'success', 'error', 'info', 'warning'
        message,
        data,
        timestamp: new Date().toISOString()
    });
    // Keep only last 100 entries
    if (log.length > 100) log.pop();
    return setItem(STORAGE_KEYS.ACTIVITY_LOG, log);
}

export function clearActivityLog() {
    return removeItem(STORAGE_KEYS.ACTIVITY_LOG);
}

// ============================================================================
// Students CRUD
// ============================================================================

export function getStoredStudents() {
    return getItem(STORAGE_KEYS.STUDENTS, null);
}

export function initializeStudents(defaultStudents) {
    if (!getStoredStudents()) {
        setItem(STORAGE_KEYS.STUDENTS, defaultStudents);
    }
    return getStoredStudents() || defaultStudents;
}

export function getAllStudents() {
    return getStoredStudents() || [];
}

export function addStudent(student) {
    const students = getAllStudents();
    const newStudent = {
        ...student,
        id: student.id || `S${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    students.push(newStudent);
    setItem(STORAGE_KEYS.STUDENTS, students);
    addActivityLog('success', `Added student: ${newStudent.name}`, { studentId: newStudent.id });
    return newStudent;
}

export function updateStudent(studentId, updates) {
    const students = getAllStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index !== -1) {
        students[index] = { ...students[index], ...updates, updatedAt: new Date().toISOString() };
        setItem(STORAGE_KEYS.STUDENTS, students);
        addActivityLog('info', `Updated student: ${students[index].name}`, { studentId });
        return students[index];
    }
    return null;
}

export function deleteStudent(studentId) {
    const students = getAllStudents();
    const student = students.find(s => s.id === studentId);
    const filtered = students.filter(s => s.id !== studentId);
    setItem(STORAGE_KEYS.STUDENTS, filtered);
    if (student) {
        addActivityLog('warning', `Deleted student: ${student.name}`, { studentId });
    }
    return filtered;
}

export function getStudentsByClassId(classId) {
    return getAllStudents().filter(s => s.classId === classId);
}

export function searchStudents(query) {
    const q = query.toLowerCase();
    return getAllStudents().filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.regNo.toLowerCase().includes(q)
    );
}

// ============================================================================
// Teachers CRUD
// ============================================================================

export function getStoredTeachers() {
    return getItem(STORAGE_KEYS.TEACHERS, null);
}

export function initializeTeachers(defaultTeachers) {
    if (!getStoredTeachers()) {
        setItem(STORAGE_KEYS.TEACHERS, defaultTeachers);
    }
    return getStoredTeachers() || defaultTeachers;
}

export function getAllTeachers() {
    return getStoredTeachers() || [];
}

export function addTeacher(teacher) {
    const teachers = getAllTeachers();
    const newTeacher = {
        ...teacher,
        id: teacher.id || `T${Date.now()}`,
        classes: teacher.classes || [],
        createdAt: new Date().toISOString()
    };
    teachers.push(newTeacher);
    setItem(STORAGE_KEYS.TEACHERS, teachers);
    addActivityLog('success', `Added teacher: ${newTeacher.name}`, { teacherId: newTeacher.id });
    return newTeacher;
}

export function updateTeacher(teacherId, updates) {
    const teachers = getAllTeachers();
    const index = teachers.findIndex(t => t.id === teacherId);
    if (index !== -1) {
        teachers[index] = { ...teachers[index], ...updates, updatedAt: new Date().toISOString() };
        setItem(STORAGE_KEYS.TEACHERS, teachers);
        addActivityLog('info', `Updated teacher: ${teachers[index].name}`, { teacherId });
        return teachers[index];
    }
    return null;
}

export function deleteTeacher(teacherId) {
    const teachers = getAllTeachers();
    const teacher = teachers.find(t => t.id === teacherId);
    const filtered = teachers.filter(t => t.id !== teacherId);
    setItem(STORAGE_KEYS.TEACHERS, filtered);
    if (teacher) {
        addActivityLog('warning', `Deleted teacher: ${teacher.name}`, { teacherId });
    }
    return filtered;
}

// ============================================================================
// Classes CRUD
// ============================================================================

export function getStoredClasses() {
    return getItem(STORAGE_KEYS.CLASSES, null);
}

export function initializeClasses(defaultClasses) {
    if (!getStoredClasses()) {
        setItem(STORAGE_KEYS.CLASSES, defaultClasses);
    }
    return getStoredClasses() || defaultClasses;
}

export function getAllClasses() {
    return getStoredClasses() || [];
}

export function addClass(classData) {
    const classes = getAllClasses();
    const newClass = {
        ...classData,
        id: classData.id || `CIT-${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    classes.push(newClass);
    setItem(STORAGE_KEYS.CLASSES, classes);
    addActivityLog('success', `Added class: ${newClass.name}`, { classId: newClass.id });
    return newClass;
}

export function updateClass(classId, updates) {
    const classes = getAllClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index !== -1) {
        classes[index] = { ...classes[index], ...updates, updatedAt: new Date().toISOString() };
        setItem(STORAGE_KEYS.CLASSES, classes);
        addActivityLog('info', `Updated class: ${classes[index].name}`, { classId });
        return classes[index];
    }
    return null;
}

export function deleteClass(classId) {
    const classes = getAllClasses();
    const cls = classes.find(c => c.id === classId);
    const filtered = classes.filter(c => c.id !== classId);
    setItem(STORAGE_KEYS.CLASSES, filtered);
    if (cls) {
        addActivityLog('warning', `Deleted class: ${cls.name}`, { classId });
    }
    return filtered;
}

// ============================================================================
// Devices CRUD
// ============================================================================

export function getStoredDevices() {
    return getItem(STORAGE_KEYS.DEVICES, null);
}

export function initializeDevices(defaultDevices) {
    if (!getStoredDevices()) {
        setItem(STORAGE_KEYS.DEVICES, defaultDevices);
    }
    return getStoredDevices() || defaultDevices;
}

export function getAllDevices() {
    return getStoredDevices() || [];
}

export function addDevice(device) {
    const devices = getAllDevices();
    const newDevice = {
        ...device,
        id: device.id || `FBAS-${String(devices.length + 1).padStart(3, '0')}`,
        status: 'active',
        batteryLevel: 100,
        isCharging: false,
        isOnline: false,
        lastSync: new Date().toISOString(),
        firmwareVersion: '1.2.3',
        createdAt: new Date().toISOString()
    };
    devices.push(newDevice);
    setItem(STORAGE_KEYS.DEVICES, devices);
    addActivityLog('success', `Added device: ${newDevice.id}`, { deviceId: newDevice.id });
    return newDevice;
}

export function updateDevice(deviceId, updates) {
    const devices = getAllDevices();
    const index = devices.findIndex(d => d.id === deviceId);
    if (index !== -1) {
        devices[index] = { ...devices[index], ...updates, updatedAt: new Date().toISOString() };
        setItem(STORAGE_KEYS.DEVICES, devices);
        return devices[index];
    }
    return null;
}

export function deleteDevice(deviceId) {
    const devices = getAllDevices();
    const device = devices.find(d => d.id === deviceId);
    const filtered = devices.filter(d => d.id !== deviceId);
    setItem(STORAGE_KEYS.DEVICES, filtered);
    if (device) {
        addActivityLog('warning', `Deleted device: ${device.id}`, { deviceId });
    }
    return filtered;
}

export function syncDevice(deviceId) {
    const device = updateDevice(deviceId, { 
        lastSync: new Date().toISOString(),
        isOnline: true
    });
    if (device) {
        addActivityLog('success', `Device ${deviceId} synced successfully`);
    }
    return device;
}

// ============================================================================
// Attendance Records
// ============================================================================

export function getAttendanceRecords() {
    return getItem(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
}

export function saveAttendanceRecord(record) {
    const records = getAttendanceRecords();
    records.push({
        ...record,
        id: `ATT-${Date.now()}`,
        timestamp: new Date().toISOString()
    });
    return setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, records);
}

export function getAttendanceBySession(sessionId) {
    const records = getAttendanceRecords();
    return records.filter(r => r.sessionId === sessionId);
}

export function getAttendanceByClass(classId) {
    const records = getAttendanceRecords();
    return records.filter(r => r.classId === classId);
}

export function getAttendanceByStudent(studentId) {
    const records = getAttendanceRecords();
    return records.filter(r => r.studentId === studentId);
}

export function clearAttendanceRecords() {
    return removeItem(STORAGE_KEYS.ATTENDANCE_RECORDS);
}

// ============================================================================
// Current Session
// ============================================================================

export function getCurrentSession() {
    return getItem(STORAGE_KEYS.CURRENT_SESSION, null);
}

export function startSession(classId, teacherId, deviceId) {
    const session = {
        id: `SES-${Date.now()}`,
        classId,
        teacherId,
        deviceId,
        startTime: new Date().toISOString(),
        endTime: null,
        status: 'active',
        attendanceCount: 0
    };
    setItem(STORAGE_KEYS.CURRENT_SESSION, session);
    return session;
}

export function updateSessionAttendance(count) {
    const session = getCurrentSession();
    if (session) {
        session.attendanceCount = count;
        setItem(STORAGE_KEYS.CURRENT_SESSION, session);
    }
    return session;
}

export function endSession() {
    const session = getCurrentSession();
    if (session) {
        session.endTime = new Date().toISOString();
        session.status = 'completed';
        setItem(STORAGE_KEYS.CURRENT_SESSION, session);
        
        // Add to sync queue
        addToSyncQueue({
            type: 'session_complete',
            data: session
        });
    }
    return session;
}

export function clearCurrentSession() {
    return removeItem(STORAGE_KEYS.CURRENT_SESSION);
}

// ============================================================================
// Device State
// ============================================================================

export function getDeviceState() {
    return getItem(STORAGE_KEYS.DEVICE_STATE, {
        isPoweredOn: true,
        batteryLevel: 85,
        isCharging: false,
        isOnline: true,
        currentScreen: 'home',
        brightness: 100
    });
}

export function updateDeviceState(updates) {
    const state = getDeviceState();
    const newState = { ...state, ...updates };
    setItem(STORAGE_KEYS.DEVICE_STATE, newState);
    return newState;
}

export function togglePower() {
    const state = getDeviceState();
    return updateDeviceState({ isPoweredOn: !state.isPoweredOn });
}

export function setCharging(isCharging) {
    return updateDeviceState({ isCharging });
}

export function setBatteryLevel(level) {
    return updateDeviceState({ batteryLevel: Math.max(0, Math.min(100, level)) });
}

export function setOnlineStatus(isOnline) {
    return updateDeviceState({ isOnline });
}

export function setCurrentScreen(screenName) {
    return updateDeviceState({ currentScreen: screenName });
}

// ============================================================================
// Sync Queue (for offline mode)
// ============================================================================

export function getSyncQueue() {
    return getItem(STORAGE_KEYS.SYNC_QUEUE, []);
}

export function addToSyncQueue(item) {
    const queue = getSyncQueue();
    queue.push({
        ...item,
        queuedAt: new Date().toISOString()
    });
    return setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
}

export function clearSyncQueue() {
    return removeItem(STORAGE_KEYS.SYNC_QUEUE);
}

export function getSyncQueueCount() {
    return getSyncQueue().length;
}

// ============================================================================
// Settings
// ============================================================================

export function getSettings() {
    return getItem(STORAGE_KEYS.SETTINGS, {
        soundEnabled: true,
        volume: 0.7,
        scanFailureRate: 0.02, // 2% failure rate
        animationSpeed: 1.0
    });
}

export function updateSettings(updates) {
    const settings = getSettings();
    const newSettings = { ...settings, ...updates };
    setItem(STORAGE_KEYS.SETTINGS, newSettings);
    return newSettings;
}

// ============================================================================
// Reset All Data
// ============================================================================

export function resetAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
        removeItem(key);
    });
    console.log('All FBAS data cleared from localStorage');
}

// ============================================================================
// Export storage keys for debugging
// ============================================================================

export { STORAGE_KEYS };
