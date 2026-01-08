# API Request/Response Logs

This directory contains log files for API requests and responses made by the web application.

## Log Files

- **`api-requests.log`** - Main log file containing all API requests, responses, and errors
- **`api-requests-{timestamp}.log`** - Rotated log files (created when main log exceeds 10MB)

## Features

- **Automatic Logging**: All API requests and responses are automatically logged in development mode
- **Log Rotation**: Log files are automatically rotated when they exceed 10MB
- **Development Only**: File logging is only enabled in development mode (not in production)
- **Batch Processing**: Logs are sent in batches to reduce server load
- **Error Priority**: Error logs are flushed immediately for faster debugging

## Log Format

Each log entry includes:
- Timestamp (ISO format)
- Request type (REQUEST/RESPONSE/ERROR)
- HTTP method and URL
- Duration (for responses)
- Status code and status text
- Headers (with sensitive data redacted)
- Request/Response data (truncated if too large)
- Error details (for errors)

## Viewing Logs

### In Browser Console
All logs are also displayed in the browser console with color coding:
- 🔵 Blue: Requests
- 🟢 Green: Successful responses
- 🔴 Red: Errors or failed responses

### In Log Files
View the log files directly:
```bash
# View latest logs
tail -f logs/api-requests.log

# Search for errors
grep ERROR logs/api-requests.log

# Search for specific endpoint
grep "/api/v1/parties" logs/api-requests.log
```

### Programmatically
Access logs in browser console:
```javascript
// Get all logs
window.__apiLogs.getLogs()

// Get error logs only
window.__apiLogs.getErrorLogs()

// Get logs summary
window.__apiLogs.getLogsSummary()

// Download logs as file
window.__apiLogs.downloadLogs()

// Flush pending logs to file
window.__apiLogs.flushLogs()
```

## Configuration

File logging is automatically enabled when:
- Running in development mode (`NODE_ENV=development`)
- OR running on localhost

To disable file logging, set `NODE_ENV=production` or run on a non-localhost domain.

## Notes

- Log files are excluded from git (see `.gitignore`)
- Logs are written asynchronously and won't block the application
- If file writing fails, the app continues normally (errors are logged to console)
- Sensitive data (like Authorization headers) is automatically redacted


