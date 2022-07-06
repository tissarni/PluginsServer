var fs = require("fs");
var child_process = require("child_process");

const plugin_repository = process.argv[2];
const plugin_name = process.argv[3];

let obj = { name: plugin_name, repository: plugin_repository };

fs.readFile("/usr/src/app/plugins.json", function (err, data) {
  if (err) throw err;

  var json = JSON.parse(data).plugins;
  var existing = false;

  json.forEach((plugin) => {
    if (plugin.name === plugin_name) {
      console.log(`${plugin_name.toUpperCase()} is already saved`);
      existing = true;

      return existing;
    }
  });

  if (existing) return;

  json.push(obj);
  child_process.exec(
    `git clone ${plugin_repository} /usr/src/app/${plugin_name}`,
    (err) => {
      if (err) throw err;
      fs.writeFile(
        "/usr/src/app/plugins.json",
        JSON.stringify({ plugins: json }),
        (err) => {
          if (err) throw err;
          console.log(`${plugin_name.toUpperCase()} is now cloned and saved`);
        }
      );
    }
  );
});
