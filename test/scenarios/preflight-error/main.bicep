param name string

resource stg 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: name
  location: 'westus'
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
}
