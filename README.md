Kublai
===

A basic tile server MBTILES, a striped down version of [my previous efforts](https://github.com/calvinmetcalf/kublai).

Install with:

```bash
npm install -g kublai
```

```
  Usage: kublai [options]

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -i, --ip <host>                IP address to bind to, defaults to process.env.IP or 127.0.0.1
    -p, --port <port>              port to listen on, defaults to process.env.PORT or 7027
    -t, --tile <path>              path to folder with tiles, defaults to "."
    -n, --number <forks>           number of forks, defaults to require("os").cpus().length
    -d, --domains <domain>         out domains, defaults to ip:port, add a "*" for subdomains
    -c, --config <path to config>  path to a config file

```

config file should be a json file with keys coresponding to the bracketed terms, an object like this is what kublai takes if used in node.

The [demo](http://codeforboston.github.io/kublai) is a tiled version of [this cold coast map](http://www.mass.gov/anf/research-and-tech/it-serv-and-support/application-serv/office-of-geographic-information-massgis/datalayers/usgshistcoastal.html).