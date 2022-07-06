var fs = require("fs");
var child_process = require("child_process");

const plugin_name = process.argv[2];

fs.readFile("/usr/src/app/plugins.json", function (err, data) {
  if (err) throw err;

  var json = JSON.parse(data).plugins;
  var existing = false;

  json.forEach((plugin) => {
    if (plugin.name === plugin_name) {
      existing = true;
      child_process.exec(
        `cd ${plugin_name} && git pull origin main --rebase`,
        (err) => {
          if (err) throw err;

          console.log(`${plugin_name.toUpperCase()} is now updated`);
        }
      );
    }
  });

  if (!existing) {
    console.log(`${plugin_name.toUpperCase()} is not yet installed`);
  }
});
