"use strict";
var exec = require("child_process").exec;
let stage_name_variable = "stagenamevariable";
let directory = ".serverless";

const cmdExcute = (cmd, message) => {
  return new Promise((resolve, reject) => {
    const cpfile = exec(cmd);
    cpfile.on("close", code => {
      if (code !== 0) {
        reject(code);
      }
      console.log(message);
      resolve("okey");
    });
  });
};

const changeStringInFile = async (fileName, newString) => {
  console.log("file:replace");
  await cmdExcute(
    `sed -i'.original' -e 's/stagenamevariable/'${newString}'/g' ${directory}/${fileName}`,
    "file:replace:done"
  );
  console.log("file:remove");
  return cmdExcute(`rm ${directory}/${fileName}.original`, "file:remove:done");
};

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      "package-ci": {
        lifecycleEvents: ["package"]
      },
      "deploy-cd": {
        lifecycleEvents: ["deploy"]
      }
    };

    if (this.serverless.processedInput.commands[0] == "package-ci") {
      this.options.stage = stage_name_variable;
      this.serverless.service.provider.stage = stage_name_variable;
      this.serverless.config.stage = stage_name_variable;
      this.serverless.processedInput = {
        commands: ["package-ci"],
        options: { s: stage_name_variable, stage: stage_name_variable }
      };
    }

    this.hooks = {
      "before:package-ci:package": this.package_ci.bind(this),
      "before:deploy-cd:deploy": this.beforDeploy.bind(this)
      // "after:deploy:deploy": this.afterDeploy.bind(this)
    };
  }

  package_ci() {
    this.serverless.pluginManager.spawn("package", {
      stage: stage_name_variable,
      s: stage_name_variable
    });
  }

  async beforDeploy() {
    console.log("this.options", this.options);
    this.serverless.service.provider.stage = this.options.stage;
    this.serverless.cli.log("start:deploy");
    await changeStringInFile(
      "cloudformation-template-update-stack.json",
      this.options.stage
    );
    await changeStringInFile("serverless-state.json", this.options.stage);
    this.serverless.pluginManager.spawn("deploy");
  }
}

module.exports = ServerlessPlugin;
