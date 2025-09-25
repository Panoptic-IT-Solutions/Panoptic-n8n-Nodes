// Crawford Sign-in Audit Report Processor
// This processes device activity, audit, and sign-in data for comprehensive reporting

const items = $input.all();
const reportData = [];
const currentDate = new Date();
const reportPeriod = 30; // Last 30 days

// Helper function to format dates
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to calculate uptime percentage
function calculateUptime(lastSeen, deviceOnline) {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const hoursOffline = deviceOnline ? 0 : Math.max(0, (now - lastSeenDate) / (1000 * 60 * 60));
    const totalHours = reportPeriod * 24;
    const uptimePercentage = Math.max(0, ((totalHours - hoursOffline) / totalHours) * 100);
    return Math.round(uptimePercentage * 100) / 100; // Round to 2 decimal places
}

// Helper function to extract sign-in events from activity data
function extractSignInEvents(activities) {
    const signInEvents = [];
    const logoutEvents = [];

    if (!Array.isArray(activities)) return { signInEvents, logoutEvents };

    activities.forEach(activity => {
        const message = (activity.message || '').toLowerCase();

        // Check for sign-in/login events
        if (message.includes('login') || message.includes('logon') || message.includes('sign') ||
            message.includes('authentication') || message.includes('session start')) {
            signInEvents.push({
                time: activity.activityTime,
                user: activity.userName || activity.data?.user || 'Unknown',
                type: 'Sign In',
                details: activity.message
            });
        }

        // Check for sign-out/logout events
        if (message.includes('logout') || message.includes('logoff') || message.includes('sign out') ||
            message.includes('session end') || message.includes('disconnect')) {
            logoutEvents.push({
                time: activity.activityTime,
                user: activity.userName || activity.data?.user || 'Unknown',
                type: 'Sign Out',
                details: activity.message
            });
        }
    });

    return { signInEvents, logoutEvents };
}

// Helper function to get device risk level
function getDeviceRiskLevel(device, activities, alerts) {
    let riskScore = 0;

    // Check if device is offline
    if (!device.online) riskScore += 3;

    // Check for recent high-priority alerts
    const highPriorityAlerts = (alerts || []).filter(alert =>
        (alert.priority || '').toLowerCase() === 'high' ||
        (alert.severity || '').toLowerCase() === 'high'
    );
    riskScore += highPriorityAlerts.length;

    // Check for failed login attempts
    const failedLogins = (activities || []).filter(activity =>
        (activity.message || '').toLowerCase().includes('failed') &&
        (activity.message || '').toLowerCase().includes('login')
    );
    riskScore += failedLogins.length;

    // Check last seen time
    const lastSeenHours = device.lastSeen ?
        (new Date() - new Date(device.lastSeen)) / (1000 * 60 * 60) : 999;
    if (lastSeenHours > 48) riskScore += 2;

    // Determine risk level
    if (riskScore >= 5) return 'High';
    if (riskScore >= 2) return 'Medium';
    return 'Low';
}

// Process each item in the workflow data
items.forEach(item => {
    const data = item.json;

    // Handle different data types from the workflow
    let devices = [];
    let activities = [];
    let audits = [];
    let alerts = [];

    // Extract data based on the structure
    if (data.devices) {
        devices = Array.isArray(data.devices) ? data.devices : [data.devices];
    } else if (data.hostname || data.deviceType) {
        // Single device object
        devices = [data];
    }

    if (data.activities) {
        activities = Array.isArray(data.activities) ? data.activities : [data.activities];
    } else if (data.activityType) {
        // Single activity object
        activities = [data];
    }

    if (data.audits) {
        audits = Array.isArray(data.audits) ? data.audits : [data.audits];
    }

    if (data.alerts) {
        alerts = Array.isArray(data.alerts) ? data.alerts : [data.alerts];
    }

    // Process devices
    devices.forEach(device => {
        // Get activities for this specific device
        const deviceActivities = activities.filter(activity =>
            activity.deviceId === device.uid || activity.deviceName === device.hostname
        );

        // Get alerts for this device
        const deviceAlerts = alerts.filter(alert =>
            alert.deviceUid === device.uid
        );

        // Extract sign-in events
        const { signInEvents, logoutEvents } = extractSignInEvents(deviceActivities);

        // Calculate metrics
        const uptimePercentage = calculateUptime(device.lastSeen, device.online);
        const totalSignIns = signInEvents.length;
        const totalSignOuts = logoutEvents.length;
        const riskLevel = getDeviceRiskLevel(device, deviceActivities, deviceAlerts);

        // Get last sign-in info
        const lastSignIn = signInEvents.length > 0 ?
            signInEvents.sort((a, b) => new Date(b.time) - new Date(a.time))[0] : null;

        // Create report record
        const reportRecord = {
            // Device Information
            'Device Name': device.hostname || device.displayName || 'Unknown',
            'Device Type': device.deviceType || 'Unknown',
            'Site': device.siteName || 'Unknown',
            'IP Address': device.intIpAddress || device.extIpAddress || 'N/A',
            'Operating System': device.operatingSystem || 'Unknown',
            'Serial Number': device.serialNumber || 'N/A',

            // Status Information
            'Current Status': device.online ? 'Online' : 'Offline',
            'Last Seen': device.lastSeen ? formatDate(device.lastSeen) : 'Never',
            'Uptime %': uptimePercentage + '%',
            'Risk Level': riskLevel,

            // Sign-in Activity
            'Total Sign-ins (30d)': totalSignIns,
            'Total Sign-outs (30d)': totalSignOuts,
            'Last Sign-in User': lastSignIn ? lastSignIn.user : 'None',
            'Last Sign-in Time': lastSignIn ? formatDate(lastSignIn.time) : 'None',

            // Alert Information
            'Open Alerts': deviceAlerts.filter(a => a.alertStatus !== 'resolved').length,
            'High Priority Alerts': deviceAlerts.filter(a =>
                (a.priority || '').toLowerCase() === 'high'
            ).length,

            // System Information
            'Domain': device.domain || device.workgroup || 'N/A',
            'Antivirus Status': device.antivirus?.antivirusProductState || 'Unknown',
            'Patch Status': device.patchManagement?.patchStatus || 'Unknown',
            'Agent Version': device.agentVersion || 'Unknown',

            // Recent Activity Summary
            'Recent Activities': deviceActivities.length,
            'Recent Activity Types': [...new Set(deviceActivities.map(a => a.activityType))].join(', '),

            // Report Metadata
            'Report Date': formatDate(currentDate),
            'Report Period': `Last ${reportPeriod} days`,
            'Device UID': device.uid
        };

        reportData.push(reportRecord);
    });
});

// Sort by site name, then device name
reportData.sort((a, b) => {
    const siteCompare = (a.Site || '').localeCompare(b.Site || '');
    if (siteCompare !== 0) return siteCompare;
    return (a['Device Name'] || '').localeCompare(b['Device Name'] || '');
});

// Generate summary statistics
const totalDevices = reportData.length;
const onlineDevices = reportData.filter(d => d['Current Status'] === 'Online').length;
const offlineDevices = totalDevices - onlineDevices;
const highRiskDevices = reportData.filter(d => d['Risk Level'] === 'High').length;
const totalSignIns = reportData.reduce((sum, d) => sum + parseInt(d['Total Sign-ins (30d)']) || 0, 0);
const avgUptime = reportData.reduce((sum, d) => sum + parseFloat(d['Uptime %']) || 0, 0) / totalDevices;

// Add summary record at the beginning
const summaryRecord = {
    'Device Name': '=== SUMMARY REPORT ===',
    'Device Type': `Total Devices: ${totalDevices}`,
    'Site': `Online: ${onlineDevices} | Offline: ${offlineDevices}`,
    'IP Address': `High Risk: ${highRiskDevices}`,
    'Operating System': `Avg Uptime: ${Math.round(avgUptime * 100) / 100}%`,
    'Serial Number': `Total Sign-ins: ${totalSignIns}`,
    'Current Status': `Report Generated: ${formatDate(currentDate)}`,
    'Last Seen': '========================',
    'Uptime %': '',
    'Risk Level': '',
    'Total Sign-ins (30d)': '',
    'Total Sign-outs (30d)': '',
    'Last Sign-in User': '',
    'Last Sign-in Time': '',
    'Open Alerts': '',
    'High Priority Alerts': '',
    'Domain': '',
    'Antivirus Status': '',
    'Patch Status': '',
    'Agent Version': '',
    'Recent Activities': '',
    'Recent Activity Types': '',
    'Report Date': '',
    'Report Period': '',
    'Device UID': ''
};

// Insert summary at the beginning
reportData.unshift(summaryRecord);

// Add empty row after summary
reportData.splice(1, 0, Object.keys(summaryRecord).reduce((obj, key) => {
    obj[key] = '';
    return obj;
}, {}));

console.log(`Generated Crawford Sign-in Audit Report with ${totalDevices} devices`);
console.log(`Online: ${onlineDevices}, Offline: ${offlineDevices}, High Risk: ${highRiskDevices}`);

// Return the processed data
return reportData.map(record => ({ json: record }));
