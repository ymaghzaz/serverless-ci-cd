# serverless-ci-cd

[![NPM](https://img.shields.io/npm/v/serverless-ci-cd.svg)](https://www.npmjs.com/package/serverless-ci-cd) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


## Install

using npm 
```bash
npm install --save serverless-ci-cd
```

using yarn 
```bash
yarn add  serverless-ci-cd
```


## Usage

This lib help you setup ci/cd workflow .
In the build step you dont need to specify the stage name .
In the release step you will use the artifacts generate in the build step to deploy in your prefer stage (dev , prod , ...)


## Configuration



```yaml
plugins:
  - serverless-ci-cd
  
custom:
  stage: ${opt:stage, self:provider.stage}
  region: ${opt:region, self:provider.region}
    
```

## commande 

for build step : 

```bash
sls package-ci  --verbose
```

for release step : 
```bash
sls deploy-cd --package .serverless -r eu-west-1 --stage prod --verbose
```




## Serverless.yml Example

```yaml
service: serverless-ci-cd-example

plugins:
  - serverless-ci-cd

custom:
  stage: ${opt:stage, self:provider.stage}
  region: ${opt:region, self:provider.region}

provider:
  name: aws
  runtime: nodejs6.10
  environment:
    queue_name: {Ref ExampleQueue}

functions:
  example:
    handler: functions/example.handle
    events:
      - http:
          path: example
          method: get
          cors: true

resources:
  Resources:
    ExampleQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: example-queue-${self:custom.stage}
 
```


