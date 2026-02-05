```markdown
# DevOps Class 5: EC2 Setup and Node.js Deployment -- run.sh is related to this!q

## 1. Connection and Network
Connect to the instance using SSH:
```bash
ssh -i /Users/kammatiaditya/Downloads/labsuser.pem ec2-user@54.91.46.59
```

Check network interfaces:
```bash
ip a
```

## 2. Node.js Express Server (`app.js`)
```javascript
const express = require("express");
const app = express();
const port = 8080;
const host = '172.0.0.1';

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
```

## 3. Instance Configuration (User Data)
When creating the instance:
- **AMI:** Amazon Linux
- **Key Pair:** vockey
- **Advanced Details (User Data):** Include scripts for `yum install` and `nodejs`.

### Checking Logs
Verify the status of the initialization scripts:
```bash
cd /var/log/
# View full output log
cat cloud-init-output.log

# Search for specific installations
grep "nodejs" cloud-init.log
grep "node" cloud-init.log
```

## 4. Installation Scripts
Note: Interactive commands (like `yum install` without flags) will fail in scripts. Always use the `-y` flag.

### Node.js Installation Script
```bash
#!/bin/bash
# Update packages
dnf update -y

# Setup NodeSource repository and install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# Verify installation
node -v > /home/ec2-user/node-installed.txt
```

## 5. Verification Script
A script to check if Node.js is correctly installed:
```bash
#!/usr/bin/env bash

# Check node version and suppress output
node --version >/dev/null 2>&1

if [ $? -ne 0 ]; then
  echo "[ERROR] Node is not installed"
  exit 1
fi

echo "[INFO] Node is installed"
exit 0
```
```

# Exitcodes: how script signal success or failure
# 0 --> success
# 1 --> general error 
# 2 --> misuse of shell builtins
# 127 --> command not found
# 126 --> command found but not executable
# 128 + n --> fatal error signal n
# 130 --> script terminated by Ctrl+C

<!-- why exit codes matters- 
scripts must fail loud and clear -->

-d --> directory exists
-f --> file exists
-e --> file or directory exists
-s --> file is not empty
-z --> file is empty
-n --> string is not empty
-z --> string is empty

commmand -v check path 
-i --> ignore case
command cat --> /bin/cat

idempotency:
run once --> works
run twice --> still works
run after partial failure --> recovers


