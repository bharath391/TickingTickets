#!/bin/bash

# Exit on any error
set -e

# Configuration - CHANGE THESE VARIABLES
AWS_REGION="eu-north-1"
AWS_ACCOUNT_ID="250205158018"
ECR_REPO_NAME="ticking-tickets-backend" # Replace with your ECR repository name if different
IMAGE_TAG="latest"

echo "Logging in to AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Building Docker image..."
docker build -t $ECR_REPO_NAME .

echo "Tagging Docker image..."
docker tag $ECR_REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

echo "Pushing Docker image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

echo "Deployment to ECR complete!"
