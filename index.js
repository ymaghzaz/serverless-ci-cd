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
    this.hooks = {
      "before:package-ci:package": this.package_ci.bind(this),
      "before:deploy-cd:deploy": this.beforDeploy.bind(this),
      "after:deploy:deploy": this.afterDeploy.bind(this)
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

  async beforDeploy() {
    console.log("this.options", this.options);
    this.serverless.cli.log("start:deploy");
    this.serverless.cli.log("file1");
    await changeStringInFile(
      "cloudformation-template-update-stack.json",
      this.options.stage
    );
    this.serverless.cli.log("file2");
    await changeStringInFile("serverless-state.json", this.options.stage);
    this.serverless.pluginManager.spawn("deploy");
  }
  afterDeploy() {
    console.log(okey);
  }
}

module.exports = ServerlessPlugin;
