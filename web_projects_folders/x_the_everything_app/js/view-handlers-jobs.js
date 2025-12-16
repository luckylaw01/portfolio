// Jobs View Handler
XApp.prototype.initJobsView = function () {
    console.log('Initializing jobs view');

    // Initialize bottom navigation
    this.initBottomNav('jobs');

    // Note: Back button is handled globally by navigation.js

    // Initialize jobs data if not exists
    if (!this.getData('jobs')) {
        this.saveData('jobs', this.generateSampleJobs());
    }

    // Initialize user job applications
    const currentUser = this.getData('currentUser');
    if (!this.getData('jobApplications')) {
        this.saveData('jobApplications', {});
    }

    if (!this.getData('savedJobs')) {
        this.saveData('savedJobs', {});
    }

    // Setup search
    const searchInput = document.getElementById('jobSearchInput');
    const searchBtn = document.getElementById('jobsSearchBtn');
    const filterBtn = document.getElementById('filterJobsBtn');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            this.filterJobs();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.focus();
            }
        });
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            this.showJobFiltersDialog();
        });
    }

    // Setup filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            this.filterJobs(chip.dataset.filter);
        });
    });

    // Load jobs
    this.loadJobs();
};

XApp.prototype.loadJobs = function (filter = 'all') {
    const container = document.getElementById('jobListingsContainer');
    if (!container) return;

    let jobs = this.getData('jobs') || [];

    // Apply filter
    if (filter !== 'all') {
        jobs = jobs.filter(job => {
            if (filter === 'remote') return job.isRemote;
            if (filter === 'full-time') return job.type === 'Full-time';
            if (filter === 'part-time') return job.type === 'Part-time';
            if (filter === 'contract') return job.type === 'Contract';
            return true;
        });
    }

    if (jobs.length === 0) {
        container.innerHTML = '<div class="empty-jobs"><div class="empty-icon">💼</div><h3>No jobs found</h3><p>Try adjusting your filters</p></div>';
        return;
    }

    container.innerHTML = jobs.map(job => this.renderJobCard(job)).join('');

    // Add click handlers
    const jobCards = container.querySelectorAll('.job-card');
    jobCards.forEach(card => {
        card.addEventListener('click', () => {
            const jobId = card.dataset.jobId;
            this.navigation.loadView('job-detail', true, { jobId: jobId });
        });
    });
};

XApp.prototype.renderJobCard = function (job) {
    const postedDate = this.formatJobPostedDate(job.postedDate);
    const isRemoteBadge = job.isRemote ? '<span class="job-badge remote">Remote</span>' : '';
    const isUrgentBadge = job.isUrgent ? '<span class="job-badge urgent">Urgent</span>' : '';

    return '<div class="job-card" data-job-id="' + job.id + '">' +
        '<div class="job-header">' +
        '<div class="job-logo">' + job.companyLogo + '</div>' +
        '<div class="job-info">' +
        '<div class="job-title">' + job.title + '</div>' +
        '<div class="job-company">' + job.company + '</div>' +
        '<div class="job-location">' + job.location + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="job-meta">' +
        '<span class="job-badge">' + job.type + '</span>' +
        isRemoteBadge +
        isUrgentBadge +
        '</div>' +
        '<div class="job-salary">' + job.salary + '</div>' +
        '<div class="job-description">' + job.description + '</div>' +
        '<div class="job-posted">' + postedDate + '</div>' +
        '</div>';
};

XApp.prototype.filterJobs = function (filterType) {
    const searchInput = document.getElementById('jobSearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    let jobs = this.getData('jobs') || [];

    // Apply type filter
    if (filterType && filterType !== 'all') {
        jobs = jobs.filter(job => {
            if (filterType === 'remote') return job.isRemote;
            if (filterType === 'full-time') return job.type === 'Full-time';
            if (filterType === 'part-time') return job.type === 'Part-time';
            if (filterType === 'contract') return job.type === 'Contract';
            return true;
        });
    }

    // Apply search filter
    if (searchTerm) {
        jobs = jobs.filter(job => {
            return job.title.toLowerCase().includes(searchTerm) ||
                job.company.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm) ||
                job.location.toLowerCase().includes(searchTerm);
        });
    }

    const container = document.getElementById('jobListingsContainer');
    if (!container) return;

    if (jobs.length === 0) {
        container.innerHTML = '<div class="empty-jobs"><div class="empty-icon">💼</div><h3>No jobs found</h3><p>Try adjusting your search or filters</p></div>';
        return;
    }

    container.innerHTML = jobs.map(job => this.renderJobCard(job)).join('');

    // Add click handlers
    const jobCards = container.querySelectorAll('.job-card');
    jobCards.forEach(card => {
        card.addEventListener('click', () => {
            const jobId = card.dataset.jobId;
            this.navigation.loadView('job-detail', true, { jobId: jobId });
        });
    });
};

XApp.prototype.formatJobPostedDate = function (dateString) {
    const posted = new Date(dateString);
    const now = new Date();
    const diffMs = now - posted;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays < 7) return 'Posted ' + diffDays + ' days ago';
    if (diffDays < 30) return 'Posted ' + Math.floor(diffDays / 7) + ' weeks ago';
    return 'Posted ' + Math.floor(diffDays / 30) + ' months ago';
};

XApp.prototype.showJobFiltersDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';

    const currentUser = this.getData('currentUser');
    const userProfile = this.getData('users').find(u => u.username === currentUser);

    dialog.innerHTML = '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h3>Job Filters</h3>' +
        '<button class="modal-close">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Salary Range</label>' +
        '<select id="filterSalary" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white);">' +
        '<option value="">Any</option>' +
        '<option value="0-50000">Under $50,000</option>' +
        '<option value="50000-100000">$50,000 - $100,000</option>' +
        '<option value="100000-150000">$100,000 - $150,000</option>' +
        '<option value="150000+">$150,000+</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Experience Level</label>' +
        '<select id="filterExperience" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white);">' +
        '<option value="">Any</option>' +
        '<option value="entry">Entry Level</option>' +
        '<option value="mid">Mid Level</option>' +
        '<option value="senior">Senior Level</option>' +
        '<option value="lead">Lead/Principal</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Industry</label>' +
        '<select id="filterIndustry" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white);">' +
        '<option value="">Any</option>' +
        '<option value="tech">Technology</option>' +
        '<option value="finance">Finance</option>' +
        '<option value="healthcare">Healthcare</option>' +
        '<option value="education">Education</option>' +
        '<option value="retail">Retail</option>' +
        '</select>' +
        '</div>' +
        '<button id="applyFiltersBtn" style="width: 100%; background: var(--x-blue); color: var(--x-white); border: none; padding: 14px; border-radius: 24px; font-size: 15px; font-weight: 700; cursor: pointer;">Apply Filters</button>' +
        '</div>' +
        '</div>';

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(dialog);
    });

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            document.body.removeChild(dialog);
        }
    });

    const applyBtn = dialog.querySelector('#applyFiltersBtn');
    applyBtn.addEventListener('click', () => {
        this.showNotification('Filters applied');
        document.body.removeChild(dialog);
    });
};

// Job Detail View Handler
XApp.prototype.initJobDetailView = function (params) {
    console.log('Initializing job detail view');

    // Setup back button
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }

    const jobId = params?.jobId;
    if (!jobId) {
        this.navigation.loadView('jobs');
        return;
    }

    const jobs = this.getData('jobs') || [];
    const job = jobs.find(j => j.id === jobId);

    if (!job) {
        this.navigation.loadView('jobs');
        return;
    }

    const container = document.getElementById('jobDetailContent');
    if (!container) return;

    const currentUser = this.getData('currentUser');
    const savedJobs = this.getData('savedJobs') || {};
    const isSaved = savedJobs[currentUser]?.includes(jobId);

    container.innerHTML = this.renderJobDetail(job, isSaved);

    // Setup apply button
    const applyBtn = document.getElementById('applyJobBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            this.showJobApplicationDialog(job);
        });
    }

    // Setup save button
    const saveBtn = document.getElementById('saveJobBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            this.toggleSaveJob(job.id);
        });
    }

    // Setup share button
    const shareBtn = document.getElementById('shareJobBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            this.showNotification('Share link copied to clipboard');
        });
    }
};

XApp.prototype.renderJobDetail = function (job, isSaved) {
    const isRemoteBadge = job.isRemote ? '<span class="job-badge remote">Remote</span>' : '';
    const isUrgentBadge = job.isUrgent ? '<span class="job-badge urgent">Urgent</span>' : '';
    const saveIcon = isSaved ? '💾' : '🔖';
    const saveClass = isSaved ? 'saved' : '';

    return '<div class="job-detail-header">' +
        '<div class="job-detail-logo">' + job.companyLogo + '</div>' +
        '<div class="job-detail-title">' + job.title + '</div>' +
        '<div class="job-detail-company">' + job.company + '</div>' +
        '<div class="job-detail-location">' + job.location + '</div>' +
        '<div class="job-detail-meta">' +
        '<span class="job-badge">' + job.type + '</span>' +
        isRemoteBadge +
        isUrgentBadge +
        '</div>' +
        '<div class="job-detail-salary">' + job.salary + '</div>' +
        '</div>' +
        '<div class="job-detail-section">' +
        '<h3>About the Role</h3>' +
        '<p>' + job.description + '</p>' +
        '</div>' +
        '<div class="job-detail-section">' +
        '<h3>Responsibilities</h3>' +
        '<ul>' +
        job.responsibilities.map(r => '<li>' + r + '</li>').join('') +
        '</ul>' +
        '</div>' +
        '<div class="job-detail-section">' +
        '<h3>Requirements</h3>' +
        '<ul>' +
        job.requirements.map(r => '<li>' + r + '</li>').join('') +
        '</ul>' +
        '</div>' +
        '<div class="job-detail-section">' +
        '<h3>Benefits</h3>' +
        '<ul>' +
        job.benefits.map(b => '<li>' + b + '</li>').join('') +
        '</ul>' +
        '</div>' +
        '<div class="job-actions">' +
        '<button id="applyJobBtn" class="btn-apply">Apply Now</button>' +
        '<button id="saveJobBtn" class="btn-save ' + saveClass + '">' + saveIcon + '</button>' +
        '</div>';
};

XApp.prototype.toggleSaveJob = function (jobId) {
    const currentUser = this.getData('currentUser');
    const savedJobs = this.getData('savedJobs') || {};

    if (!savedJobs[currentUser]) {
        savedJobs[currentUser] = [];
    }

    const index = savedJobs[currentUser].indexOf(jobId);
    if (index > -1) {
        savedJobs[currentUser].splice(index, 1);
        this.showNotification('Job removed from saved');
    } else {
        savedJobs[currentUser].push(jobId);
        this.showNotification('Job saved');
    }

    this.saveData('savedJobs', savedJobs);

    // Update button
    const saveBtn = document.getElementById('saveJobBtn');
    if (saveBtn) {
        if (index > -1) {
            saveBtn.classList.remove('saved');
            saveBtn.textContent = '🔖';
        } else {
            saveBtn.classList.add('saved');
            saveBtn.textContent = '💾';
        }
    }
};

XApp.prototype.showJobApplicationDialog = function (job) {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';

    const currentUser = this.getData('currentUser');
    const users = this.getData('users') || [];
    const userProfile = users.find(u => u.username === currentUser);

    dialog.innerHTML = '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h3>Apply for ' + job.title + '</h3>' +
        '<button class="modal-close">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Full Name</label>' +
        '<input type="text" id="applicantName" value="' + (userProfile?.name || '') + '" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white);" />' +
        '</div>' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Email</label>' +
        '<input type="email" id="applicantEmail" placeholder="your.email@example.com" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white);" />' +
        '</div>' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Phone</label>' +
        '<input type="tel" id="applicantPhone" placeholder="+1 (555) 123-4567" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white);" />' +
        '</div>' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Resume/CV</label>' +
        '<button id="uploadResumeBtn" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); cursor: pointer; text-align: left;">📄 Upload Resume</button>' +
        '<div id="resumeFileName" style="margin-top: 8px; font-size: 13px; color: var(--x-gray);"></div>' +
        '</div>' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Cover Letter (Optional)</label>' +
        '<textarea id="coverLetter" rows="5" placeholder="Why are you interested in this position?" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); resize: vertical;"></textarea>' +
        '</div>' +
        '<button id="submitApplicationBtn" style="width: 100%; background: var(--x-blue); color: var(--x-white); border: none; padding: 14px; border-radius: 24px; font-size: 15px; font-weight: 700; cursor: pointer;">Submit Application</button>' +
        '</div>' +
        '</div>';

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(dialog);
    });

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            document.body.removeChild(dialog);
        }
    });

    // Upload resume handler
    const uploadBtn = dialog.querySelector('#uploadResumeBtn');
    const resumeFileName = dialog.querySelector('#resumeFileName');
    uploadBtn.addEventListener('click', () => {
        resumeFileName.textContent = '✓ resume.pdf uploaded';
        resumeFileName.style.color = 'var(--x-blue)';
    });

    // Submit application
    const submitBtn = dialog.querySelector('#submitApplicationBtn');
    submitBtn.addEventListener('click', () => {
        const name = dialog.querySelector('#applicantName').value;
        const email = dialog.querySelector('#applicantEmail').value;
        const phone = dialog.querySelector('#applicantPhone').value;
        const coverLetter = dialog.querySelector('#coverLetter').value;

        if (!name || !email || !phone) {
            this.showNotification('Please fill in all required fields');
            return;
        }

        // Save application
        const applications = this.getData('jobApplications') || {};
        if (!applications[currentUser]) {
            applications[currentUser] = [];
        }

        applications[currentUser].push({
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            name: name,
            email: email,
            phone: phone,
            coverLetter: coverLetter,
            appliedDate: new Date().toISOString(),
            status: 'pending'
        });

        this.saveData('jobApplications', applications);

        this.showNotification('Application submitted successfully!');
        document.body.removeChild(dialog);
    });
};

// Generate Sample Jobs
XApp.prototype.generateSampleJobs = function () {
    return [
        {
            id: 'job1',
            title: 'Senior Software Engineer',
            company: 'TechCorp Inc.',
            companyLogo: '💻',
            location: 'San Francisco, CA',
            type: 'Full-time',
            isRemote: true,
            isUrgent: true,
            salary: '$150,000 - $200,000/year',
            description: 'We are looking for an experienced Senior Software Engineer to join our growing team. You will work on cutting-edge technologies and help shape the future of our products.',
            responsibilities: [
                'Design and implement scalable backend systems',
                'Mentor junior developers and conduct code reviews',
                'Collaborate with product managers and designers',
                'Optimize application performance and reliability'
            ],
            requirements: [
                '5+ years of software development experience',
                'Strong proficiency in JavaScript, Python, or Java',
                'Experience with cloud platforms (AWS, GCP, or Azure)',
                'Excellent problem-solving and communication skills'
            ],
            benefits: [
                'Competitive salary and equity package',
                'Health, dental, and vision insurance',
                'Unlimited PTO',
                'Remote work flexibility',
                '401(k) matching'
            ],
            postedDate: '2025-11-20'
        },
        {
            id: 'job2',
            title: 'Product Designer',
            company: 'DesignHub',
            companyLogo: '🎨',
            location: 'New York, NY',
            type: 'Full-time',
            isRemote: false,
            isUrgent: false,
            salary: '$120,000 - $160,000/year',
            description: 'Join our design team to create beautiful and intuitive user experiences. You will work closely with engineers and product managers to bring ideas to life.',
            responsibilities: [
                'Create wireframes, prototypes, and high-fidelity designs',
                'Conduct user research and usability testing',
                'Develop and maintain design systems',
                'Present design concepts to stakeholders'
            ],
            requirements: [
                '3+ years of product design experience',
                'Expert proficiency in Figma or Sketch',
                'Strong portfolio demonstrating UX/UI work',
                'Understanding of front-end development principles'
            ],
            benefits: [
                'Competitive compensation',
                'Full health benefits',
                'Professional development budget',
                'Flexible work hours',
                'Modern office in Manhattan'
            ],
            postedDate: '2025-11-22'
        },
        {
            id: 'job3',
            title: 'Marketing Manager',
            company: 'GrowthLabs',
            companyLogo: '📈',
            location: 'Austin, TX',
            type: 'Full-time',
            isRemote: true,
            isUrgent: false,
            salary: '$100,000 - $140,000/year',
            description: 'Lead our marketing efforts and help us reach new audiences. You will develop and execute strategies across multiple channels to drive growth.',
            responsibilities: [
                'Develop and execute marketing strategies',
                'Manage social media and content marketing',
                'Analyze campaign performance and ROI',
                'Collaborate with sales and product teams'
            ],
            requirements: [
                '4+ years of marketing experience',
                'Proven track record in digital marketing',
                'Strong analytical and communication skills',
                'Experience with marketing automation tools'
            ],
            benefits: [
                'Competitive salary and bonuses',
                'Remote work options',
                'Health and wellness benefits',
                'Career growth opportunities',
                'Company retreats'
            ],
            postedDate: '2025-11-18'
        },
        {
            id: 'job4',
            title: 'Data Scientist',
            company: 'DataFlow AI',
            companyLogo: '📊',
            location: 'Boston, MA',
            type: 'Full-time',
            isRemote: true,
            isUrgent: true,
            salary: '$140,000 - $180,000/year',
            description: 'Apply your data science expertise to solve complex business problems. Work with large datasets and cutting-edge ML technologies.',
            responsibilities: [
                'Build and deploy machine learning models',
                'Analyze large datasets to extract insights',
                'Collaborate with engineering teams',
                'Present findings to stakeholders'
            ],
            requirements: [
                'Master\'s or PhD in relevant field',
                'Strong Python and SQL skills',
                'Experience with ML frameworks (TensorFlow, PyTorch)',
                'Excellent statistical analysis skills'
            ],
            benefits: [
                'Top-tier compensation',
                'Stock options',
                'Comprehensive health coverage',
                'Remote-first culture',
                'Learning and development budget'
            ],
            postedDate: '2025-11-24'
        },
        {
            id: 'job5',
            title: 'DevOps Engineer',
            company: 'CloudNative Systems',
            companyLogo: '☁️',
            location: 'Seattle, WA',
            type: 'Full-time',
            isRemote: true,
            isUrgent: false,
            salary: '$130,000 - $170,000/year',
            description: 'Help us build and maintain scalable infrastructure. You will work with modern cloud technologies and automation tools.',
            responsibilities: [
                'Design and maintain CI/CD pipelines',
                'Manage cloud infrastructure and monitoring',
                'Automate deployment and scaling processes',
                'Ensure system reliability and security'
            ],
            requirements: [
                '4+ years of DevOps experience',
                'Strong knowledge of AWS/GCP/Azure',
                'Experience with Kubernetes and Docker',
                'Proficiency in scripting (Python, Bash)'
            ],
            benefits: [
                'Competitive salary',
                'Remote work flexibility',
                'Health and retirement benefits',
                'Professional certifications support',
                'Work-life balance'
            ],
            postedDate: '2025-11-21'
        },
        {
            id: 'job6',
            title: 'Frontend Developer',
            company: 'WebWorks Studio',
            companyLogo: '⚡',
            location: 'Los Angeles, CA',
            type: 'Contract',
            isRemote: true,
            isUrgent: false,
            salary: '$80 - $120/hour',
            description: 'Create stunning web experiences using modern frontend technologies. Work on exciting projects for top-tier clients.',
            responsibilities: [
                'Build responsive web applications',
                'Implement pixel-perfect designs',
                'Optimize performance and accessibility',
                'Collaborate with backend developers'
            ],
            requirements: [
                '3+ years of frontend development',
                'Expert in React or Vue.js',
                'Strong HTML, CSS, and JavaScript skills',
                'Experience with modern build tools'
            ],
            benefits: [
                'Competitive hourly rate',
                'Flexible schedule',
                'Remote work',
                'Interesting projects',
                'Potential for full-time conversion'
            ],
            postedDate: '2025-11-23'
        },
        {
            id: 'job7',
            title: 'Customer Success Manager',
            company: 'SaaS Solutions',
            companyLogo: '🤝',
            location: 'Chicago, IL',
            type: 'Full-time',
            isRemote: false,
            isUrgent: true,
            salary: '$90,000 - $120,000/year',
            description: 'Build strong relationships with our customers and ensure their success. Help them get the most value from our platform.',
            responsibilities: [
                'Onboard new customers and provide training',
                'Monitor customer health and engagement',
                'Identify upsell and expansion opportunities',
                'Advocate for customer needs internally'
            ],
            requirements: [
                '3+ years in customer success or account management',
                'Excellent communication skills',
                'Experience with SaaS products',
                'Data-driven mindset'
            ],
            benefits: [
                'Base salary plus commission',
                'Health and dental insurance',
                'Career advancement opportunities',
                'Team events and activities',
                'Downtown office location'
            ],
            postedDate: '2025-11-19'
        },
        {
            id: 'job8',
            title: 'Mobile App Developer',
            company: 'AppNation',
            companyLogo: '📱',
            location: 'Miami, FL',
            type: 'Full-time',
            isRemote: true,
            isUrgent: false,
            salary: '$110,000 - $150,000/year',
            description: 'Build native mobile applications for iOS and Android. Work on apps used by millions of users worldwide.',
            responsibilities: [
                'Develop native mobile applications',
                'Implement new features and improvements',
                'Fix bugs and optimize performance',
                'Work with designers and product managers'
            ],
            requirements: [
                '4+ years of mobile development experience',
                'Proficiency in Swift/Kotlin or React Native',
                'Published apps in App Store or Play Store',
                'Strong understanding of mobile UI/UX'
            ],
            benefits: [
                'Competitive compensation',
                'Remote work flexibility',
                'Health benefits',
                'Equity options',
                'Latest development hardware'
            ],
            postedDate: '2025-11-25'
        },
        {
            id: 'job9',
            title: 'Content Writer',
            company: 'ContentHub Media',
            companyLogo: '✍️',
            location: 'Remote',
            type: 'Part-time',
            isRemote: true,
            isUrgent: false,
            salary: '$40,000 - $60,000/year',
            description: 'Create engaging content for our blog and social media channels. Help us tell compelling stories and connect with our audience.',
            responsibilities: [
                'Write blog posts and articles',
                'Create social media content',
                'Conduct research on industry topics',
                'Collaborate with marketing team'
            ],
            requirements: [
                '2+ years of content writing experience',
                'Excellent writing and editing skills',
                'SEO knowledge',
                'Ability to adapt tone and style'
            ],
            benefits: [
                'Flexible schedule',
                'Work from anywhere',
                'Portfolio building opportunities',
                'Growth potential',
                'Collaborative team'
            ],
            postedDate: '2025-11-17'
        },
        {
            id: 'job10',
            title: 'Sales Executive',
            company: 'SalesForce Pro',
            companyLogo: '💼',
            location: 'Denver, CO',
            type: 'Full-time',
            isRemote: false,
            isUrgent: true,
            salary: '$70,000 base + commission',
            description: 'Drive revenue growth by identifying and closing new business opportunities. Join a high-performing sales team.',
            responsibilities: [
                'Generate and qualify leads',
                'Conduct product demonstrations',
                'Negotiate and close deals',
                'Maintain customer relationships'
            ],
            requirements: [
                '3+ years of B2B sales experience',
                'Proven track record of meeting quotas',
                'Strong presentation skills',
                'CRM experience (Salesforce preferred)'
            ],
            benefits: [
                'Uncapped commission',
                'Health and retirement benefits',
                'Sales training and development',
                'Career advancement',
                'Team incentives and trips'
            ],
            postedDate: '2025-11-26'
        }
    ];
};
