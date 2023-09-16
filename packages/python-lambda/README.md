# @nxicy/python-lambda

[![npm](https://img.shields.io/npm/v/@nxicy%2Fpython-lambda.svg?style=flat)](hhttps://www.npmjs.com/package/@nxicy/node-lambda) [![nx support](https://img.shields.io/badge/NX->=16.6.0-143055?)](https://nx.dev)

The Python-Lambda Plugin contains generators and executors to simplify the creation and management of applications, handlers and libraries specifically designed for AWS Lambda deployment

## Overview 
### Setting up Python-Lambda
To add the Python-Lambda plugin to an existing workspace, run the following:
```
npm i @nxicy/python-lambda --save-dev
```
### Creating Applications
You can add a new application with the following: 
```
nx g @nxicy/python-lambda:application my-python-lambda-app
```
### Create Handlers
You can add a new handler to application with the following:
```
nx g @nxicy/python-lambda:handler --project my-python-lambda-app --name my-python-lambda-handler
```

### Creating Libraries
To create a library run the following command:
```
nx g @nxicy/python-lambda:library my-python-library
```

### Using Python-Lambda

#### Packaging Handler
Package the handler and any packages into a zip for deployment using:
```
nx run my-python-lambda-app:package-my-python-lambda
```


#### Package Library

##### Add Packages to a Package Library 
You can use pip to install a package and target your package library folder, for example:
```
pip install --target=<workspace>/<library folder>/my-python-library  package_name
```

##### Adding a Package Library as a Dependency of a Handler
If you add the package library to the handler package target in project.json of the application it will be bundled with the main handler, i.e.:
```
 "package-my-python-lambda-handler": {
      "executor": "@nxicy/python-lambda:package",
      "options": {
         ...
        "packages": ["libs/python/my-python-library"],
        ...
      },
      
    }
```

## Executors

[**package**](#@nxicy/python-lambda:package)
Packages a handler with options that can be configured in `project.json`

## Generators

[**application**](#@nxicy/python-lambda:application)
Create a Python-Lambda application

[**handler**](#@nxicy/python-lambda:handler)
Create a Python-Lambda handler

[**library**](#@nxicy/python-lambda:library)
Create a Python-Lambda Library


## @nxicy/python-lambda:package
Packages a handler with options that can be configured in `project.json` 
### Options
**handlerPath** `required`
<span style="color:green">string</span>
The path of the handler files.

**outputPath** `required`
<span style="color:green">string</span>
The output path of the packaged handler

**packages** 
<span style="color:green">Array\<string\></span>
Default: `[]`
A list of package folders to include in the packaged handler.

**zipFileOutputPath** 
<span style="color:green">string</span>
The output path of the packaged handler.

## @nxicy/python-lambda:application

### Usage
```
nx g @nxicy/python-lambda:application ...
```
or
```
nx g @nxicy/python-lambda:app ...
```
### Options
**name** `required`
<span style="color:green">string</span>
The name of the application

**tags**
<span style="color:green">string</span>
Add tags to the application.

## @nxicy/python-lambda:handler

### Usage
```
nx g @nxicy/python-lambda:handler ...
```
or
```
nx g @nxicy/python-lambda:hdlr ...
```

### Options
**name** `required`
<span style="color:green">string</span>
The name of the handler

**project** `required`
<span style="color:green">string</span>
Then project name the handler will be added to 


## @nxicy/python-lambda:library
Create a `python` folder in the `libs` folder which contains a basic python module
## Usage
```
nx g @nxicy/python-lambda:library ...
```
or
```
nx g @nxicy/python-lambda:lib ...
```
### Options
**name** `required`
<span style="color:green">string</span>
The name of the library