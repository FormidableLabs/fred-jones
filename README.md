<h1 align="center">Fred Jones</h1>
<h4 align="center">
  Fred Jones will help you visualize project health
</h4>

![Fred Jones](https://upload.wikimedia.org/wikipedia/en/4/47/Fred_Jones.png)

## Installation
Install the module with: `npm install -g fred-jones`

## Usage

### From the commandline

```
Usage : fred-jones [options]
  -h, --help                     output usage information
  -V, --version                  output the version number
  -v, --verbose                  Extra verbose output
  -h, --jsHint [value]           Path to jsHint file
  -d, --outputDirectory [value]  Specify output directory relative to execution root
  -x, --excludes <files>         Files to exclude
  -f, --files <files>            Files to process
```

__Example__

```shell
fred-jones -f "./client/js/**/*.js" -x "./client/js/vendor/**/*"
```

### From scripts

```
var fredJones = require('fred-jones');

var files = [
  'path/to/javascript/file1.js',
  'path/to/javascript/fileN.js'
];

var options = {
  outputDir: './output/dir'
};

var callback = function (report){
// once done the analysis,
// execute this
};

fredJones.inspect(files, options, callback);
```

## Data sources

  - Complexity data by [Phil Booth](https://github.com/philbooth)'s [complexity-report](https://github.com/philbooth/complexityReport.js)
  - Lint data from [jshint](https://github.com/jshint/jshint/)

## Credits

  - https://github.com/es-analysis/plato
  - @jsoverson

## License

[MIT License](http://opensource.org/licenses/MIT)
