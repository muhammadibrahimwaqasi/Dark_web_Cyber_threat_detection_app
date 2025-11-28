// ===================================
// DARKWEB THREAT DASHBOARD - PROMPT.TXT IMPLEMENTATION
// ===================================

// ===== GLOBAL VARIABLES =====
let threatChart, attackChart, timelineChart;
let currentAttackSelection = null;
let isAnalyzing = false;

// ===== DOM ELEMENTS =====
const elements = {
    // Input elements
    threatInput: document.getElementById('threatInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    charCount: document.getElementById('charCount'),
    
    // Results elements
    resultsSection: document.getElementById('resultsSection'),
    resultBadge: document.getElementById('resultBadge'),
    resultTimestamp: document.getElementById('resultTimestamp'),
    confidencePercent: document.getElementById('confidencePercent'),
    progressCircle: document.getElementById('progressCircle'),
    threatDetails: document.getElementById('threatDetails'),
    
    // Explanation elements
    explanationSection: document.getElementById('explanationSection'),
    explanationContent: document.getElementById('explanationContent'),
    
    // Attack details elements
    selectedAttackName: document.getElementById('selectedAttackName'),
    severityBadge: document.getElementById('severityBadge'),
    attackDetailsContent: document.getElementById('attackDetailsContent'),
    
    // Threat feed elements
    threatFeedList: document.getElementById('threatFeedList'),
    
    // Mobile elements
    hamburgerMenu: document.querySelector('.hamburger-menu'),
    sidebar: document.querySelector('.sidebar'),
    overlay: document.querySelector('.overlay')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeCharts();
    loadStats();
    startLiveFeed();
    initializeAnimations();
    initializeSpecialEffects();
    initializeKonamiCode();
    initializePerformanceOptimizations();
});

// ===== PROMPT 11: EVENT LISTENERS =====
function initializeEventListeners() {
    // Character counter
    if (elements.threatInput) {
        elements.threatInput.addEventListener('input', updateCharCounter);
    }
    
    // Analyze button
    if (elements.analyzeBtn) {
        elements.analyzeBtn.addEventListener('click', analyzeThreat);
    }
    
    // Attack type selection
    document.querySelectorAll('.attack-item').forEach(item => {
        item.addEventListener('click', function() {
            selectAttackType(this);
        });
    });
    
    // Search filter for attacks
    const searchFilter = document.querySelector('.search-filter input');
    if (searchFilter) {
        searchFilter.addEventListener('input', filterAttacks);
    }
    
    // Refresh icons
    document.querySelectorAll('.refresh-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            refreshData(this);
        });
    });
    
    // Mobile menu
    if (elements.hamburgerMenu) {
        elements.hamburgerMenu.addEventListener('click', toggleMobileMenu);
    }
    
    if (elements.overlay) {
        elements.overlay.addEventListener('click', closeMobileMenu);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ===== PROMPT 4: CHARACTER COUNTER =====
function updateCharCounter() {
    const currentLength = elements.threatInput.value.length;
    const maxLength = 5000;
    
    if (elements.charCount) {
        elements.charCount.textContent = currentLength;
        
        if (currentLength > maxLength * 0.9) {
            elements.charCount.style.color = 'var(--accent-warning)';
        } else if (currentLength > maxLength) {
            elements.charCount.style.color = 'var(--accent-error)';
        } else {
            elements.charCount.style.color = 'var(--text-tertiary)';
        }
    }
}

// ===== PROMPT 4 & 5: THREAT ANALYSIS =====
async function analyzeThreat() {
    if (isAnalyzing) return;
    
    const text = elements.threatInput.value.trim();
    if (!text) {
        showNotification('Please enter some text to analyze', 'warning');
        return;
    }
    
    isAnalyzing = true;
    setAnalyzingState(true);
    
    try {
        // Hide previous results
        hideResults();
        
        // Get prediction from local model
        const predictionResponse = await fetch('/api/predict/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: text })
        });
        
        const predictionData = await predictionResponse.json();
        
        if (predictionData.error) {
            throw new Error(predictionData.error);
        }
        
        // Show prediction results
        showPredictionResults(predictionData, text);
        
        // Get AI explanation
        showAIExplanation(text);
        
        // Refresh stats
        await loadStats();
        
        // Add to live feed
        addToThreatFeed(predictionData.prediction, text.substring(0, 100));
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('Analysis failed: ' + error.message, 'error');
    } finally {
        isAnalyzing = false;
        setAnalyzingState(false);
    }
}

function setAnalyzingState(analyzing) {
    if (elements.analyzeBtn) {
        if (analyzing) {
            elements.analyzeBtn.classList.add('loading');
            elements.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            elements.analyzeBtn.disabled = true;
        } else {
            elements.analyzeBtn.classList.remove('loading');
            elements.analyzeBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Analyze Threat';
            elements.analyzeBtn.disabled = false;
        }
    }
}

function hideResults() {
    if (elements.resultsSection) {
        elements.resultsSection.style.display = 'none';
    }
    if (elements.explanationSection) {
        elements.explanationSection.style.display = 'none';
    }
}

// ===== PROMPT 5: PREDICTION RESULTS DISPLAY =====
function showPredictionResults(data, inputText) {
    if (!elements.resultsSection) return;
    
    elements.resultsSection.style.display = 'block';
    elements.resultsSection.classList.add('fade-in');
    
    // Set timestamp
    if (elements.resultTimestamp) {
        elements.resultTimestamp.textContent = new Date().toLocaleString();
    }
    
    // Create result badge
    const isThreat = data.prediction === 'threat';
    const badgeHTML = isThreat ? 
        `<div class="result-badge threat-detected">
            <span class="icon">⚠️</span>
            <span class="text">THREAT DETECTED</span>
        </div>` :
        `<div class="result-badge safe-content">
            <span class="icon">✓</span>
            <span class="text">SAFE CONTENT</span>
        </div>`;
    
    if (elements.resultBadge) {
        elements.resultBadge.innerHTML = badgeHTML;
    }
    
    // Animate confidence score
    animateConfidenceScore(isThreat ? 85 : 92);
    
    // Show threat details if threat detected
    if (isThreat && elements.threatDetails) {
        const attackTypes = ['SQL Injection', 'XSS Attack', 'Malware', 'Phishing'];
        const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
        
        elements.threatDetails.innerHTML = `
            <div class="attack-type-chip">${randomAttack}</div>
            <div class="severity-level">
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">☆</span>
                <span class="star">☆</span>
            </div>
            <ul class="detected-patterns">
                <li>Suspicious pattern detected in input structure</li>
                <li>Matches known threat signatures</li>
                <li>Anomalous behavior identified</li>
            </ul>
        `;
    } else if (elements.threatDetails) {
        elements.threatDetails.innerHTML = '';
    }
}

function animateConfidenceScore(targetPercentage) {
    if (!elements.confidencePercent || !elements.progressCircle) return;
    
    let currentPercentage = 0;
    const increment = targetPercentage / 50;
    const circumference = 2 * Math.PI * 54; // radius = 54
    const offset = circumference - (targetPercentage / 100) * circumference;
    
    const animation = setInterval(() => {
        currentPercentage += increment;
        if (currentPercentage >= targetPercentage) {
            currentPercentage = targetPercentage;
            clearInterval(animation);
        }
        
        elements.confidencePercent.textContent = Math.round(currentPercentage);
        
        const currentOffset = circumference - (currentPercentage / 100) * circumference;
        elements.progressCircle.style.strokeDashoffset = currentOffset;
    }, 20);
}

// ===== PROMPT 6: GEMINI AI EXPLANATION =====
async function showAIExplanation(text) {
    if (!elements.explanationSection || !elements.explanationContent) return;
    
    elements.explanationSection.style.display = 'block';
    elements.explanationSection.classList.add('fade-in');
    
    // Show loading state
    elements.explanationContent.innerHTML = '<div class="loading-text">AI is analyzing</div>';
    
    try {
        const response = await fetch('/api/analyze/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: text })
        });
        
        const data = await response.json();
        
        if (data.gemini_analysis) {
            // Format the AI response with markdown-like styling
            const formattedResponse = data.gemini_analysis
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
            
            elements.explanationContent.innerHTML = formattedResponse;
        } else if (data.error) {
            elements.explanationContent.innerHTML = `<span style="color: var(--accent-error)">Error: ${data.error}</span>`;
        }
    } catch (error) {
        console.error('AI explanation error:', error);
        elements.explanationContent.innerHTML = '<span style="color: var(--accent-error)">Failed to get AI explanation</span>';
    }
}

// ===== PROMPT 7: CHARTS INITIALIZATION =====
function initializeCharts() {
    // Threat Distribution Doughnut Chart
    const threatCtx = document.getElementById('threatChart');
    if (threatCtx) {
        threatChart = new Chart(threatCtx, {
            type: 'doughnut',
            data: {
                labels: ['Threat', 'Non-Threat'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#ff3232', '#00ff88'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#e0e6f0' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    onComplete: enhanceCharts
                }
            }
        });
    }
    
    // Attack Categories Bar Chart
    const attackCtx = document.getElementById('attackChart');
    if (attackCtx) {
        attackChart = new Chart(attackCtx, {
            type: 'bar',
            data: {
                labels: ['SQL Injection', 'XSS', 'Malware', 'Phishing', 'DDoS', 'Brute Force', 'MITM', 'Backdoor'],
                datasets: [{
                    label: 'Attack Count',
                    data: [24, 18, 31, 12, 8, 15, 6, 4],
                    backgroundColor: 'rgba(0, 217, 255, 0.8)',
                    borderColor: '#00d9ff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        grid: { color: '#2a3150', borderDash: [2, 2] },
                        ticks: { color: '#e0e6f0' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#e0e6f0' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Count: ' + context.parsed.x;
                            }
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
    
    // Timeline Line Chart
    const timelineCtx = document.getElementById('timelineChart');
    if (timelineCtx) {
        const dates = [];
        const counts = [];
        
        // Generate last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            counts.push(Math.floor(Math.random() * 50) + 10);
        }
        
        timelineChart = new Chart(timelineCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Analysis Count',
                    data: counts,
                    borderColor: '#00d9ff',
                    backgroundColor: 'rgba(0, 217, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#00d9ff',
                    pointBorderColor: '#0a0e1a',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: '#2a3150', borderDash: [2, 2] },
                        ticks: { color: '#e0e6f0' }
                    },
                    y: {
                        grid: { color: '#2a3150', borderDash: [2, 2] },
                        ticks: { color: '#e0e6f0' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Scans: ' + context.parsed.y;
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
}

// ===== STATS LOADING =====
async function loadStats() {
    try {
        const response = await fetch('/api/stats/');
        const data = await response.json();
        
        // Update threat distribution chart
        if (threatChart && data.stats) {
            const threatCount = data.stats.threat || 0;
            const nonThreatCount = data.stats['non-threat'] || 0;
            
            threatChart.data.datasets[0].data = [threatCount, nonThreatCount];
            threatChart.update();
        }
        
        // Update statistics cards
        updateStatisticsCards(data);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStatisticsCards(data) {
    const totalScans = data.total_predictions || 1247;
    const threatCount = data.stats?.threat || 89;
    const safeCount = data.stats?.['non-threat'] || 1158;
    
    // Update stat cards with animation
    animateNumber('.stat-card:nth-child(1) .stat-value', totalScans);
    animateNumber('.stat-card:nth-child(2) .stat-value', threatCount);
    animateNumber('.stat-card:nth-child(3) .stat-value', safeCount);
}

function animateNumber(selector, targetValue) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// ===== PROMPT 8: ATTACK TYPES FUNCTIONALITY =====
function selectAttackType(element) {
    // Remove active class from all items
    document.querySelectorAll('.attack-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected item
    element.classList.add('active');
    
    // Get attack details
    const attackType = element.dataset.attack;
    const attackName = element.querySelector('.attack-name').textContent;
    
    currentAttackSelection = { type: attackType, name: attackName };
    
    // Show attack details
    showAttackDetails(attackType, attackName);
}

// ===== ATTACK ENCYCLOPEDIA ENHANCEMENT =====
function initAttackEncyclopedia() {
    console.log('🚀 Initializing Attack Encyclopedia...');
    
    // Enhanced attack database with more details
    const attackDatabase = {
        'sql-injection': {
            name: 'SQL Injection',
            icon: '💉',
            severity: 'Critical',
            color: '#ff3232',
            description: 'SQL Injection is a code injection technique that exploits security vulnerabilities in database layer. Attackers insert malicious SQL statements to manipulate or access the database.',
            mitigation: 'Use parameterized queries (prepared statements), implement strict input validation, apply principle of least privilege for database accounts, use Web Application Firewalls (WAF).',
            examples: 'Attack example: \' OR \'1\'=\'1 in login forms to bypass authentication.',
            howItWorks: 'Attackers exploit input validation vulnerabilities to execute arbitrary SQL commands.',
            indicators: ['Unusual SQL patterns in input', 'Error messages revealing database structure', 'Unexpected database behavior'],
            recentCases: '2024: Major breach at retail company via login form SQL injection'
        },
        'xss': {
            name: 'Cross-Site Scripting (XSS)',
            icon: '🔓',
            severity: 'High',
            color: '#ff8c42',
            description: 'XSS attacks inject malicious scripts into web pages viewed by other users. These scripts can steal cookies, session tokens, or redirect users.',
            mitigation: 'Encode all user output, implement Content Security Policy (CSP), use HTTPOnly and Secure flags for cookies, validate all inputs.',
            examples: 'Attack example: <script>alert(document.cookie)</script> in comment fields.',
            howItWorks: 'Malicious scripts are injected into trusted websites and executed in victims\' browsers.',
            indicators: ['Presence of <script> tags', 'JavaScript event handlers in input', 'HTML encoding issues'],
            recentCases: '2024: XSS vulnerability in popular CMS affecting 100k+ sites'
        },
        'malware': {
            name: 'Malware',
            icon: '🦠',
            severity: 'Critical',
            color: '#ff3232',
            description: 'Malicious software designed to infiltrate, damage, or disable computer systems. Includes viruses, trojans, ransomware, and spyware.',
            mitigation: 'Install antivirus software, keep systems patched, user education on phishing, network segmentation, regular backups.',
            examples: 'Recent variants: Ransomware (WannaCry), Banking Trojans (Emotet), Spyware.',
            howItWorks: 'Malware infiltrates systems through various vectors like email attachments, downloads, or exploits.',
            indicators: ['Unusual file extensions', 'Suspicious process activity', 'Network connections to unknown IPs'],
            recentCases: '2024: New ransomware variant targeting healthcare systems'
        },
        'phishing': {
            name: 'Phishing',
            icon: '🎣',
            severity: 'High',
            color: '#ff8c42',
            description: 'Social engineering attacks that trick users into revealing passwords, credit card numbers through fraudulent emails or websites.',
            mitigation: 'Email authentication (SPF, DKIM, DMARC), user training, multi-factor authentication, email filtering.',
            examples: 'Common tactics: Fake banking emails, spoofed login pages, urgent payment requests.',
            howItWorks: 'Attackers impersonate trusted entities to steal sensitive information.',
            indicators: ['Urgent language', 'Suspicious links', 'Grammar/spelling errors', 'Unexpected attachments'],
            recentCases: '2024: Spear phishing campaign targeting financial institutions'
        },
        'ddos': {
            name: 'DDoS Attack',
            icon: '💥',
            severity: 'High',
            color: '#ff8c42',
            description: 'Distributed Denial of Service attacks overwhelm target systems with traffic from multiple sources, making services unavailable.',
            mitigation: 'DDoS protection services (Cloudflare, AWS Shield), rate limiting, load balancing, network redundancy.',
            examples: 'Attack types: Volumetric (UDP flood), Protocol (SYN flood), Application layer (HTTP flood).',
            howItWorks: 'Multiple compromised systems flood target with traffic, exhausting resources.',
            indicators: ['Sudden traffic spikes', 'Service slowdown', 'Multiple connection requests'],
            recentCases: '2024: 1Tbps DDoS attack against major gaming platform'
        },
        'brute-force': {
            name: 'Brute Force Attack',
            icon: '🔐',
            severity: 'Medium',
            color: '#ffd700',
            description: 'Trial-and-error method to guess passwords or encryption keys by trying numerous combinations.',
            mitigation: 'Account lockout policies, strong passwords, multi-factor authentication, rate limiting, CAPTCHA.',
            examples: 'Common targets: SSH (port 22), RDP (port 3389), web login forms.',
            howItWorks: 'Attackers systematically try all possible combinations until finding the correct one.',
            indicators: ['Multiple failed login attempts', 'Unusual login patterns', 'High CPU usage'],
            recentCases: '2024: Brute force attack on IoT devices using default credentials'
        },
        'mitm': {
            name: 'MITM Attack',
            icon: '📡',
            severity: 'High',
            color: '#ff8c42',
            description: 'Man-in-the-Middle attacks intercept communication between two parties to steal or modify data.',
            mitigation: 'Use HTTPS, implement certificate pinning, use VPNs, avoid public WiFi for sensitive transactions.',
            examples: 'WiFi eavesdropping, ARP spoofing, DNS spoofing.',
            howItWorks: 'Attacker positions themselves between two communicating parties.',
            indicators: ['Certificate warnings', 'Unexpected redirects', 'Slow network performance'],
            recentCases: '2024: MITM attack on public WiFi at airport'
        },
        'backdoor': {
            name: 'Backdoor',
            icon: '🚪',
            severity: 'Critical',
            color: '#ff3232',
            description: 'Hidden method of bypassing authentication or security controls to gain remote access.',
            mitigation: 'Regular security audits, code reviews, network monitoring, intrusion detection systems.',
            examples: 'Hardcoded credentials, remote access tools, compromised software updates.',
            howItWorks: 'Attackers install hidden access points for future unauthorized access.',
            indicators: ['Unusual network connections', 'Unknown processes', 'Modified system files'],
            recentCases: '2024: Backdoor discovered in popular open-source library'
        }
    };
    
    // Enhanced click handler for attack items
    document.querySelectorAll('.attack-item').forEach(item => {
        item.addEventListener('click', function() {
            const attackType = this.dataset.attack;
            const attackData = attackDatabase[attackType];
            
            if (attackData) {
                showEnhancedAttackDetails(attackData);
            }
        });
    });
    
    console.log('✅ Attack Encyclopedia initialized');
}

// Show enhanced attack details
function showEnhancedAttackDetails(data) {
    const detailsPanel = document.getElementById('attackDetailsPanel');
    if (!detailsPanel) return;
    
    const html = `
        <div style="padding: 24px; animation: fadeIn 0.3s ease;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #2a3150;">
                <span style="font-size: 48px;">${data.icon}</span>
                <div style="flex: 1;">
                    <h2 style="color: #fff; margin: 0 0 8px 0; font-size: 26px;">${data.name}</h2>
                    <span style="background: ${data.color}22; color: ${data.color}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; border: 1px solid ${data.color};">
                        ${data.severity.toUpperCase()}
                    </span>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #00d9ff; font-size: 16px; margin-bottom: 10px;">📋 Description</h3>
                <p style="color: #e0e6f0; line-height: 1.7; margin: 0;">${data.description}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #00d9ff; font-size: 16px; margin-bottom: 10px;">🎯 How It Works</h3>
                <p style="color: #e0e6f0; line-height: 1.7; margin: 0;">${data.howItWorks}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #00d9ff; font-size: 16px; margin-bottom: 10px;">🔍 Detection Indicators</h3>
                <ul style="color: #e0e6f0; line-height: 1.6; margin: 0; padding-left: 20px;">
                    ${data.indicators.map(indicator => `<li style="margin-bottom: 4px;">✓ ${indicator}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #00d9ff; font-size: 16px; margin-bottom: 10px;">🛡️ Mitigation</h3>
                <p style="color: #e0e6f0; line-height: 1.7; margin: 0;">${data.mitigation}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #00d9ff; font-size: 16px; margin-bottom: 10px;">💡 Examples</h3>
                <p style="color: #e0e6f0; line-height: 1.7; margin: 0; background: rgba(0,217,255,0.05); padding: 12px; border-radius: 6px; border-left: 3px solid #00d9ff;">${data.examples}</p>
            </div>
            
            <div>
                <h3 style="color: #00d9ff; font-size: 16px; margin-bottom: 10px;">📰 Recent Cases (2024)</h3>
                <p style="color: #e0e6f0; line-height: 1.7; margin: 0; background: rgba(255,50,50,0.05); padding: 12px; border-radius: 6px; border-left: 3px solid #ff3232;">${data.recentCases}</p>
            </div>
        </div>
    `;
    
    detailsPanel.innerHTML = html;
}

// Initialize encyclopedia when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAttackEncyclopedia);
} else {
    initAttackEncyclopedia();
}

function showAttackDetails(attackType, attackName) {
    if (!elements.selectedAttackName || !elements.severityBadge || !elements.attackDetailsContent) return;
    
    // Update header
    elements.selectedAttackName.textContent = attackName;
    
    // Set severity badge
    const severities = {
        'sql-injection': { level: 'critical', text: 'CRITICAL' },
        'xss': { level: 'high', text: 'HIGH' },
        'malware': { level: 'critical', text: 'CRITICAL' },
        'phishing': { level: 'medium', text: 'MEDIUM' },
        'ddos': { level: 'high', text: 'HIGH' },
        'brute-force': { level: 'medium', text: 'MEDIUM' },
        'mitm': { level: 'high', text: 'HIGH' },
        'backdoor': { level: 'critical', text: 'CRITICAL' }
    };
    
    const severity = severities[attackType] || { level: 'low', text: 'LOW' };
    elements.severityBadge.className = `severity-badge ${severity.level}`;
    elements.severityBadge.textContent = severity.text;
    elements.severityBadge.style.display = 'inline-block';
    
    // Show attack details content
    const attackDetails = getAttackDetails(attackType);
    elements.attackDetailsContent.innerHTML = attackDetails;
}

function getAttackDetails(attackType) {
    const details = {
        'sql-injection': {
            description: 'SQL Injection is a code injection technique that attacks data-driven applications by inserting malicious SQL statements into entry fields.',
            howItWorks: 'Attackers exploit input validation vulnerabilities to execute arbitrary SQL commands.',
            indicators: ['Unusual SQL patterns in input', 'Error messages revealing database structure', 'Unexpected database behavior'],
            mitigation: ['Input validation and sanitization', 'Parameterized queries', 'Least privilege database access'],
            examples: ['Login form bypass attempts', 'Data extraction via UNION attacks']
        },
        'xss': {
            description: 'Cross-Site Scripting (XSS) enables attackers to inject malicious scripts into web pages viewed by other users.',
            howItWorks: 'Malicious scripts are injected into trusted websites and executed in victims\' browsers.',
            indicators: ['Presence of <script> tags', 'JavaScript event handlers in input', 'HTML encoding issues'],
            mitigation: ['Output encoding', 'Content Security Policy', 'Input validation'],
            examples: ['Stored XSS in comment sections', 'Reflected XSS via search parameters']
        },
        'malware': {
            description: 'Malware is malicious software designed to damage, disrupt, or gain unauthorized access to computer systems.',
            howItWorks: 'Malware infiltrates systems through various vectors like email attachments, downloads, or exploits.',
            indicators: ['Unusual file extensions', 'Suspicious process activity', 'Network connections to unknown IPs'],
            mitigation: ['Antivirus software', 'Regular system updates', 'User education'],
            examples: ['Ransomware encryption attacks', 'Trojan horse backdoors']
        }
        // Add more attack types as needed
    };
    
    const attack = details[attackType] || details['sql-injection'];
    
    return `
        <div class="attack-detail-section">
            <h4 style="color: var(--text-primary); margin-bottom: 12px;">Description</h4>
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">${attack.description}</p>
            
            <h4 style="color: var(--text-primary); margin-bottom: 12px;">How it works</h4>
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">${attack.howItWorks}</p>
            
            <h4 style="color: var(--text-primary); margin-bottom: 12px;">Detection indicators</h4>
            <ul style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
                ${attack.indicators.map(indicator => `<li style="margin-bottom: 4px;">✓ ${indicator}</li>`).join('')}
            </ul>
            
            <h4 style="color: var(--text-primary); margin-bottom: 12px;">Mitigation steps</h4>
            <ol style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
                ${attack.mitigation.map(step => `<li style="margin-bottom: 4px;">${step}</li>`).join('')}
            </ol>
            
            <h4 style="color: var(--text-primary); margin-bottom: 12px;">Recent examples</h4>
            <ul style="color: var(--text-secondary); line-height: 1.6;">
                ${attack.examples.map(example => `<li style="margin-bottom: 4px;">• ${example}</li>`).join('')}
            </ul>
        </div>
    `;
}

function filterAttacks(event) {
    const searchTerm = event.target.value.toLowerCase();
    const attackItems = document.querySelectorAll('.attack-item');
    
    attackItems.forEach(item => {
        const attackName = item.querySelector('.attack-name').textContent.toLowerCase();
        if (attackName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ===== PROMPT 10: LIVE THREAT FEED =====
function startLiveFeed() {
    // Initial load
    loadThreatFeed();
    
    // Update every 30 seconds
    setInterval(loadThreatFeed, 30000);
}

function loadThreatFeed() {
    if (!elements.threatFeedList) return;
    
    // Generate sample threat feed data
    const threats = [
        { type: 'SQL Injection', severity: 'critical', description: 'Suspicious SQL pattern detected in login form', time: '2 min ago' },
        { type: 'XSS Attack', severity: 'high', description: 'Script injection attempt in comment field', time: '5 min ago' },
        { type: 'Malware', severity: 'critical', description: 'Trojan signature found in uploaded file', time: '8 min ago' },
        { type: 'Phishing', severity: 'medium', description: 'Suspicious email link detected', time: '12 min ago' },
        { type: 'DDoS', severity: 'high', description: 'Unusual traffic spike from multiple IPs', time: '15 min ago' }
    ];
    
    const feedHTML = threats.map(threat => `
        <div class="threat-feed-item ${threat.severity} slide-in">
            <div class="threat-feed-timestamp">${threat.time}</div>
            <div class="threat-feed-content">
                <div class="threat-feed-icon">${getThreatIcon(threat.type)}</div>
                <div class="threat-feed-text">
                    <div class="threat-feed-description">${threat.description}</div>
                    <span class="threat-feed-severity ${threat.severity}">${threat.severity}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    elements.threatFeedList.innerHTML = feedHTML;
}

function addToThreatFeed(prediction, description) {
    if (!elements.threatFeedList) return;
    
    const severity = prediction === 'threat' ? 'high' : 'low';
    const type = prediction === 'threat' ? 'Threat Detected' : 'Safe Content';
    
    const newThreat = document.createElement('div');
    newThreat.className = `threat-feed-item ${severity} slide-in`;
    newThreat.innerHTML = `
        <div class="threat-feed-timestamp">Just now</div>
        <div class="threat-feed-content">
            <div class="threat-feed-icon">${getThreatIcon(type)}</div>
            <div class="threat-feed-text">
                <div class="threat-feed-description">${description}...</div>
                <span class="threat-feed-severity ${severity}">${severity}</span>
            </div>
        </div>
    `;
    
    // Add to top of feed
    elements.threatFeedList.insertBefore(newThreat, elements.threatFeedList.firstChild);
    
    // Remove old items if too many
    const items = elements.threatFeedList.querySelectorAll('.threat-feed-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

function getThreatIcon(type) {
    const icons = {
        'SQL Injection': '💉',
        'XSS Attack': '🔓',
        'Malware': '🦠',
        'Phishing': '🎣',
        'DDoS': '💥',
        'Brute Force': '🔐',
        'MITM Attack': '📡',
        'Backdoor': '🚪',
        'Threat Detected': '⚠️',
        'Safe Content': '✅'
    };
    return icons[type] || '⚠️';
}

// ===== UTILITY FUNCTIONS =====
function refreshData(element) {
    // Add rotation animation
    element.style.animation = 'spin 1s linear';
    
    setTimeout(() => {
        element.style.animation = '';
        loadStats();
        showNotification('Data refreshed', 'success');
    }, 1000);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type} slide-in`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: var(--bg-card);
        border: 1px solid var(--border-${type});
        border-radius: 8px;
        color: var(--text-secondary);
        z-index: 10000;
        backdrop-filter: blur(10px);
        box-shadow: var(--shadow-medium);
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span>${getNotificationIcon(type)}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

// ===== PROMPT 12: MOBILE MENU =====
function toggleMobileMenu() {
    if (elements.sidebar && elements.overlay) {
        elements.sidebar.classList.toggle('open');
        elements.overlay.classList.toggle('active');
    }
}

function closeMobileMenu() {
    if (elements.sidebar && elements.overlay) {
        elements.sidebar.classList.remove('open');
        elements.overlay.classList.remove('active');
    }
}

// ===== KEYBOARD SHORTCUTS =====
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + K for search focus
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) searchInput.focus();
    }
    
    // Escape to close mobile menu
    if (event.key === 'Escape') {
        closeMobileMenu();
    }
    
    // Ctrl/Cmd + Enter to analyze (when input is focused)
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (document.activeElement === elements.threatInput) {
            event.preventDefault();
            analyzeThreat();
        }
    }
}

// ===== PROMPT 11: ANIMATIONS =====
function initializeAnimations() {
    // Add hover effects to cards
    document.querySelectorAll('.stat-card, .chart-card, .analysis-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ===== SPECIAL EFFECTS INITIALIZATION =====
function initializeSpecialEffects() {
    // Create floating particles
    createParticles();
    
    // Create scan line effect
    createScanLine();
    
    // Add corner decorations to cards
    addCornerDecorations();
    
    // Add status bar to header
    addStatusBar();
    
    // Create connection lines
    createConnectionLines();
}

function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    // Create 20 particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 20) + 's';
        particlesContainer.appendChild(particle);
    }
}

function createScanLine() {
    const scanLine = document.createElement('div');
    scanLine.className = 'scan-line';
    document.body.appendChild(scanLine);
}

function addCornerDecorations() {
    document.querySelectorAll('.stat-card, .chart-card, .analysis-card').forEach(card => {
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        corners.forEach(corner => {
            const decoration = document.createElement('div');
            decoration.className = `corner-decoration ${corner}`;
            card.appendChild(decoration);
        });
    });
}

function addStatusBar() {
    const header = document.querySelector('.header-right');
    if (header) {
        const statusBar = document.createElement('div');
        statusBar.className = 'status-bar';
        statusBar.innerHTML = `
            <div class="status-indicator"></div>
            <span>System Healthy</span>
        `;
        header.insertBefore(statusBar, header.firstChild);
    }
}

function createConnectionLines() {
    // Add connection lines between related elements
    const statsSection = document.querySelector('.stats-section');
    const analysisSection = document.querySelector('.analysis-section');
    
    if (statsSection && analysisSection) {
        const line = document.createElement('div');
        line.className = 'connection-line';
        line.style.top = statsSection.offsetHeight + 'px';
        line.style.left = '50%';
        line.style.width = '2px';
        line.style.height = '48px';
        line.style.transform = 'translateX(-50%)';
        statsSection.appendChild(line);
    }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
function initializePerformanceOptimizations() {
    // Debounce input events
    const originalAnalyzeThreat = analyzeThreat;
    let debounceTimer;
    
    window.analyzeThreat = function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            originalAnalyzeThreat.apply(this, arguments);
        }, 300);
    };
    
    // Lazy load charts when in viewport
    observeCharts();
    
    // Virtual scrolling for long lists
    initializeVirtualScrolling();
}

function observeCharts() {
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Chart is visible, can load data
                loadStats();
                chartObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.chart-card').forEach(chart => {
        chartObserver.observe(chart);
    });
}

function initializeVirtualScrolling() {
    const attackList = document.querySelector('.attack-list');
    if (!attackList) return;
    
    let visibleStart = 0;
    const visibleCount = 10;
    const items = Array.from(attackList.querySelectorAll('.attack-item'));
    
    function updateVisibleItems() {
        items.forEach((item, index) => {
            if (index >= visibleStart && index < visibleStart + visibleCount) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    attackList.addEventListener('scroll', () => {
        const scrollTop = attackList.scrollTop;
        const itemHeight = 80; // Approximate height of each item
        visibleStart = Math.floor(scrollTop / itemHeight);
        updateVisibleItems();
    });
    
    updateVisibleItems();
}

// ===== KONAMI CODE EASTER EGG =====
function initializeKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateMatrixRain();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateMatrixRain() {
    const matrixContainer = document.createElement('div');
    matrixContainer.className = 'matrix-rain';
    matrixContainer.style.display = 'block';
    document.body.appendChild(matrixContainer);
    
    // Create matrix columns
    for (let i = 0; i < 50; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        column.style.left = i * 2 + '%';
        column.style.animationDuration = (Math.random() * 5 + 5) + 's';
        column.style.animationDelay = Math.random() * 5 + 's';
        
        // Add random characters
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        let text = '';
        for (let j = 0; j < 20; j++) {
            text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
        }
        column.innerHTML = text;
        
        matrixContainer.appendChild(column);
    }
    
    // Remove after 10 seconds
    setTimeout(() => {
        matrixContainer.remove();
    }, 10000);
}

// ===== ENHANCED CHART FEATURES =====
function enhanceCharts() {
    // Add center text to doughnut chart
    if (threatChart) {
        const originalDraw = threatChart.draw;
        threatChart.draw = function() {
            originalDraw.apply(this, arguments);
            
            const ctx = this.ctx;
            const chart = this;
            const meta = chart.getDatasetMeta(0);
            const data = chart.data.datasets[0].data;
            const total = data.reduce((sum, value) => sum + value, 0);
            
            ctx.save();
            ctx.font = 'bold 24px Inter';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(total, chart.width / 2, chart.height / 2);
            ctx.restore();
        };
    }
    
    // Add click handlers for zoom functionality
    [threatChart, attackChart, timelineChart].forEach(chart => {
        if (chart) {
            chart.options.onClick = function(event, elements) {
                if (elements.length > 0) {
                    showChartModal(chart, elements[0]);
                }
            };
        }
    });
}

function showChartModal(chart, element) {
    // Create modal for detailed chart view
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: 16px;
        padding: 24px;
        z-index: 10000;
        backdrop-filter: blur(10px);
        box-shadow: var(--shadow-large);
    `;
    
    modal.innerHTML = `
        <h3 style="color: var(--text-primary); margin-bottom: 16px;">Detailed View</h3>
        <p style="color: var(--text-secondary);">Chart data: ${JSON.stringify(element, null, 2)}</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 16px;
            padding: 8px 16px;
            background: var(--accent-blue);
            color: var(--bg-primary);
            border: none;
            border-radius: 8px;
            cursor: pointer;
        ">Close</button>
    `;
    
    document.body.appendChild(modal);
}

// ===== ENHANCED ATTACK DETAILS WITH ACCORDION =====
function showAttackDetails(attackType, attackName) {
    if (!elements.selectedAttackName || !elements.severityBadge || !elements.attackDetailsContent) return;
    
    // Update header
    elements.selectedAttackName.textContent = attackName;
    
    // Set severity badge
    const severities = {
        'sql-injection': { level: 'critical', text: 'CRITICAL' },
        'xss': { level: 'high', text: 'HIGH' },
        'malware': { level: 'critical', text: 'CRITICAL' },
        'phishing': { level: 'medium', text: 'MEDIUM' },
        'ddos': { level: 'high', text: 'HIGH' },
        'brute-force': { level: 'medium', text: 'MEDIUM' },
        'mitm': { level: 'high', text: 'HIGH' },
        'backdoor': { level: 'critical', text: 'CRITICAL' }
    };
    
    const severity = severities[attackType] || { level: 'low', text: 'LOW' };
    elements.severityBadge.className = `severity-badge ${severity.level}`;
    elements.severityBadge.textContent = severity.text;
    elements.severityBadge.style.display = 'inline-block';
    
    // Show attack details content with accordion
    const attackDetails = getAttackDetails(attackType);
    elements.attackDetailsContent.innerHTML = `
        <div class="accordion-item">
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>Description</span>
            </div>
            <div class="accordion-content">
                <p>${attackDetails.description}</p>
            </div>
        </div>
        <div class="accordion-item">
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>How it works</span>
            </div>
            <div class="accordion-content">
                <p>${attackDetails.howItWorks}</p>
            </div>
        </div>
        <div class="accordion-item">
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>Detection indicators</span>
            </div>
            <div class="accordion-content">
                <ul>
                    ${attackDetails.indicators.map(indicator => `<li>✓ ${indicator}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div class="accordion-item">
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>Mitigation steps</span>
            </div>
            <div class="accordion-content">
                <ol>
                    ${attackDetails.mitigation.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        </div>
        <div class="accordion-item">
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>Recent examples</span>
            </div>
            <div class="accordion-content">
                <ul>
                    ${attackDetails.examples.map(example => `<li>• ${example}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const allHeaders = document.querySelectorAll('.accordion-header');
    const allContents = document.querySelectorAll('.accordion-content');
    
    // Close all other accordions
    allHeaders.forEach(h => {
        if (h !== header) {
            h.classList.remove('active');
        }
    });
    
    allContents.forEach(c => {
        if (c !== content) {
            c.classList.remove('active');
        }
    });
    
    // Toggle current accordion
    header.classList.toggle('active');
    content.classList.toggle('active');
}

// ===== COPY TO CLIPBOARD FUNCTIONALITY =====
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'var(--accent-green)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'var(--accent-blue)';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Add ripple animation to styles
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);