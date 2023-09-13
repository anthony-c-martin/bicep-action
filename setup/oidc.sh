#!/bin/bash
set -e

# The name of the GitHub environment
environment="Test"
# Your Azure Tenant ID
tenantId="3f371d31-f8f9-4ac4-9950-b5c4ff5bbb3d"
# Your Azure Subscription ID
subId="d08e1a72-8180-4ed3-8125-9dff7376b0bd"
# The name of the GitHub repository owner (organization or username)
repoOwner="anthony-c-martin"
# The name of the GitHub repository
repoName="bicep-action"
# The name of the resource group you will be deploying to
rgName="bicep-action-test"
# The location of the resource group you will be deploying to
rgLocation="East US 2"

az account set -n "$subId"
az group create \
  --location "$rgLocation" \
  --name "$rgName"

appCreate=$(az ad app create --display-name "$repoName ($environment)")
appId=$(echo $appCreate | jq -r '.appId')
appOid=$(echo $appCreate | jq -r '.id')

spCreate=$(az ad sp create --id $appId)
spId=$(echo $spCreate | jq -r '.id')
az role assignment create --role owner --assignee-object-id $spId --assignee-principal-type ServicePrincipal --scope /subscriptions/$subId/resourceGroups/$rgName

repoSubject="repo:$repoOwner/$repoName:environment:$environment"
az ad app federated-credential create --id $appOid --parameters '{"name":"'$repoName'_'$environment'","issuer":"https://token.actions.githubusercontent.com","subject":"'$repoSubject'","description":"GitHub OIDC Connection","audiences":["api://AzureADTokenExchange"]}'

gh variable set --repo "$repoOwner/$repoName" --env "$environment" AZURE_CLIENT_ID --body $appId
gh variable set --repo "$repoOwner/$repoName" --env "$environment" AZURE_SUBSCRIPTION_ID --body $subId
gh variable set --repo "$repoOwner/$repoName" --env "$environment" AZURE_TENANT_ID --body $tenantId
gh variable set --repo "$repoOwner/$repoName" --env "$environment" AZURE_RESOURCE_GROUP --body $rgName
