# Python-lambda Nx Plugin
Python-lambda is an Nx plugin that simplifies the creation and management of applications and handlers and adding modules libraries, specifically designed for AWS Lambda deployment. This plugin enhances your Nx workspace with capabilities for building, packaging, and deploying self-contained AWS Lambda handlers. Additionally, it offers convenient options for testing your builds using localstack by specifying the extracted folder as the hot-reload bucket.

## Installation

To get started, install the Python-lambda Nx plugin by running the following command in an existing NX workspace:

```
npm i @nxicy/python-lambda --save-dev
```

## Creating Applications

To add a new application, use the following command. Note that this will also create a basic GET Lambda handler:

```
nx g @nxicy/python-lambda:application my-python-lambda-app

```

# Generating Handlers

Generate a handler using the command:

```
nx g @nxicy/python-lambda:handler --project my-python-lambda-app --name my-python-lambda-handler

```

# Creating Libraries
Python Lambda Package Libraries are Python packages folders that are added to the handler zip file. Note that a "python" folder is created in the workspace's "libs" directory to house these libraries.

A Package Library can be created with:

```
nx g @nxicy/python-lambda:library my-python-module
```

### Using pip to Add Packages to a Package Library 

You can use pip to install a package and target your package library folder, for example:

```
pip install --target=<workspace>/<library folder>/my-python-module  package_name
```

### Adding a Package Library as a Dependency of a Handler

If you add the package library to the handler package target in project.json of the application it will be bundled with the main handler, i.e.:

```
 "package-my-python-lambda-handler": {
      "executor": "@nxicy/python-lambda:package",
      "options": {
         ...
        "packages": ["libs/python/my-python-module"],
        ...
      },
      
    }
```


## Packaging Handler

Build and package the handler into a zip for deployment using:

```
nx run my-python-lambda-app:package-my-python-lambda
```
