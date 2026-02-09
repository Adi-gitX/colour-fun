```bash
#!/bin/bash
set -euo pipefail

# 1. Get the latest Ubuntu 24.04 AMI ID
AMI_ID=$(aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" "Name=state,Values=available" \
  --query 'reverse(sort_by(Images, &CreationDate))[0].ImageId' \
  --output text)

if [[ "$AMI_ID" == "None" || -z "$AMI_ID" ]]; then
  echo "Error: Unable to find Ubuntu 24.04 AMI."
  exit 1
fi

# 2. Get Default VPC ID
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query "Vpcs[0].VpcId" \
  --output text)

if [[ "$VPC_ID" == "None" || -z "$VPC_ID" ]]; then
  echo "Error: Default VPC not found."
  exit 1
fi

# 3. Create Security Group
SG_NAME="ubuntu-sg-$(date +%s)"
SG_ID=$(aws ec2 create-security-group \
  --group-name "$SG_NAME" \
  --description "Security group for Ubuntu CLI VM" \
  --vpc-id "$VPC_ID" \
  --query 'GroupId' \
  --output text)

# 4. Authorize Inbound Traffic (SSH & HTTP)
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0

# 5. Launch Instance
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type t3.micro \
  --key-name vockey \
  --security-group-ids "$SG_ID" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=Ubuntu24-CLI}]" \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "Instance $INSTANCE_ID is being created..."

# 6. Wait for Instance to be running and get Public IP
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

echo "Instance is running!"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP:   $PUBLIC_IP"
echo "Connect via: ssh -i ~/Downloads/labsuser.pem ubuntu@$PUBLIC_IP"
```