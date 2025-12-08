# CI/CD Pipeline Documentation

## Overview

This project includes comprehensive CI/CD pipelines for both **GitHub Actions** (AWS) and **Azure DevOps**, showcasing modern cloud integration and deployment practices.

## GitHub Actions Pipeline (AWS)

### Pipeline: `.github/workflows/ci-cd.yml`

#### Workflow Stages

1. **Test Stage**
   - Runs on every push and PR
   - Executes linting, API tests, and UI tests
   - Uploads test results and artifacts

2. **Build Stage**
   - Builds application
   - Creates deployment artifacts
   - Prepares for deployment

3. **AWS Connectivity Stage**
   - Tests AWS CLI configuration
   - Validates S3, EC2, RDS connectivity
   - Tests AWS Secrets Manager
   - Optional: Uploads test reports to S3

4. **Deploy Staging Stage**
   - Deploys to staging environment
   - Example deployments to Elastic Beanstalk or ECS
   - Runs verification checks

5. **Deploy Production Stage**
   - Deploys to production on main branch
   - Updates Lambda functions
   - Invalidates CloudFront cache
   - Runs smoke tests

6. **Security Scan Stage**
   - npm audit for vulnerabilities
   - Snyk security scanning
   - Uploads security reports

7. **Performance Test Stage**
   - Runs performance/load tests
   - Generates performance reports

### Required Secrets

Configure these in GitHub repository settings → Secrets and variables → Actions:

```
AWS_ACCESS_KEY_ID          # AWS access key
AWS_SECRET_ACCESS_KEY      # AWS secret key
SNYK_TOKEN                 # Snyk security scanning token (optional)
```

### AWS Services Demonstrated

- ✅ **AWS CLI** - Command-line operations
- ✅ **S3** - Storage for artifacts and reports
- ✅ **EC2** - Compute instances
- ✅ **RDS** - Database connectivity
- ✅ **Secrets Manager** - Secret management
- ✅ **Elastic Beanstalk** - Application deployment
- ✅ **ECS** - Container orchestration
- ✅ **Lambda** - Serverless functions
- ✅ **CloudFront** - CDN and caching

### Usage

```bash
# Trigger on push to main
git push origin main

# Trigger on pull request
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub

# Manual trigger
# Go to Actions tab → Select workflow → Run workflow
```

---

## Azure DevOps Pipeline

### Pipeline: `azure-pipelines.yml`

#### Pipeline Stages

1. **Test Stage**
   - Unit & integration tests
   - Security vulnerability scanning
   - Code coverage reporting
   - WhiteSource security scan

2. **Build Stage**
   - Builds application
   - Packages artifacts
   - Publishes build outputs

3. **Azure Connectivity Stage**
   - Tests Azure CLI
   - Validates Azure Storage
   - Checks Azure SQL
   - Tests App Services
   - Validates Key Vault
   - Checks Container Registry

4. **Deploy Staging Stage**
   - Deploys to Azure App Service (Staging)
   - Runs deployment verification
   - Health check validation

5. **Deploy Production Stage**
   - Deploys to Azure App Service (Production)
   - Updates Azure Front Door
   - Runs smoke tests
   - Production validation

6. **Post-Deploy Stage**
   - Sends notifications via Service Bus
   - Deployment summary

### Required Service Connections

Configure in Azure DevOps → Project Settings → Service connections:

1. **Azure Service Connection**
   - Type: Azure Resource Manager
   - Name: `Azure-Service-Connection`
   - Scope: Subscription or Resource Group

### Required Variable Groups

Create in Azure DevOps → Pipelines → Library → Variable groups:

**Variable Group: `erp-secrets`**
```
AZURE_SUBSCRIPTION_ID      # Azure subscription ID
AZURE_TENANT_ID           # Azure tenant ID
APP_NAME_STAGING          # Staging app name
APP_NAME_PRODUCTION       # Production app name
```

### Azure Services Demonstrated

- ✅ **Azure CLI** - Command-line operations
- ✅ **Azure App Service** - Web application hosting
- ✅ **Azure Storage** - Blob storage
- ✅ **Azure SQL** - Database services
- ✅ **Azure Key Vault** - Secret management
- ✅ **Azure Container Registry** - Container images
- ✅ **Azure Front Door** - Global load balancing
- ✅ **Azure Service Bus** - Messaging service

### Usage

```bash
# Trigger on push to main or develop
git push origin main

# Trigger on pull request
git push origin feature/new-feature
# Create PR in Azure Repos

# Manual trigger
# Go to Pipelines → Select pipeline → Run pipeline
```

---

## Environment Setup

### GitHub Actions Setup

1. **Fork or clone repository**

2. **Configure AWS credentials**
   ```bash
   # In AWS IAM, create access key
   # Add to GitHub Secrets
   ```

3. **Enable GitHub Actions**
   - Go to repository → Actions tab
   - Enable workflows

4. **Test workflow**
   ```bash
   git push origin main
   ```

### Azure DevOps Setup

1. **Create Azure DevOps project**

2. **Import repository**
   - Import from GitHub
   - Or push code to Azure Repos

3. **Create service connection**
   - Project Settings → Service connections
   - New service connection → Azure Resource Manager
   - Authenticate with Azure

4. **Create variable group**
   - Pipelines → Library → + Variable group
   - Name: `erp-secrets`
   - Add variables

5. **Create pipeline**
   - Pipelines → New pipeline
   - Select Azure Repos Git
   - Select existing Azure Pipelines YAML file
   - Select `azure-pipelines.yml`

6. **Run pipeline**
   - Save and run

---

## Deployment Environments

### GitHub Environments

Configure in GitHub repository settings → Environments:

**Staging Environment**
- URL: `https://staging.yourdomain.com`
- Protection rules: None
- Secrets: Staging-specific secrets

**Production Environment**
- URL: `https://yourdomain.com`
- Protection rules: Required reviewers
- Secrets: Production secrets

### Azure DevOps Environments

Configure in Azure DevOps → Pipelines → Environments:

**staging**
- Resources: Azure App Service (staging)
- Approvals: None

**production**
- Resources: Azure App Service (production)
- Approvals: Required (recommended)

---

## Cloud Service Examples

### AWS Deployment Examples

#### Deploy to Elastic Beanstalk
```bash
aws elasticbeanstalk create-application-version \
  --application-name erp-app \
  --version-label ${{ github.sha }} \
  --source-bundle S3Bucket="your-bucket",S3Key="app.zip"

aws elasticbeanstalk update-environment \
  --environment-name erp-env \
  --version-label ${{ github.sha }}
```

#### Deploy to ECS
```bash
aws ecs update-service \
  --cluster erp-cluster \
  --service erp-service \
  --force-new-deployment
```

#### Deploy to Lambda
```bash
aws lambda update-function-code \
  --function-name erp-function \
  --zip-file fileb://function.zip
```

### Azure Deployment Examples

#### Deploy to App Service
```bash
az webapp deployment source config-zip \
  --resource-group erp-rg \
  --name erp-app \
  --src package.zip
```

#### Deploy to Container Instances
```bash
az container create \
  --resource-group erp-rg \
  --name erp-container \
  --image your-registry.azurecr.io/erp:latest \
  --cpu 1 \
  --memory 1
```

#### Deploy to Kubernetes (AKS)
```bash
az aks get-credentials \
  --resource-group erp-rg \
  --name erp-cluster

kubectl apply -f deployment.yaml
```

---

## Monitoring & Notifications

### GitHub Actions Notifications

**Slack Integration**
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**Email Notifications**
- Configure in repository settings
- Notifications → Actions

### Azure DevOps Notifications

**Service Hooks**
- Project Settings → Service hooks
- Add Slack, Teams, or email webhooks

**Azure Monitor**
```bash
az monitor activity-log alert create \
  --name deployment-alert \
  --resource-group erp-rg \
  --condition category=Administrative
```

---

## Best Practices

### Security
- ✅ Use secrets for credentials
- ✅ Rotate credentials regularly
- ✅ Use service principals (Azure)
- ✅ Use IAM roles (AWS)
- ✅ Scan for vulnerabilities
- ✅ Never commit secrets

### Testing
- ✅ Run tests on every PR
- ✅ Fail pipeline on critical tests
- ✅ Maintain high code coverage
- ✅ Run security scans
- ✅ Performance testing

### Deployment
- ✅ Use staging environments
- ✅ Require approvals for production
- ✅ Run smoke tests after deployment
- ✅ Have rollback procedures
- ✅ Monitor deployments

### Artifacts
- ✅ Version all artifacts
- ✅ Store test results
- ✅ Archive build outputs
- ✅ Retention policies
- ✅ Tag releases

---

## Troubleshooting

### Common Issues

**AWS Authentication Fails**
```bash
# Verify credentials
aws sts get-caller-identity

# Check IAM permissions
aws iam get-user
```

**Azure Authentication Fails**
```bash
# Verify login
az account show

# List subscriptions
az account list
```

**Pipeline Fails on Tests**
- Check server is running
- Verify dependencies installed
- Check test timeouts
- Review test logs

**Deployment Fails**
- Verify service connection
- Check resource names
- Validate permissions
- Review deployment logs

---

## Advanced Features

### Blue-Green Deployment

**AWS**
```yaml
- name: Blue-Green Deploy
  run: |
    aws deploy create-deployment \
      --application-name erp-app \
      --deployment-group-name production \
      --deployment-config-name CodeDeployDefault.AllAtOnce
```

**Azure**
```yaml
- task: AzureAppServiceManage@0
  inputs:
    azureSubscription: 'Azure-Service-Connection'
    Action: 'Swap Slots'
    WebAppName: 'erp-app'
    SourceSlot: 'staging'
```

### Canary Deployment

**AWS Lambda**
```bash
aws lambda update-alias \
  --function-name erp-function \
  --name production \
  --routing-config AdditionalVersionWeights={"2"=0.1}
```

**Azure App Service**
```bash
az webapp traffic-routing set \
  --distribution staging=10 \
  --name erp-app \
  --resource-group erp-rg
```

---

## Metrics & KPIs

Track these deployment metrics:

- **Deployment Frequency**: How often you deploy
- **Lead Time**: Time from commit to production
- **Change Failure Rate**: % of deployments causing failures
- **MTTR**: Mean time to recovery
- **Test Pass Rate**: % of tests passing
- **Code Coverage**: % of code covered by tests

---

## Resources

### GitHub Actions
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Actions](https://github.com/aws-actions)
- [Marketplace](https://github.com/marketplace?type=actions)

### Azure DevOps
- [Azure Pipelines Documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
- [Azure Tasks](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/)

### AWS
- [AWS CLI Documentation](https://aws.amazon.com/cli/)
- [AWS Deployment Guide](https://docs.aws.amazon.com/whitepapers/latest/practicing-continuous-integration-continuous-delivery/welcome.html)

### Azure
- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)
- [Azure Deployment Guide](https://docs.microsoft.com/en-us/azure/architecture/framework/devops/release-engineering-cd)
