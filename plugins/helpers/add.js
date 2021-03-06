var fs = require("fs");
var child_process = require("child_process");

const plugin_repository = process.argv[2];
const plugin_name = process.argv[3];
var plugin_id = "4d214440-aea7-11ec-9d8f-7bc26ef1b8f1";
var plugin_secret = "ahcIlFGv5i6Ar9DKDhbBeJgINMRGLv2E/30hs5JmByU=";
if (process.argv[4] && process.argv[5]) {
  plugin_id = process.argv[4];
  plugin_secret = process.argv[5];
}
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
        `cd ${plugin_name} && docker build -t ${plugin_name} . && docker run --name ${plugin_name} --network=test-net --restart unless-stopped -dp ${port}:${port} -e SERVER_PORT=${port} -e SERVER_PREFIX='/plugins/${plugin_name}' -e CREDENTIALS_ENDPOINT='http://172.64.0.1:8080' -e CREDENTIALS_SECRET=${plugin_secret} -e CREDENTIALS_ID=${plugin_id} ${plugin_name}  && cd ..`,
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

//docker run -it --add-host host.docker.internal:host-gateway --name jitsi --restart unless-stopped -p 8001:8001 -e SERVER_PORT=8001 -e SERVER_PREFIX='/plugins/jitsi' -e CREDENTIALS_ENDPOINT='http://172.17.0.1:8080' -e CREDENTIALS_SECRET='XDdOHEln3Lr3/aJucXtstTyopXjFtBPVXMmGZJHSt/E=' -e CREDENTIALS_ID='b8a486b0-ac3f-11ec-9ebe-6d03b350718c' jitsi bash
