# Node-lambda Nx Plugin
Node-lambda is an Nx plugin that simplifies the creation and management of applications and functions, specifically designed for AWS Lambda deployment. This plugin enhances your Nx workspace with capabilities for building, packaging, and deploying self-contained AWS Lambda functions. Additionally, it offers convenient options for testing your builds with hot-reload using localstack.

## Installation

To install you will need to do
```
npm i @nxicy/node-lambda --save-dev
```

## Creating Applications

You can add a new application with the following:

```
nx g @nxicy/node-lambda:application my-node-lambda-app

```

This will also create a basic get lambda function

# Generating Functions

Functions can be generated with:

```
nx g @nxicy/node-lambda:function --project my-node-lambda-app --name my-node-lambda-function

```

## Packaging Functions

The function can be built and packaged into a zip with:

```
nx run my-node-lambda-app:package-my-node-lambda 
```


## Testing
You can run unit tests with:

```
nx run my-node-lambda-app:test
```


