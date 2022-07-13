var fs = require("fs");
var child_process = require("child_process");

const plugin_repository = process.argv[2];
const plugin_name = process.argv[3];
var port = 8001;

fs.readFile("/usr/src/app/plugins.json", function (err, data) {
  if (err) throw err;

  var json = JSON.parse(data).plugins;
  var existing = false;

  json.forEach((plugin) => {
    if (plugin.port >= port) {
      port = plugin.port + 1;
    }
    if (plugin.name === plugin_name) {
      console.log(`${plugin_name.toUpperCase()} is already saved`);
      existing = true;

      return existing;
    }
  });

  if (existing) return;

  let obj = { name: plugin_name, repository: plugin_repository, port: port };

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
          console.log(
            `${plugin_name.toUpperCase()} is now cloned and saved \nWaiting for ${plugin_name.toUpperCase()} build`
          );
        }
      );
      child_process.exec(
        `cd ${plugin_name} && docker build -t ${plugin_name} . && docker run --name ${plugin_name} --restart unless-stopped -dp ${port}:${port} -e SERVER_PORT=${port} -e SERVER_PREFIX='/plugins/${plugin_name}' ${plugin_name}  && cd ..`,
        (err) => {
          if (err) throw err;
          console.log(
            `${plugin_name.toUpperCase()} built and running on port ${port}`
          );
          child_process.exec(`start`, () => {
            console.log(
              `${plugin_name.toUpperCase()} Reachable from host on http://localhost:8080/plugins/${plugin_name}`
            );
          });
        }
      );
    }
  );
});
