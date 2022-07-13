var fs = require("fs");
var child_process = require("child_process");

fs.readFile("/usr/src/app/plugins.json", function (err, data) {
  if (err) throw err;

  var json = JSON.parse(data).plugins;

  const conf = generate_config(json);

  fs.writeFile("/usr/src/app/nginx/nginx.conf", conf, (err) => {
    if (err) throw err;
    console.log("Plugins reverse proxy ready for building");
  });

  child_process.exec(
    `docker stop nginx_host && docker system prune -f -a --volumes`,
    (err) => {
      console.log(`Clean nginx container and rebuild`);
      child_process.exec(
        `cd nginx && docker build -t nginx_host . && docker run --name nginx_host --restart unless-stopped -dp 8080:80 nginx_host && cd ..`,
        (err) => {
          if (err) throw err;
          console.log(
            `Plugins container reverse proxy built and running on port 8080`
          );
        }
      );
    }
  );
});

const generate_config = (json) => {
  var conf = `
    events {}

    http {
        server {
    
        listen 80 default_server;
        listen [::]:80 default_server;
    
        location / {
            # First attempt to serve request as file, then
            # as directory, then fall back to displaying a 404.
            try_files $uri $uri/ =406;
        }
    `;
  json.forEach((plugin) => {
    conf += `
            location /plugins/${plugin.name} {
                proxy_pass http://172.17.0.1:${plugin.port};
            }
        `;
  });
  conf += `}}`;
  return conf;
};

/*proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;*/