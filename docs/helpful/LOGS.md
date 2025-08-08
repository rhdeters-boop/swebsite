# 📋 Logs and Debugging Guide

This guide explains how to read and monitor logs in the Void of Desire development environment.

## 🐛 Log Files Location

All development logs are stored in the `/logs/` directory:
- **Frontend logs**: `logs/frontend.log` (Vite development server)
- **Backend logs**: `logs/backend.log` (Node.js/Express server)

## 📖 Reading Log Files

**The log files contain ANSI color codes that make them hard to read in text editors. Here are the best ways to read them:**

### Option 1: Use Terminal Commands (Recommended)

**Clean, readable logs without color codes:**
```bash
# Frontend logs
cat logs/frontend.log | sed 's/\x1b\[[0-9;]*m//g'

# Backend logs  
cat logs/backend.log | sed 's/\x1b\[[0-9;]*m//g'

# Use our convenient clean log script
./scripts/clean-logs.sh
```

**Check for specific errors:**
```bash
# Frontend errors
cat logs/frontend.log | sed 's/\x1b\[[0-9;]*m//g' | grep -i error

# Backend errors  
cat logs/backend.log | sed 's/\x1b\[[0-9;]*m//g' | grep -i error
```

### Option 2: Install VS Code Extension

1. Open VS Code Extensions (Cmd+Shift+X on Mac, Ctrl+Shift+X on Windows)
2. Search for **"ANSI Colors"** by iliazeus
3. Install it
4. Reopen log files - they'll display with proper colors instead of raw codes

### Option 3: View Logs in Terminal with Colors

```bash
# Shows colors properly in terminal
cat logs/frontend.log
cat logs/backend.log

# Live monitoring with colors
tail -f logs/frontend.log
tail -f logs/backend.log
```

## 🔄 Real-time Log Monitoring

**Monitor logs in real-time as they update:**

```bash
# Frontend logs (live updates)
tail -f logs/frontend.log

# Backend logs (live updates)
tail -f logs/backend.log

# Clean live monitoring (without color codes)
tail -f logs/frontend.log | sed 's/\x1b\[[0-9;]*m//g'
tail -f logs/backend.log | sed 's/\x1b\[[0-9;]*m//g'
```

**Monitor both logs simultaneously:**
```bash
# Using our npm script
npm run logs:all

# Or manually with split terminal
tail -f logs/frontend.log & tail -f logs/backend.log
```

## 🛠️ Log Management Scripts

### Clean Log Viewer
```bash
# View recent logs without color codes
./scripts/clean-logs.sh
```

### Custom Log Commands
```bash
# Check latest 20 lines
tail -20 logs/frontend.log | sed 's/\x1b\[[0-9;]*m//g'
tail -20 logs/backend.log | sed 's/\x1b\[[0-9;]*m//g'

# Search for specific terms
grep -i "error\|warning\|fail" logs/backend.log | sed 's/\x1b\[[0-9;]*m//g'

# Check logs from last 5 minutes
find logs/ -name "*.log" -newermt "5 minutes ago" -exec tail {} \;
```

## 🔍 Common Log Patterns

### Frontend (Vite) Logs
```
VITE v7.0.5 ready in 146 ms
➜ Local: http://localhost:5173/
➜ Network: use --host to expose
```

### Backend (Node.js) Logs
```
🚀 Server running on port 5001
📱 Environment: development
🌐 CORS enabled for: http://localhost:5173
✅ Database connection established
📊 Database synced
```

### Error Patterns to Look For
- **Frontend**: `Error:`, `Failed to`, `Cannot resolve`, `404`
- **Backend**: `Error:`, `500`, `Failed`, `Connection refused`, `Database error`

## 🚨 Troubleshooting Common Issues

### Empty Log Files
If logs are empty (0 bytes):
```bash
# Check if servers are running
lsof -i :5173  # Frontend
lsof -i :5000  # Backend

# Restart development servers
npm run dev
```

### Permission Issues
```bash
# Make sure log directory is writable
chmod 755 logs/
touch logs/frontend.log logs/backend.log
```

### Log Rotation
For production, consider log rotation:
```bash
# Archive old logs
mv logs/frontend.log logs/frontend.log.$(date +%Y%m%d)
mv logs/backend.log logs/backend.log.$(date +%Y%m%d)

# Restart logging
npm run dev
```

## 📝 Development Commands

**Check application status:**
```bash
# Check if servers are running
lsof -i :5173  # Frontend
lsof -i :5000  # Backend

# Restart development servers
npm run dev
```

**Database operations:**
```bash
# Reset database (if needed)
npm run db:reset

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

## 🔧 Advanced Debugging

### Enable Debug Mode
```bash
# Frontend with debug info
DEBUG=vite:* npm run dev:frontend

# Backend with debug info
DEBUG=express:* npm run dev:backend
```

### Log Level Configuration
Add to your `.env` files:
```env
# Frontend (.env)
VITE_LOG_LEVEL=debug

# Backend (backend/.env)
LOG_LEVEL=debug
NODE_ENV=development
```

### Custom Log Filtering
```bash
# Create custom log filters
alias frontend-errors="cat logs/frontend.log | sed 's/\x1b\[[0-9;]*m//g' | grep -E 'error|Error|ERROR'"
alias backend-errors="cat logs/backend.log | sed 's/\x1b\[[0-9;]*m//g' | grep -E 'error|Error|ERROR'"

# Use the aliases
frontend-errors
backend-errors
```

## 💡 Tips

1. **Use the clean-logs script** - It's the easiest way to read logs
2. **Monitor logs during development** - Use `tail -f` to see real-time updates
3. **Search for specific errors** - Use `grep` to filter log content
4. **Archive old logs** - Keep logs manageable by rotating them periodically
5. **Check both frontend and backend** - Issues can originate from either side

---

**Related Documentation:**
- [Main README](../README.md) - Project overview and setup
- [Development Guide](./DEVELOPMENT.md) - Development workflow
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
