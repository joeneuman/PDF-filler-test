# Deployment Guide

## Digital Ocean Deployment

### Prerequisites
- Digital Ocean droplet with Node.js 18+ installed
- Domain name (optional, but recommended)
- SSH access to your server

### Step 1: Prepare Your Server

SSH into your Digital Ocean server and install Node.js if not already installed:

```bash
# Install Node.js 18+ (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### Step 2: Clone Your Repository

```bash
# Create a directory for your app
mkdir -p ~/apps/pdf-form-filler
cd ~/apps/pdf-form-filler

# Clone your repo (replace with your GitHub repo URL)
git clone https://github.com/yourusername/pdf-form-filler.git .

# Or if you haven't pushed to GitHub yet:
# Upload files via SCP or use git init and push
```

### Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 4: Build the Application

```bash
# From project root
npm run build
```

This will:
- Build the TypeScript server code to `server/dist/`
- Build the React frontend to `client/dist/`

### Step 5: Set Up Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
nano .env
```

Add:
```env
PORT=3001
FRONTEND_ORIGIN=https://yourdomain.com
NODE_ENV=production
STORAGE_DIR=./storage
```

**Important**: Update `FRONTEND_ORIGIN` with your actual domain.

### Step 6: Set Up PM2 (Process Manager)

Install PM2 to keep your server running:

```bash
npm install -g pm2
```

Create a PM2 ecosystem file at the project root:

```bash
cd ~/apps/pdf-form-filler
nano ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [{
    name: 'pdf-form-filler',
    script: './server/dist/index.js',
    cwd: './server',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false
  }]
};
```

### Step 7: Configure Nginx (Reverse Proxy)

Install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/pdf-form-filler
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend static files
    location / {
        root /home/yourusername/apps/pdf-form-filler/client/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
    }
}
```

**Important**: Replace:
- `yourdomain.com` with your actual domain
- `yourusername` with your server username

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/pdf-form-filler /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 8: Set Up SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically update your Nginx config.

### Step 9: Start the Application

```bash
cd ~/apps/pdf-form-filler
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable PM2 on boot
```

### Step 10: Verify Everything Works

1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs pdf-form-filler`
3. Visit your domain in a browser
4. Test uploading a PDF

### Updating the Application

When you make changes:

```bash
cd ~/apps/pdf-form-filler
git pull
npm run build
pm2 restart pdf-form-filler
```

### Storage Considerations

The `server/storage/` directory will grow as PDFs are uploaded. Consider:

1. **Set up automatic backups**:
```bash
# Add to crontab (crontab -e)
0 2 * * * tar -czf /backups/pdf-form-filler-$(date +\%Y\%m\%d).tar.gz /home/yourusername/apps/pdf-form-filler/server/storage
```

2. **Monitor disk space**:
```bash
df -h
du -sh ~/apps/pdf-form-filler/server/storage
```

3. **Set up log rotation** (PM2 handles this, but you can configure it)

### Firewall Configuration

Make sure your firewall allows HTTP/HTTPS:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### Troubleshooting

**Server won't start:**
- Check logs: `pm2 logs pdf-form-filler`
- Verify Node.js version: `node --version`
- Check if port 3001 is in use: `sudo lsof -i :3001`

**Nginx errors:**
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Test config: `sudo nginx -t`

**CORS errors:**
- Verify `FRONTEND_ORIGIN` in `.env` matches your domain exactly
- Check browser console for specific CORS errors

**Storage issues:**
- Ensure `server/storage/` directory has write permissions
- Check disk space: `df -h`

## Alternative: Digital Ocean App Platform

If you prefer a managed solution:

1. Go to Digital Ocean App Platform
2. Connect your GitHub repository
3. Configure:
   - **Backend**: Set root to `server/`, build command: `npm run build`, run command: `node dist/index.js`
   - **Frontend**: Set root to `client/`, build command: `npm run build`, output directory: `dist`
4. Set environment variables
5. Deploy!

This is easier but costs more than a droplet.

## GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Digital Ocean

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/apps/pdf-form-filler
            git pull
            npm run build
            pm2 restart pdf-form-filler
```

Add secrets in GitHub repo settings:
- `HOST`: Your server IP
- `USERNAME`: Your server username
- `SSH_KEY`: Your private SSH key

