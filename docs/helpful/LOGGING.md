# Development Logging Guide

This project uses separate logging for frontend and backend development to keep console output clean and organized.

## Log Files

- `logs/frontend.log` - Vite development server output
- `logs/backend.log` - Express server output
- `backend/logs/access.log` - HTTP request logs (automatically rotated)

## Available Commands

### Development with Logs to Files (Clean Console)
```bash
npm run dev                    # Start both servers, logs to files
npm run dev:frontend          # Start only frontend, logs to file
npm run dev:backend           # Start only backend, logs to file
```

### Development with Console Output (Traditional)
```bash
npm run dev:console           # Start both servers with console output
npm run dev:frontend:console  # Start only frontend with console output
npm run dev:backend:console   # Start only backend with console output
```

### Log Monitoring
```bash
npm run logs:all              # Watch both frontend and backend logs
npm run logs:frontend         # Watch only frontend logs
npm run logs:backend          # Watch only backend logs

# Alternative using the script
./scripts/logs.sh all         # Watch both logs
./scripts/logs.sh frontend    # Watch frontend logs
./scripts/logs.sh backend     # Watch backend logs
```

## Recommended Development Workflow

### Option 1: Clean Development (Recommended)
1. Start development servers with file logging:
   ```bash
   npm run dev
   ```

2. In a separate terminal, monitor logs:
   ```bash
   npm run logs:all
   ```

### Option 2: Traditional Console Output
```bash
npm run dev:console
```

## Log Features

### Backend Logs
- **HTTP Access Logs**: Automatically written to `backend/logs/access.log`
- **Automatic Rotation**: Log files rotate when they exceed 10MB
- **Cleanup**: Only keeps the 5 most recent rotated files
- **Environment-aware**: Development shows errors in console, production logs everything to files

### Frontend Logs
- **Build Output**: Vite build information and warnings
- **Hot Reload**: File change notifications
- **Compilation Errors**: TypeScript and build errors

## File Structure
```
├── logs/
│   ├── frontend.log          # Vite output
│   └── backend.log           # Express output
├── backend/logs/
│   ├── access.log            # Current HTTP requests
│   ├── access-2025-08-05.log # Rotated logs
│   └── ...
└── scripts/
    └── logs.sh               # Log viewer script
```

## Tips

1. **Clean Development**: Use `npm run dev` for day-to-day development
2. **Debugging**: Use `npm run logs:all` to monitor both services
3. **Quick Debugging**: Use `npm run dev:console` if you need immediate console output
4. **HTTP Debugging**: Check `backend/logs/access.log` for API request details

## Log Levels

### Frontend (Vite)
- Build information
- File change notifications
- Compilation errors and warnings
- Module resolution issues

### Backend (Express)
- Server startup information
- Error messages and stack traces
- Database connection status
- Service initialization

### HTTP Access (Morgan)
- All HTTP requests (GET, POST, etc.)
- Response status codes
- Request duration
- User agent and referrer information
