param location string

resource stg 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${uniqueString(resourceGroup().id)}asddsf'
  location: location
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
}
