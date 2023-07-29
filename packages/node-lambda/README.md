# Node-lambda Nx Plugin
Node-lambda is an Nx plugin that simplifies the creation and management of applications and handlers, specifically designed for AWS Lambda deployment. This plugin enhances your Nx workspace with capabilities for building, packaging, and deploying self-contained AWS Lambda handlers. Additionally, it offers convenient options for testing your builds using localstack by specifying the extracted folder as the hot-reload bucket.

## Installation

To get started, install the Node-lambda Nx plugin by running the following command in an existing NX workspace:

```
npm i @nxicy/node-lambda --save-dev
```

## Creating Applications

To add a new application, use the following command. Note that this will also create a basic GET Lambda handler:

```
nx g @nxicy/node-lambda:application my-node-lambda-app

```

# Generating Handlers

Generate a handler using the command:

```
nx g @nxicy/node-lambda:handler --project my-node-lambda-app --name my-node-lambda-handler

```

## Packaging Handlers

Build and package a handler into a zip for deployment using:

```
nx run my-node-lambda-app:package-my-node-lambda 
```


## Testing
You can run unit tests with:

```
nx run my-node-lambda-app:test
```


