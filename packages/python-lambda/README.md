# Python-lambda Nx Plugin
Python-lambda is an Nx plugin that simplifies the creation and management of applications and functions and adding modules, specifically designed for AWS Lambda deployment. This plugin enhances your Nx workspace with capabilities for building, packaging, and deploying self-contained AWS Lambda functions. Additionally, it offers convenient options for testing your builds with hot-reload using localstack.



## Installation

To install you will need to do
```
npm i @nxicy/python-lambda --save-dev
```

## Creating Applications

You can add a new application with the following:

```
nx g @nxicy/python-lambda:application my-python-lambda-app

```

# Generating Functions

Functions can be generated with:

```
nx g @nxicy/python-lambda:function --project my-python-lambda-app --name my-python-lambda-function

```

# Creating Modules Libraries
Modules Libraries are a set of python packages that are added as dependencies  to the packaged zip file

A Module Libaray can be created with:

```
nx g @nxicy/python-lambda:module my-python-module
```

### Adding a module as a depenacy of a package 
Update the project.json of the application package of the function's packages to include the module(s) that will be bundled with the main function ie.
```
 "package-my-python-lambda-function": {
      "executor": "@nxicy/python-lambda:package",
      "options": {
        "functionPath": "apps/my-python-lambda-app/src/functions/my-python-lambda-function/",
        "packages": [],
        "zipFilePath": "dist/apps/my-python-lambda-app/get/"
      },
      
    }
```


## Packaging Functions

The function can be built and packaged into a zip with:

```
nx run my-python-lambda-app:package-my-python-lambda
```


## Testing
You can run unit tests with:

```
nx run my-node-lambda-app:test
```
