Kublai
===

A basic tile server MBTILES, a striped down version of [my previous efforts](https://github.com/calvinmetcalf/kublai).

Install with:

```bash
npm install -g kublai

```
  Usage: bin.js [options]

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -i, --ip <host>                IP address to bind to, defaults to process.env.IP or 127.0.0.1
    -p, --port <port>              port to listen on, defaults to process.env.PORT or 7027
    -n, --number <forks>           number of forks, defaults to require("os").cpus().length
    -t, --tile <path>              path to folder with tiles, defaults to "."
    -d, --domains <domain>         out domains, defaults to ip:port, add a "*" for subdomains
    -c, --config <path to config>  path to a config file

```

config file should be a json file with keys coresponding to the bracketed terms, an object like this is what kublai takes if used in node.
