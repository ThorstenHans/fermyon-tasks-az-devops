# Azure DevOps tasks for Spin

This is a collection of tools for Azure DevOps Pipelines to work with Spin. Tools have been build and tested for Linux, macOS and Windows agents. Currently, `spin` is downloaded for the `amd64` architecture only.

## Spin Tool Installer

The *Spin Tool Installer* allows you to install any version of the `spin` CLI on your Azure DevOps Agent. By default, the task will download the **latest** version of `spin`. You can specify a different version by setting the `version` input variable as shown in the following figure:

![Spin Tool Installer Task - Version](assets/docs/spin-tool-installer-version.png)

```yaml
- task: thorstenhans.fermyon.spin-tool.spin-tool@1
  displayName: 'Install Spin'
  inputs:
    version: v3.1.4
```

## Spin Build

The *Spin Build* task invokes `spin build` to compile your Spin application.

```yaml
- task: thorstenhans.fermyon.spin-build.spin-build@1
  displayName: 'Spin Build'
```

## Spin Command

The *Spin Command* tool allows users to invoke any command provided by `spin` CLI or its plugins. Users have to specify the `command` input variable. Optional arguments can be provided using the `arguments` input variable. One should separate arguments using a newline character (`\n`). The following figure shows an example of the *Spin Command* task:

![Spin Command Task - Example](assets/docs/spin-command-example.png)

```yaml
steps:
- task: thorstenhans.fermyon.spin-command.spin-command@1
  displayName: 'List all spin apps in Fermyon Cloud'
  inputs:
    command: cloud
    arguments: |
     apps
     list
```

## Spin Version

Use the *Spin Version* task retrieve the version of the `spin` tool installed on the agent. The task provides an output variable called `version` that could be referenced from within other tasks. Remember to specify the *Reference Name* of the *Spin Version* task as shown in the following figure:

![Spin Version Task - Output Variables](assets/docs/spin-version-output.png)

Tasks can reference the output variable using the `$(<reference-name>.version)` syntax.
