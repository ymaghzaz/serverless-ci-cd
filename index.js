"use strict";

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
    this.commands = {};
    this.hooks = {
      "before:package:initialize": this.beforePackageInit.bind(this),

      "before:deploy:deploy": this.beforDeploy.bind(this)
    };
  }

  beforePackageInit() {
    this.options.stage = stage_name_variable;
    this.serverless.cli.log("beforePackageInit:beforePackageInit");
  }

  beforDeploy() {
    console.log("this.options.stage", this.options.stage);

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
