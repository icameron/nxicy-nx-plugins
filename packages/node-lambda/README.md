# @nxicy/node-lambda
The Node-Lambda Plugin contains generators and executors to simplify the creation and management of applications and handlers specifically designed for AWS Lambda deployment.

[![npm version](https://badge.fury.io/js/@nxicy%2Fnode-lambda.svg)](https://badge.fury.io/js/@nxicy%2Fnode-lambda)


## Overview 
### Setting up Node-Lambda
To add the Node-Lambda plugin to an existing workspace, run the following:

```
npm i @nxicy/node-lambda --save-dev
```

#### Creating Applications

You can add a new application with the following: 

```
nx g @nxicy/node-lambda:application my-node-lambda-app

```
#### Creating Handlers

You can add a new handler to application with the following:

```
nx g @nxicy/node-lambda:handler --project my-node-lambda-app --name my-node-lambda-handler

```

### Using Node-Lambda

#### Testing Handlers
You can run unit tests with:
```
nx run my-node-lambda-app:test
```
#### Building Handlers

Node-lambda handlers can be built with:
```
nx run my-node-lambda-app:build-my-node-lambda 

```

#### Packaging Handlers

Build and package a handler into a zip for deployment using:
```
nx run my-node-lambda-app:package-my-node-lambda 
```

### Executors

[**package**](#@nxicy/node-lambda:package)
Builds and packages a handler 
### Generators

[**application**](#@nxicy/node-lambda:application)
Create a node-lambda application

[**handler**](#@nxicy/node-lambda:handler)
Create a node-lambda handler



## @nxicy/node-lambda:package
Builds and packages a handler to be deployed to as an AWS lambda
Options can be configured in `project.json` when defining the executor, or when invoking it. 


### Options

**buildTarget** `required`
<span style="color:green">string</span>
The target to run to build you the app.

**buildTargetOptions**
<span style="color:green">object</span>
Default:`{}`
Additional options to pass into the build target.

**zipFileOutputPath**
<span style="color:green">string</span>
The path of the zip file

## @nxicy/node-lambda:application
Node-lambda Application Options Schema

### Usage 
```
nx g @nxicy/node-lambda:application ...
```
or
```
nx g @nxicy/node-lambda:app ...
```

### Options

**name** `required`
<span style="color:green">string</span>
The name of the application

**directory**
<span style="color:green">string</span>
The directory of the new application.

**skipFormat**
<span style="color:green">boolean</span>
Default: `false`
Skip formatting files

**linter**
<span style="color:green">string</span>
Default: `eslint`
Accepted values: `eslint`
The tool to use for running lint checks.

**unitTestRunner**
<span style="color:green">string</span>
Default: `jest`
Accepted values: `jest,none`
Test runner to use for unit tests.

**tags**
<span style="color:green">string</span>
Add tags to the application (used for linting).

**setParserOptionsProject**
<span style="color:green">boolean</span>
Default: `false`
Whether or not to configure the ESLint `parserOptions.project` option. We do not do this by default for lint performance reasons.

**bundler**
<span style="color:green">string</span>
Default: `esbuild`
Accepted values: `esbuild,webpack`
Bundler which is used to package the handler


## @nxicy/node-lambda:handler
Node-lambda Handler Options Schema

### Usage 
```
nx g @nxicy/node-lambda:handler ...
```
or
```
nx g @nxicy/node-lambda:hdlr ...
```

### Options
**name** `required`
<span style="color:green">string</span>
The name of the handler

**project** `required`
<span style="color:green">string</span>
Then project name the handler will be added to 

**bundler**
<span style="color:green">string</span>
Default: `esbuild`
Accepted values: `esbuild,webpack`
Bundler which is used to package the handler
