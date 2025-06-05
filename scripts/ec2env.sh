#!/bin/bash

echo "Fetching env variables from AWS SSM..."

# Install jq if not present
if ! command -v jq &> /dev/null; then
    echo "Installing jq..."
    sudo yum install -y jq
fi

# Fetch parameters and create .env file
aws ssm get-parameters-by-path \
    --path "/bably" \
    --with-decryption \
    --recursive \
    --query "Parameters[*].{Name:Name,Value:Value}" \
    --output json | \
jq -r '.[] | .Name |= sub(".*/"; "") | "\(.Name)=\(.Value)"' > server/.env

echo ".env created in server/.env"

# Check if DATABASE_URL was retrieved
if grep -q "DATABASE_URL" server/.env; then
    echo "DATABASE_URL found in .env"
else
    echo "WARNING: DATABASE_URL not found in .env"
    echo "Contents of .env:"
    cat server/.env
fi