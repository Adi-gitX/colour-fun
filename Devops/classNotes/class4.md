
## Lab Overview
### Use Case
This lab simulates the professional deployment of a production-ready environment. It focuses on transitioning from manual server configuration to secure, automated setups, ensuring that applications run under restricted identities with strictly controlled file access to minimize the attack surface.

### Key Objectives
*   **System Auditing**: Baseline discovery of OS, hardware resources, and network state.
*   **Environment Standardization**: Establishing a consistent directory structure following FHS conventions.
*   **Security Hardening**: Implementing the Principle of Least Privilege by creating non-login system users and restricting sensitive file permissions (600 vs 644).
*   **Automation**: Developing idempotent Bash scripts to ensure repeatable and error-free deployments across multiple environments.




# Lab Assignment: Server Setup, Permissions, and Automation
### Lab Q1: Server Setup & Exploration
*   **System Discovery**: Understanding the environment is the first step in server management. Key metrics include OS version (`lsb_release`), memory availability (`free`), disk utilization (`df`), and network identity (`hostname -I`).
*   **Tooling**: Essential utilities like `git` (version control), `curl` (data transfer), and `tree` (directory visualization) are foundational for development workflows.
*   **Structure**: Standardizing application paths (e.g., `/opt/myapp`) follows Linux FHS (Filesystem Hierarchy Standard) conventions for optional software packages.
*   **Networking**: Monitoring listening ports (`netstat`) is critical for security auditing to ensure only intended services (like SSH on port 22) are exposed.

### Lab Q2: Users, Permissions & Configuration
*   **Security Isolation**: Running applications as `root` is a security risk. Creating a system user (`useradd -r`) with no login shell (`-s /usr/sbin/nologin`) ensures that if the app is compromised, the attacker cannot easily gain shell access.
*   **Principle of Least Privilege**: 
    *   **644 (rw-r--r--)**: Allows the owner to read/write and others to read. Suitable for non-sensitive configs.
    *   **600 (rw-------)**: Restricts access strictly to the owner. Essential for files containing credentials (`secrets.env`).
*   **Ownership**: Using `chown` to transfer directory control to the service user ensures the application can manage its own logs and temporary files without elevated privileges.

### Lab Q3: Scripting Challenge
*   **Automation**: Scripts ensure environment parity across multiple servers, reducing human error.
*   **Idempotency**: A good script can be run multiple times without causing errors (e.g., checking if a user exists before creating it).
*   **Privilege Escalation Check**: Validating `EUID` ensures the script has the necessary permissions to modify system directories and users.

---

## Execution Guide: Step-by-Step Commands

### Phase 1: System Discovery & Environment Prep
```bash
# 1. Collect System Information
lsb_release -a > ~/server-info.txt
free -h >> ~/server-info.txt
df -h >> ~/server-info.txt
whoami >> ~/server-info.txt
groups >> ~/server-info.txt
hostname -I >> ~/server-info.txt

# 2. Install Essential Tools
sudo apt update
sudo apt install -y git curl tree net-tools

# 3. Initialize Project Structure
sudo mkdir -p /opt/myapp/{app,config,logs,tmp}

# 4. Audit Network Ports
sudo netstat -tulnp
```

### Phase 2: User Security & Permissions
```bash
# 1. Create Restricted System User
sudo useradd -r -s /usr/sbin/nologin nodeapp

# 2. Configure Ownership and Permissions
sudo chown -R nodeapp:nodeapp /opt/myapp
sudo touch /opt/myapp/config/app.conf /opt/myapp/config/secrets.env
sudo chmod 644 /opt/myapp/config/app.conf
sudo chmod 600 /opt/myapp/config/secrets.env

# 3. Populate Sensitive Configuration
sudo bash -c 'cat <<EOF > /opt/myapp/config/secrets.env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PASSWORD=supersecret
EOF'

# 4. Verify Access Control
cat /opt/myapp/config/secrets.env                # Should return Permission Denied
sudo -u nodeapp cat /opt/myapp/config/secrets.env # Should succeed
```

### Phase 3: Automation Scripting
```bash
# 1. Create the Automation Script
cat <<'EOF' > ~/setup-service.sh
#!/bin/bash
if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run with sudo"
  exit 1
fi

APP_DIR="/opt/webapp"
APP_USER="webapp"

mkdir -p $APP_DIR/{app,config,logs,tmp}

if ! id "$APP_USER" &>/dev/null; then
  useradd -r -s /usr/sbin/nologin $APP_USER
fi

cat <<EOC > $APP_DIR/config/app.env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
EOC

chown -R $APP_USER:$APP_USER $APP_DIR
chmod 600 $APP_DIR/config/app.env

echo "Setup complete!"
EOF

# 2. Execute and Verify
chmod +x ~/setup-service.sh

