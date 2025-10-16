# Azure DevOps tasks for Fermyon Cloud

This is a collection of tools for Azure DevOps Pipelines to work with Fermyon Cloud. Tools have been build and tested for Linux, macOS and Windows agents. Currently, `spin` is downloaded for the `amd64` architecture only.

## Authenticate against Fermyon Cloud

To authenticate with Fermyon Cloud, you must generate a Personal Access Token (PAT) in your [Fermyon Cloud account](https://cloud.fermyon.com). Treat the PAT as sensitive information and store it as masked (sensitive) pipeline variable. (variable groups in Azure DevOps support this too).

```yaml
steps:
- task: spin-cloud-login@1
  displayName: 'Authenticate against Fermyon Cloud'
  inputs:
    token: '$(fermyon.cloud.token)'
```


## Deploy to Fermyon Cloud

The *Deploy to Fermyon Cloud* task allows you to deploy your Spin application to Fermyon Cloud. The task requires a valid Fermyon Cloud account and a valid Spin application. 

```yaml
steps:
- task: spin-cloud-deploy@1
  displayName: 'Deploy to Fermyon Cloud'
```
