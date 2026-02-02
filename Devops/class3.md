# Devops Class 3: Linux & AWS EC2 Essentials

## 📚 Topics Covered
- **Linux Fundamentals**: Directory Structure, Environment Variables, Package Managers.
- **Networking**: Ports, IP Addresses, SSH.
- **Cloud Computing**: AWS EC2, Cloud Models (IaaS, PaaS, SaaS).

---

## ☁️ Cloud Computing Overview

### Localhost vs. Cloud (AWS EC2)
- **Elasticity**: Scale from 1 to 100+ servers instantly.
- **Linux-based**: Seamless transition for Linux users.
- **Market Dominance**: Powers approximately 29% of the internet.

### Cloud Service Models
| Model | Description | Example |
| :--- | :--- | :--- |
| **IaaS** | Infrastructure as a Service. Raw hardware/OS control. | AWS EC2 |
| **PaaS** | Platform as a Service. Managed environment, no OS access. | Render, Heroku |
| **SaaS** | Software as a Service. Ready-to-use software. | Netflix, Gmail |

---

## 🛠 Practical: Working with AWS EC2

### 1. Connecting via SSH
Use your private key (`.pem` file) to securely access your instance:
```bash
ssh -i /path/to/labsuser.pem ec2-user@<public-ip>
```

### 2. Essential Linux Commands
- **Switch to Root**: `sudo su` (Full administrative access).
- **Navigation**: `pwd` (Print working directory), `cd <dir>` (Change directory).
- **Listing Files**: 
  - `ls -l`: Detailed list.
  - `ls -alt`: Includes hidden files and timestamps.
- **File Creation**: `touch <filename>` (Create empty file), `mkdir <dirname>` (Create directory).

### 3. Package Management (Amazon Linux 2023)
- **Update System**: `dnf upgrade`
- **Install Node.js**: `sudo yum install nodejs -y`

### 4. Deploying an Express Server
1. **Initialize Project**:
   ```bash
   mkdir myserver && cd myserver
   npm init -y
   npm install express
   ```
2. **Create `app.js`**:
   ```javascript
   const express = require("express");
   const app = express();

   app.get("/", (req, res) => {
       res.send("Hello World!");
   });

   app.listen(3000, () => {
       console.log("Server started on port 3000");
   });
   ```
3. **Run the Server**:
   - **Standard**: `node app.js`
   - **Background (Persistent)**: To keep the server running after closing the terminal:
     ```bash
     nohup node app.js > output.log 2>&1 &
     ```

---

## ✍️ Terminal Editors
- **Nano**: Simple and beginner-friendly.
- **Vim**: Powerful, keyboard-centric, steep learning curve.
- **Emacs**: Highly extensible, "expert level" environment.

---

## 💡 Troubleshooting & Tips
- **Directory Names**: Avoid spaces in folder names (e.g., use `myserver` instead of `my server`) to prevent `bash: cd: too many arguments` errors.
- **Permissions**: If you get "Permission Denied", check ownership with `ls -al` or use `sudo`.
- **Background Processes**: Use `jobs` to see background tasks or `ps aux | grep node` to find running Node processes.