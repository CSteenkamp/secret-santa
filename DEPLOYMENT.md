# Deployment Guide - Secret Santa Multi-Tenant

## Quick Start with Docker

The easiest way to deploy is using Docker Compose:

```bash
# 1. Set your database password (optional, defaults to 'changeme123')
export DB_PASSWORD="your-secure-password-here"

# 2. Start the application
docker-compose up -d

# 3. Access at http://localhost:3000
```

That's it! The application will:
- Start PostgreSQL database
- Run database migrations automatically
- Start the Next.js application on port 3000

## Production Deployment on Your Server

### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional but recommended)
- Reverse proxy (Nginx or Caddy)

### Step 1: Clone and Configure

```bash
# Clone your repository
cd /opt
git clone <your-repo-url> secret-santa
cd secret-santa

# Create environment file
cat > .env <<EOF
DB_PASSWORD=your-super-secure-database-password
EOF
```

### Step 2: Build and Start

```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Verify it's running
curl http://localhost:3000
```

### Step 3: Set Up Reverse Proxy

**Option A: Caddy (Automatic HTTPS - Recommended)**

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddy
sudo nano /etc/caddy/Caddyfile
```

Add:
```
secretsanta.yourdomain.com {
    reverse_proxy localhost:3000
}
```

```bash
# Restart Caddy
sudo systemctl restart caddy
```

**Option B: Nginx**

```nginx
server {
    listen 80;
    server_name secretsanta.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then use Certbot for SSL:
```bash
sudo certbot --nginx -d secretsanta.yourdomain.com
```

### Step 4: Backups

**Automatic Daily Backups:**

```bash
# Create backup script
cat > /opt/secret-santa/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/opt/secret-santa/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec secret-santa-db pg_dump -U secretsanta secretsanta | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"
EOF

chmod +x /opt/secret-santa/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/secret-santa/backup.sh") | crontab -
```

**Restore from Backup:**

```bash
# List backups
ls -lh /opt/secret-santa/backups/

# Restore specific backup
gunzip < /opt/secret-santa/backups/db_20241103_020000.sql.gz | \
  docker exec -i secret-santa-db psql -U secretsanta -d secretsanta
```

## Updating the Application

```bash
cd /opt/secret-santa

# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f app
```

## Monitoring

**View Logs:**
```bash
# All logs
docker-compose logs -f

# Just app logs
docker-compose logs -f app

# Just database logs
docker-compose logs -f db
```

**Check Status:**
```bash
docker-compose ps
```

**Resource Usage:**
```bash
docker stats
```

## Troubleshooting

**Database Connection Issues:**
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Manually run migrations
docker-compose exec app npx prisma migrate deploy
```

**Application Won't Start:**
```bash
# Check app logs
docker-compose logs app

# Restart everything
docker-compose restart

# Nuclear option - full reset (WARNING: Deletes data!)
docker-compose down -v
docker-compose up -d
```

**Port Already in Use:**
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Change port in docker-compose.yml
# ports:
#   - "8080:3000"  # Access on port 8080 instead
```

## Performance Tuning

**For Heavy Usage:**

Edit `docker-compose.yml`:

```yaml
services:
  db:
    environment:
      POSTGRES_USER: secretsanta
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme123}
      POSTGRES_DB: secretsanta
      POSTGRES_MAX_CONNECTIONS: 100  # Add this
    command: >
      postgres
      -c shared_buffers=256MB
      -c effective_cache_size=1GB

  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Security Checklist

- [ ] Change default database password
- [ ] Use HTTPS (automatic with Caddy)
- [ ] Set up firewall (only allow 80, 443, SSH)
- [ ] Enable automatic updates
- [ ] Set up monitoring/alerts
- [ ] Regular backups configured
- [ ] Strong admin passwords required

## Cost Estimates

**Small VPS (100-500 groups):**
- Hetzner Cloud CX11: €4/month
- RAM: 2GB
- Storage: 20GB

**Medium VPS (500-2000 groups):**
- Hetzner Cloud CPX11: €5/month
- RAM: 2GB
- Storage: 40GB

**Large Scale (2000+ groups):**
- Consider dedicated database server
- Load balancer for multiple app instances

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify database: `docker-compose exec db psql -U secretsanta -c "\dt"`
3. Check GitHub issues
