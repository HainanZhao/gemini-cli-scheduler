# Production Deployment Configuration

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_PATH=/app/data/scheduler.db
GEMINI_CLI_PATH=/usr/local/bin/gemini
CORS_ORIGIN=https://yourdomain.com
```

### Frontend (.env.production)
```env
VITE_API_URL=https://yourdomain.com/api
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production
RUN cd frontend && npm ci --only=production
RUN cd backend && npm ci --only=production

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Start production server
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/scheduler.db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/var/www/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

## Nginx Configuration

### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        root /var/www/html;
        index index.html;

        # Frontend - Single Page Application
        location / {
            try_files $uri $uri/ /index.html;
            
            # Security headers
            add_header X-Frame-Options DENY;
            add_header X-Content-Type-Options nosniff;
            add_header X-XSS-Protection "1; mode=block";
            add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        }

        # API Proxy
        location /api {
            proxy_pass http://app:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## SSL Certificate Setup

### Using Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.0.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Deploy Application
```bash
# Clone repository
git clone https://github.com/yourusername/gemini-cli-scheduler.git
cd gemini-cli-scheduler

# Create environment files
cp .env.example .env
cp frontend/.env.production.example frontend/.env.production

# Edit configuration
nano .env
nano frontend/.env.production

# Build and start
docker-compose up -d --build
```

### 3. Monitoring
```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Update application
git pull
docker-compose up -d --build
```

## Performance Optimization

### Frontend Optimizations
- Gzip compression enabled
- Static asset caching (1 year)
- Code splitting with dynamic imports
- Image optimization
- Minified CSS and JavaScript

### Backend Optimizations
- Database connection pooling
- Response compression
- Request rate limiting
- Memory usage monitoring
- Process clustering for high load

## Security Best Practices

### Application Security
- Environment variable isolation
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers
- CSRF token implementation

### Infrastructure Security
- SSL/TLS encryption
- Firewall configuration
- Regular security updates
- Database access restrictions
- Log monitoring and alerts

## Backup Strategy

### Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /app/data/scheduler.db /backups/scheduler_$DATE.db

# Clean old backups (keep 30 days)
find /backups -name "scheduler_*.db" -mtime +30 -delete
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Monitoring and Alerts

### Health Check Endpoint
```javascript
// Add to backend/src/routes/health.js
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Uptime Monitoring
- Use services like UptimeRobot or Pingdom
- Monitor both frontend and API endpoints
- Set up email/SMS alerts for downtime

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check port usage
   sudo netstat -tlnp | grep :3001
   ```

2. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /app/data
   ```

3. **Database locked**
   ```bash
   # Restart application
   docker-compose restart app
   ```

### Log Analysis
```bash
# View application logs
docker-compose logs app

# View nginx logs
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f
```

This configuration provides a production-ready deployment with security, performance, and reliability best practices.
