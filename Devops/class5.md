```markdown
# DevOps Class 5: EC2 Setup and Node.js Deployment

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
> **Note:** Interactive commands (like `yum install` without flags) will fail in scripts. Always use the `-y` flag.

### Node.js Installation Script (`run.sh`)
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

## 6. Scripting Best Practices

### Exit Codes
Scripts must fail "loud and clear". Exit codes signal success or failure to the parent process.

| Code | Meaning |
| :--- | :--- |
| `0` | Success |
| `1` | General error |
| `2` | Misuse of shell builtins |
| `126` | Command found but not executable |
| `127` | Command not found |
| `128 + n` | Fatal error signal `n` |
| `130` | Script terminated by Ctrl+C |

### File and String Operators
Used within `if` statements or test commands:

| Operator | Description |
| :--- | :--- |
| `-d` | Directory exists |
| `-f` | File exists |
| `-e` | File or directory exists |
| `-s` | File is not empty |
| `-z` | File is empty (or string is empty) |
| `-n` | String is not empty |

### Useful Commands
- `command -v <cmd>`: Checks the path of a command.
- `grep -i`: Ignore case during search.

### Idempotency
A script is **idempotent** if:
1. It works when run once.
2. It still works (and doesn't break things) when run twice.
3. It recovers correctly when run after a partial failure.
```
```
