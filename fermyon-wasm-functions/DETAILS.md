# Azure DevOps tasks for Fermyon Wasm Functions

This is a collection of tools for Azure DevOps Pipelines to work with Fermyon Wasm Functions. Tools have been build and tested for Linux, macOS and Windows agents. Currently, `spin` is downloaded for the `amd64` architecture only.

### Authenticate Against Fermyon Wasm Functions

```yaml
#Your build pipeline references an undefined variable named ‘fwf.pat’. Create or edit the build pipeline for this YAML file, define the variable on the Variables tab. See https://go.microsoft.com/fwlink/?linkid=865972

steps:
- task: thorstenhans.fermyon.spin-aka-login.spin-aka-login@1
  displayName: 'Login to Fermyon Wasm Functions'
  inputs:
    token: '$(your.fermyonwasmfunctions.pat)'
```

### Deploy to Fermyon Wasm Functions

```yaml
steps:
- task: thorstenhans.fermyon.spin-aka-deploy.deploy-to-fermyon-wasm-functions@1
  displayName: 'Deploy to Fermyon Wasm Functions'
  inputs:
    createName: 'azuredevops-tasks'
    variables: 'foo=bar'
```