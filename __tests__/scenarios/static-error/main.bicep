param location string

resource stg 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'stg'
  location: location
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
}
