"use strict";
var sys = require("sys");
var exec = require("child_process").exec;
let stage_name_variable = "stagenamevariable";
let directory = ".serverless";
var fs = require("fs");

const changeStringInFile = (fileName, newString) => {
  exec(
    `sed -i'.original' -e 's/stagenamevariable/'${newString}'/g' ${directory}/${fileName}`
  );
  exec(`rm ${directory}/${fileName}.original`);
};

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.commands = {
      "package-ci": {
        lifecycleEvents: ["package"]
      }
    };
    this.hooks = {
      "before:package-ci:package": this.package_ci.bind(this),
      "before:deploy:deploy": this.beforDeploy.bind(this)
    };
  }

  package_ci() {
    this.serverless.cli.log("package_ci");
    var packageProcess = exec(
      `sls package  --stage ${stage_name_variable} --verbose`
    );
    packageProcess.stdout.on("data", data => {
      console.log(data);
    });
  }

  beforDeploy() {
    this.serverless.cli.log("start:deploy");
    changeStringInFile(
      "cloudformation-template-update-stack.json",
      this.options.stage
    );
    changeStringInFile("serverless-state.json", this.options.stage);
  }
}

module.exports = ServerlessPlugin;
