// ============================================================================
// FBAS - Static Data
// ============================================================================

export const SCHOOL_DATA = {
    school: {
        name: "Nairobi Technical University",
        code: "NTU",
        logo: null
    }
};

// Teachers
export const TEACHERS = [
    {
        id: "T001",
        name: "Prof. Andrew Mwangi",
        department: "Computer Science",
        email: "a.mwangi@ntu.ac.ke",
        assignedDeviceId: "FBAS-001",
        classes: ["CIT-225", "CIT-301"]
    },
    {
        id: "T002",
        name: "Dr. Grace Otieno",
        department: "Information Technology",
        email: "g.otieno@ntu.ac.ke",
        assignedDeviceId: "FBAS-002",
        classes: ["CIT-118", "CIT-215"]
    },
    {
        id: "T003",
        name: "Mr. James Kiprop",
        department: "Software Engineering",
        email: "j.kiprop@ntu.ac.ke",
        assignedDeviceId: "FBAS-003",
        classes: ["CIT-245", "CIT-310"]
    }
];

// Classes/Courses
export const CLASSES = [
    {
        id: "CIT-225",
        name: "Data Structures and Algorithms",
        department: "Computer Science",
        intake: "September 2025",
        year: 2,
        semester: 2,
        teacherId: "T001",
        schedule: "Mon/Wed 8:00 AM - 10:00 AM",
        room: "Lab 3A"
    },
    {
        id: "CIT-301",
        name: "Database Management Systems",
        department: "Computer Science",
        intake: "September 2024",
        year: 3,
        semester: 1,
        teacherId: "T001",
        schedule: "Tue/Thu 10:00 AM - 12:00 PM",
        room: "Lab 2B"
    },
    {
        id: "CIT-118",
        name: "Introduction to Programming",
        department: "Information Technology",
        intake: "September 2025",
        year: 1,
        semester: 1,
        teacherId: "T002",
        schedule: "Mon/Wed/Fri 2:00 PM - 3:00 PM",
        room: "Lab 1A"
    },
    {
        id: "CIT-245",
        name: "Object Oriented Programming",
        department: "Software Engineering",
        intake: "September 2025",
        year: 2,
        semester: 2,
        teacherId: "T003",
        schedule: "Tue/Thu 8:00 AM - 10:00 AM",
        room: "Lab 2A"
    },
    {
        id: "CIT-310",
        name: "Software Engineering",
        department: "Software Engineering",
        intake: "September 2024",
        year: 3,
        semester: 1,
        teacherId: "T003",
        schedule: "Wed/Fri 10:00 AM - 12:00 PM",
        room: "Lab 3B"
    },
    {
        id: "CIT-215",
        name: "Computer Networks",
        department: "Information Technology",
        intake: "September 2025",
        year: 2,
        semester: 1,
        teacherId: "T002",
        schedule: "Mon/Thu 11:00 AM - 1:00 PM",
        room: "Lab 1B"
    }
];

// Students - 35+ with realistic Kenyan names
export const STUDENTS = [
    // CIT-225 - Data Structures and Algorithms (12 students)
    { id: "S001", regNo: "CIT-225-067/2025", name: "Anthony Kimani", classId: "CIT-225", fingerprintId: "FP001" },
    { id: "S002", regNo: "CIT-225-012/2025", name: "Jane Wanjiku", classId: "CIT-225", fingerprintId: "FP002" },
    { id: "S003", regNo: "CIT-225-034/2025", name: "Peter Ochieng", classId: "CIT-225", fingerprintId: "FP003" },
    { id: "S004", regNo: "CIT-225-045/2025", name: "Mary Akinyi", classId: "CIT-225", fingerprintId: "FP004" },
    { id: "S005", regNo: "CIT-225-023/2025", name: "John Kamau", classId: "CIT-225", fingerprintId: "FP005" },
    { id: "S006", regNo: "CIT-225-089/2025", name: "Grace Muthoni", classId: "CIT-225", fingerprintId: "FP006" },
    { id: "S007", regNo: "CIT-225-056/2025", name: "David Kipchoge", classId: "CIT-225", fingerprintId: "FP007" },
    { id: "S008", regNo: "CIT-225-078/2025", name: "Sarah Njeri", classId: "CIT-225", fingerprintId: "FP008" },
    { id: "S009", regNo: "CIT-225-091/2025", name: "Michael Otieno", classId: "CIT-225", fingerprintId: "FP009" },
    { id: "S010", regNo: "CIT-225-003/2025", name: "Faith Wambui", classId: "CIT-225", fingerprintId: "FP010" },
    { id: "S011", regNo: "CIT-225-015/2025", name: "Brian Mutua", classId: "CIT-225", fingerprintId: "FP011" },
    { id: "S012", regNo: "CIT-225-042/2025", name: "Lucy Chebet", classId: "CIT-225", fingerprintId: "FP012" },

    // CIT-301 - Database Management Systems (10 students)
    { id: "S013", regNo: "CIT-301-008/2024", name: "Samuel Wekesa", classId: "CIT-301", fingerprintId: "FP013" },
    { id: "S014", regNo: "CIT-301-021/2024", name: "Christine Adhiambo", classId: "CIT-301", fingerprintId: "FP014" },
    { id: "S015", regNo: "CIT-301-033/2024", name: "Dennis Korir", classId: "CIT-301", fingerprintId: "FP015" },
    { id: "S016", regNo: "CIT-301-047/2024", name: "Nancy Wanjiru", classId: "CIT-301", fingerprintId: "FP016" },
    { id: "S017", regNo: "CIT-301-019/2024", name: "Patrick Maina", classId: "CIT-301", fingerprintId: "FP017" },
    { id: "S018", regNo: "CIT-301-055/2024", name: "Esther Nyambura", classId: "CIT-301", fingerprintId: "FP018" },
    { id: "S019", regNo: "CIT-301-062/2024", name: "Vincent Ouma", classId: "CIT-301", fingerprintId: "FP019" },
    { id: "S020", regNo: "CIT-301-028/2024", name: "Caroline Kemunto", classId: "CIT-301", fingerprintId: "FP020" },
    { id: "S021", regNo: "CIT-301-041/2024", name: "Joseph Kibet", classId: "CIT-301", fingerprintId: "FP021" },
    { id: "S022", regNo: "CIT-301-074/2024", name: "Beatrice Achieng", classId: "CIT-301", fingerprintId: "FP022" },

    // CIT-118 - Introduction to Programming (8 students)
    { id: "S023", regNo: "CIT-118-101/2025", name: "Kevin Njoroge", classId: "CIT-118", fingerprintId: "FP023" },
    { id: "S024", regNo: "CIT-118-102/2025", name: "Ann Moraa", classId: "CIT-118", fingerprintId: "FP024" },
    { id: "S025", regNo: "CIT-118-103/2025", name: "Daniel Rotich", classId: "CIT-118", fingerprintId: "FP025" },
    { id: "S026", regNo: "CIT-118-104/2025", name: "Mercy Wairimu", classId: "CIT-118", fingerprintId: "FP026" },
    { id: "S027", regNo: "CIT-118-105/2025", name: "Stephen Odhiambo", classId: "CIT-118", fingerprintId: "FP027" },
    { id: "S028", regNo: "CIT-118-106/2025", name: "Pauline Cherop", classId: "CIT-118", fingerprintId: "FP028" },
    { id: "S029", regNo: "CIT-118-107/2025", name: "Charles Mwenda", classId: "CIT-118", fingerprintId: "FP029" },
    { id: "S030", regNo: "CIT-118-108/2025", name: "Diana Nafula", classId: "CIT-118", fingerprintId: "FP030" },

    // CIT-245 - Object Oriented Programming (5 students)
    { id: "S031", regNo: "CIT-245-011/2025", name: "Robert Karanja", classId: "CIT-245", fingerprintId: "FP031" },
    { id: "S032", regNo: "CIT-245-022/2025", name: "Winnie Auma", classId: "CIT-245", fingerprintId: "FP032" },
    { id: "S033", regNo: "CIT-245-033/2025", name: "Eric Langat", classId: "CIT-245", fingerprintId: "FP033" },
    { id: "S034", regNo: "CIT-245-044/2025", name: "Jacqueline Mwikali", classId: "CIT-245", fingerprintId: "FP034" },
    { id: "S035", regNo: "CIT-245-055/2025", name: "Geoffrey Mutiso", classId: "CIT-245", fingerprintId: "FP035" },

    // CIT-310 - Software Engineering (6 students)
    { id: "S036", regNo: "CIT-310-005/2024", name: "Timothy Wafula", classId: "CIT-310", fingerprintId: "FP036" },
    { id: "S037", regNo: "CIT-310-018/2024", name: "Agnes Nyaboke", classId: "CIT-310", fingerprintId: "FP037" },
    { id: "S038", regNo: "CIT-310-027/2024", name: "Martin Kipruto", classId: "CIT-310", fingerprintId: "FP038" },
    { id: "S039", regNo: "CIT-310-036/2024", name: "Rose Wangari", classId: "CIT-310", fingerprintId: "FP039" },
    { id: "S040", regNo: "CIT-310-049/2024", name: "Alex Omondi", classId: "CIT-310", fingerprintId: "FP040" },
    { id: "S041", regNo: "CIT-310-058/2024", name: "Susan Chelagat", classId: "CIT-310", fingerprintId: "FP041" },

    // CIT-215 - Computer Networks (6 students)
    { id: "S042", regNo: "CIT-215-007/2025", name: "Emmanuel Kipkemoi", classId: "CIT-215", fingerprintId: "FP042" },
    { id: "S043", regNo: "CIT-215-014/2025", name: "Joyce Nekesa", classId: "CIT-215", fingerprintId: "FP043" },
    { id: "S044", regNo: "CIT-215-026/2025", name: "Francis Muriuki", classId: "CIT-215", fingerprintId: "FP044" },
    { id: "S045", regNo: "CIT-215-031/2025", name: "Lilian Anyango", classId: "CIT-215", fingerprintId: "FP045" },
    { id: "S046", regNo: "CIT-215-043/2025", name: "Isaac Barasa", classId: "CIT-215", fingerprintId: "FP046" },
    { id: "S047", regNo: "CIT-215-052/2025", name: "Catherine Mumbi", classId: "CIT-215", fingerprintId: "FP047" }
];

// Devices
export const DEVICES = [
    {
        id: "FBAS-001",
        serialNumber: "FBAS-2025-001-NTU",
        status: "active",
        batteryLevel: 85,
        isCharging: false,
        isOnline: true,
        lastSync: "2025-11-27T08:00:00Z",
        assignedTeacherId: "T001",
        firmwareVersion: "1.2.3"
    },
    {
        id: "FBAS-002",
        serialNumber: "FBAS-2025-002-NTU",
        status: "active",
        batteryLevel: 62,
        isCharging: false,
        isOnline: true,
        lastSync: "2025-11-27T07:45:00Z",
        assignedTeacherId: "T002",
        firmwareVersion: "1.2.3"
    },
    {
        id: "FBAS-003",
        serialNumber: "FBAS-2025-003-NTU",
        status: "active",
        batteryLevel: 100,
        isCharging: true,
        isOnline: true,
        lastSync: "2025-11-27T08:15:00Z",
        assignedTeacherId: "T003",
        firmwareVersion: "1.2.3"
    }
];

// Helper functions
export function getStudentsByClass(classId) {
    return STUDENTS.filter(s => s.classId === classId);
}

export function getClassById(classId) {
    return CLASSES.find(c => c.id === classId);
}

export function getTeacherById(teacherId) {
    return TEACHERS.find(t => t.id === teacherId);
}

export function getDeviceById(deviceId) {
    return DEVICES.find(d => d.id === deviceId);
}

export function getTeacherClasses(teacherId) {
    return CLASSES.filter(c => c.teacherId === teacherId);
}

export function getStudentById(studentId) {
    return STUDENTS.find(s => s.id === studentId);
}

export function getStudentByRegNo(regNo) {
    return STUDENTS.find(s => s.regNo === regNo);
}
