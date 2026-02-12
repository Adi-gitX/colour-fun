```bash
Last login: Mon Feb  9 12:20:43 on ttys001
aws sts get-caller-identity
```

```text
(node:20056) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
➜  ~ aws sts get-caller-identity

An error occurred (ExpiredToken) when calling the GetCallerIdentity operation: The security token included in the request is expired
➜  ~
➜  ~
```

```bash
➜  ~ ssh -i /Users/kammatiaditya/Downloads/labsuser.pem ec2-user@54.234.51.159
```

```text
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html

A newer release of "Amazon Linux" is available.
  Version 2023.10.20260202:
Run "/usr/bin/dnf check-release-update" for full release and version update info
   ,     #_
   ~\_  ####_        Amazon Linux 2023
  ~~  \_#####\
  ~~     \###|
  ~~       \#/ ___   https://aws.amazon.com/linux/amazon-linux-2023
   ~~       V~' '->
    ~~~         /
      ~~._.   _/
         _/ _/
       _/m/'
Last login: Mon Feb  9 06:51:52 2026 from 104.28.193.14
```

```bash
[ec2-user@ip-172-31-23-194 ~]$ aws configure
```

```text
AWS Access Key ID [None]: ********************
AWS Secret Access Key [None]: ****************************************
AWS Session Token [None]: ****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************
Default region name [None]: us-east-1
Default output format [None]: json
```

```bash
[ec2-user@ip-172-31-23-194 ~]$ nano ec2-control.sh
[ec2-user@ip-172-31-23-194 ~]$ chmod +x ec2-control.sh
[ec2-user@ip-172-31-23-194 ~]$ ./ec2-control.sh start
./ec2-control.sh stop
```

```text
[INFO] Requesting Start for i-0e7b7d405dbbeb8af...
{
    "StartingInstances": [
        {
            "InstanceId": "i-0e7b7d405dbbeb8af",
            "CurrentState": {
                "Code": 16,
                "Name": "running"
            },
            "PreviousState": {
                "Code": 16,
                "Name": "running"
            }
        }
    ]
}
[INFO] Requesting Stop for i-0e7b7d405dbbeb8af...
{
    "StoppingInstances": [
        {
            "InstanceId": "i-0e7b7d405dbbeb8af",
            "CurrentState": {
                "Code": 64,
                "Name": "stopping"
            },
            "PreviousState": {
                "Code": 16,
                "Name": "running"
            }
        }
    ]
}
```

```bash
[ec2-user@ip-172-31-23-194 ~]$ nano safe-ec2-control.sh
[ec2-user@ip-172-31-23-194 ~]$ chmod +x safe-ec2-control.sh
[ec2-user@ip-172-31-23-194 ~]$ ./safe-ec2-control.sh start
./safe-ec2-control.sh stop
```

```text
[INFO] Current State: stopped
[INFO] Starting instance...
{
    "StartingInstances": [
        {
            "InstanceId": "i-0e7b7d405dbbeb8af",
            "CurrentState": {
                "Code": 0,
                "Name": "pending"
            },
            "PreviousState": {
                "Code": 80,
                "Name": "stopped"
            }
        }
    ]
}
[INFO] Current State: pending
[INFO] Stopping instance...
{
    "StoppingInstances": [
        {
            "InstanceId": "i-0e7b7d405dbbeb8af",
            "CurrentState": {
                "Code": 64,
                "Name": "stopping"
            },
            "PreviousState": {
                "Code": 0,
                "Name": "pending"
            }
        }
    ]
}
```

```bash
[ec2-user@ip-172-31-23-194 ~]$ nano ec2-health-check.sh
[ec2-user@ip-172-31-23-194 ~]$ chmod +x ec2-health-check.sh
[ec2-user@ip-172-31-23-194 ~]$ ./ec2-health-check.sh
```

```text
-----------------------------
Instance ID: i-0e7b7d405dbbeb8af
State:       stopped
System:      None
Instance:    None
Health:      [ALERT] Check System! 🚨
-----------------------------
```

```bash
[ec2-user@ip-172-31-23-194 ~]$ ls -l
```

```text
total 12
-rwxr-xr-x. 1 ec2-user ec2-user 361 Feb  9 06:57 ec2-control.sh
-rwxr-xr-x. 1 ec2-user ec2-user 861 Feb  9 06:59 ec2-health-check.sh
-rwxr-xr-x. 1 ec2-user ec2-user 740 Feb  9 06:58 safe-ec2-control.sh
```

```bash
[ec2-user@ip-172-31-23-194 ~]$ cat ec2-control.sh
cat safe-ec2-control.sh
cat ec2-health-check.sh
```

```text
#!/bin/bash

INSTANCE_ID="i-0e7b7d405dbbeb8af"

if [ "$1" == "start" ]; then
  echo "[INFO] Requesting Start for $INSTANCE_ID..."
  aws ec2 start-instances --instance-ids $INSTANCE_ID

elif [ "$1" == "stop" ]; then
  echo "[INFO] Requesting Stop for $INSTANCE_ID..."
  aws ec2 stop-instances --instance-ids $INSTANCE_ID

else
  echo "Usage: $0 {start|stop}"
fi
#!/bin/bash

INSTANCE_ID="i-0e7b7d405dbbeb8af"

CURRENT_STATE=$(aws ec2 describe-instances \\
  --instance-ids $INSTANCE_ID \\
  --query "Reservations[0].Instances[0].State.Name" \\
  --output text)

echo "[INFO] Current State: $CURRENT_STATE"

if [ "$1" == "start" ]; then
  if [ "$CURRENT_STATE" == "running" ]; then
    echo "[SKIP] Instance is already running."
  else
    echo "[INFO] Starting instance..."
    aws ec2 start-instances --instance-ids $INSTANCE_ID
  fi

elif [ "$1" == "stop" ]; then
  if [ "$CURRENT_STATE" == "stopped" ]; then
    echo "[SKIP] Instance is already stopped."
  else
    echo "[INFO] Stopping instance..."
    aws ec2 stop-instances --instance-ids $INSTANCE_ID
  fi

else
  echo "Usage: $0 {start|stop}"
fi
#!/bin/bash

INSTANCE_ID="i-0e7b7d405dbbeb8af"

STATE=$(aws ec2 describe-instances \\
  --instance-ids $INSTANCE_ID \\
  --query "Reservations[0].Instances[0].State.Name" \\
  --output text)

SYS_STATUS=$(aws ec2 describe-instance-status \\
  --instance-ids $INSTANCE_ID \\
  --query "InstanceStatuses[0].SystemStatus.Status" \\
  --output text)

INS_STATUS=$(aws ec2 describe-instance-status \\
  --instance-ids $INSTANCE_ID \\
  --query "InstanceStatuses[0].InstanceStatus.Status" \\
  --output text)

echo "-----------------------------"
echo "Instance ID: $INSTANCE_ID"
echo "State:       $STATE"
echo "System:      $SYS_STATUS"
echo "Instance:    $INS_STATUS"

if [ "$SYS_STATUS" == "ok" ] && [ "$INS_STATUS" == "ok" ]; then
  echo "Health:      [OK] System Healthy ✅"
else
  echo "Health:      [ALERT] Check System! 🚨"
fi
echo "-----------------------------"
[ec2-user@ip-172-31-23-194 ~]$
```