#!/bin/bash

echo "Fetching env variables from AWS SSM..."

aws ssm get-parameters-by-path \
  --path "/bably" \ 
  --with-decryption \
  --recursive \
  --query "Parameters[*].{Name:Name,Value:Value}" \
  --output json |
  jq -r '.[] | .Name |= sub(".*/"; "") | "\(.Name)=\(.Value)"' > server/.env

echo ".env created in server/.env"