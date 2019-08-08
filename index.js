"use strict";
var sys = require("sys");
var exec = require("child_process").exec;
let stage_name_variable = "stagenamevariables";
let directory = ".serverless";
const changeStringInFile = (fileName, newString) => {
  var fs = require("fs");

  fs.readFile(`${directory}/${fileName}`, "utf8", function(err, data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace(`/${stage_name_variable}/g`, newString);

    fs.writeFile(`${directory}/${fileName}`, result, "utf8", function(err) {
      if (err) return console.log(err);
    });
  });
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
    exec(
      `sls package  --stage ${stage_name_variable}`,
      (err, stdout, stderr) => {
        this.serverless.cli.log(stdout);
      }
    );
    this.serverless.cli.log("dddd:dddd");
  }

  beforDeploy() {
    changeStringInFile(
      "cloudformation-template-update-stack.json",
      this.options.stage
    );
    changeStringInFile("serverless-state.json", this.options.stage);
    this.serverless.cli.log(
      "afterPackageFinalize:afterPackageFinalize:afterPackageFinalize"
    );
  }
}

module.exports = ServerlessPlugin;
