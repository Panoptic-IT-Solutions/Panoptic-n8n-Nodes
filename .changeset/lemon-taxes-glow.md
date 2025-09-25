---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": minor
---

Add enhanced user login/logout detection and device online/offline tracking

- **NEW**: User login detection from audit logs and alerts using advanced pattern matching
- **NEW**: User logout detection with comprehensive logout event patterns  
- **NEW**: Failed login attempt detection for security monitoring
- **NEW**: User account change tracking (creation, deletion, modification)
- **NEW**: Device online/offline event detection separate from general device status
- **NEW**: Activity type filtering options: user_login, user_logout, failed_login, user_account_change, device_online, device_offline
- **ENHANCED**: Search functionality now detects login/logout patterns across multiple data sources
- **ENHANCED**: Audit change log processing with intelligent activity type classification
- **ENHANCED**: Alert processing with login/logout pattern recognition
- **IMPROVED**: Windows Event ID detection (4624 successful logon, 4625 failed logon, 4634/4647 logoff)
- **IMPROVED**: RDP connection/disconnection detection
- **IMPROVED**: Terminal Services login/logout detection  
- **IMPROVED**: Interactive logon/logoff event detection

This enhancement provides comprehensive user activity monitoring by analyzing:
- Audit change logs for user session events
- Alert messages for authentication activities  
- Windows security event IDs embedded in logs
- RDP and Terminal Services connection events
- Interactive desktop login/logout activities
- Failed authentication attempts for security monitoring

Users can now track both device connectivity (online/offline) and user activity (login/logout) in the same workflow, providing complete visibility into computer and user session management.