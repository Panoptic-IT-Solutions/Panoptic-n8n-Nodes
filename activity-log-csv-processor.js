// Activity Log CSV Processor
// Processes Datto RMM Activity Log data and converts to CSV format

const items = $input.all();
const activityData = [];

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Helper function to escape CSV values
function escapeCSVValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);

    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }

    return stringValue;
}

// Process each activity log item
items.forEach(item => {
    const activity = item.json;

    // Create clean activity record for CSV
    const activityRecord = {
        'Activity Time': formatDate(activity.activityTime),
        'Activity Type': activity.activityType || 'Unknown',
        'Device Name': activity.deviceName || 'N/A',
        'Site Name': activity.siteName || 'N/A',
        'User Name': activity.userName || 'N/A',
        'Message': activity.message || '',
        'Status': activity.status || 'N/A',
        'Severity': activity.severity || 'N/A',
        'Priority': activity.priority || 'N/A',
        'Result': activity.activityResult || 'N/A',
        'Device ID': activity.deviceId || 'N/A',
        'Site ID': activity.siteId || 'N/A',
        'User ID': activity.userId || 'N/A',
        'Alert Type': activity.data?.alertType || 'N/A',
        'Alert Category': activity.data?.alertCategory || 'N/A',
        'Device Type': activity.data?.deviceType || 'N/A',
        'Operating System': activity.data?.operatingSystem || 'N/A',
        'IP Address': activity.data?.ipAddress || 'N/A',
        'Last Seen': formatDate(activity.data?.lastSeen) || 'N/A'
    };

    activityData.push(activityRecord);
});

// Sort by activity time (most recent first)
activityData.sort((a, b) => new Date(b['Activity Time']) - new Date(a['Activity Time']));

// Generate CSV content
const headers = Object.keys(activityData[0] || {});
let csvContent = '';

// Add header row
csvContent += headers.map(header => escapeCSVValue(header)).join(',') + '\n';

// Add data rows
activityData.forEach(record => {
    const csvRow = headers.map(header => escapeCSVValue(record[header])).join(',');
    csvContent += csvRow + '\n';
});

// Generate filename with timestamp
const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
const filename = `Crawford_Activity_Log_${timestamp}.csv`;

// Create buffer for attachment
const csvBuffer = Buffer.from(csvContent, 'utf8');

// Generate summary for email
const totalActivities = activityData.length;
const activityTypes = [...new Set(activityData.map(a => a['Activity Type']))];
const devices = [...new Set(activityData.map(a => a['Device Name']).filter(name => name !== 'N/A'))];
const sites = [...new Set(activityData.map(a => a['Site Name']).filter(name => name !== 'N/A'))];

const emailSummary = `
Crawford Activity Log Report
Generated: ${new Date().toLocaleString()}

=== SUMMARY ===
Total Activities: ${totalActivities}
Unique Devices: ${devices.length}
Unique Sites: ${sites.length}
Activity Types: ${activityTypes.join(', ')}

=== RECENT ACTIVITIES ===
${activityData.slice(0, 10).map(activity =>
    `${activity['Activity Time']} - ${activity['Device Name']}: ${activity['Message']}`
).join('\n')}

${totalActivities > 10 ? `\n... and ${totalActivities - 10} more activities (see attached CSV for full details)` : ''}

---
Detailed activity log data is attached as CSV file.
`;

// Return processed data
return [{
    json: {
        filename: filename,
        csvContent: csvContent,
        emailSummary: emailSummary,
        totalActivities: totalActivities,
        activityTypes: activityTypes,
        uniqueDevices: devices.length,
        uniqueSites: sites.length,
        reportDate: new Date().toISOString()
    },
    binary: {
        activityLogCSV: {
            data: csvBuffer.toString('base64'),
            mimeType: 'text/csv',
            fileName: filename
        }
    }
}];
