```markdown
# AWS CLI Cheat Sheet & Class Notes

## 1. AWS Configuration (AWS Academy / Learner Lab)
Since Learner Labs use temporary credentials, you must include the `aws_session_token`.

```bash
# Manual configuration (Recommended for Labs)
nano ~/.aws/credentials

# Paste the following format:
[default]
aws_access_key_id=ASIA...
aws_secret_access_key=oxUx...
aws_session_token=IQoJ...

# Set default region and output
aws configure set region us-east-1
aws configure set output json

# Verify identity
aws sts get-caller-identity
```

## 2. Finding the Latest Ubuntu 24.04 AMI
Search for the latest Ubuntu Noble Numbat (24.04) Amazon Machine Image:
```bash
aws ec2 describe-images \
 --owners 099720109477 \
 --filters \
 "Name=name,Values=ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" \
 "Name=state,Values=available" \
 --query 'reverse(sort_by(Images, &CreationDate))[0].ImageId' \
 --output text
```

## 3. VPC & Networking
Retrieve the ID of your default VPC to ensure resources are created in the correct network:
```bash
aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query "Vpcs[0].VpcId" \
  --output text
```

## 4. Security Group Management
### Create a Security Group
```bash
aws ec2 create-security-group \
  --group-name ubuntu-sg \
  --description "Security group for Ubuntu CLI VM" \
  --vpc-id vpc-052456826f3525f47
```

### Authorize Inbound Traffic (SSH & HTTP)
```bash
# Allow SSH (Port 22) from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-0411ca683fbaf06fa \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# Allow HTTP (Port 80) from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-0411ca683fbaf06fa \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0
```

## 5. Instance Management
### Launch an Instance
```bash
aws ec2 run-instances \
  --image-id ami-0136735c2bb5cf5bf \
  --instance-type t3.micro \
  --key-name vockey \
  --security-group-ids sg-0411ca683fbaf06fa \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Ubuntu24-CLI}]'
```

### List and Inspect Instances
```bash
# List all instances with Name, ID, and State
aws ec2 describe-instances \
  --query "Reservations[*].Instances[*].[Tags[?Key=='Name']|[0].Value,InstanceId,State.Name,PublicIpAddress]" \
  --output table

# Get Instance Details in Table Format
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=Ubuntu24-CLI" \
  --query "Reservations[0].Instances[0].[InstanceId,PublicIpAddress]" \
  --output table
```

## 6. Connection & Verification
### Connect via SSH
```bash
# Set permissions for the private key
chmod 400 ~/Downloads/labsuser.pem

# SSH into the instance using the Public IP
ssh -i ~/Downloads/labsuser.pem ubuntu@<PUBLIC_IP>
```

### Verify OS Version (Inside VM)
Once connected, verify the installation:
```bash
# Check Ubuntu version
lsb_release -a

# Check Kernel version
uname -a
```
```
