<h1 align="center">Plato</h1>
<h4 align="center">
  Visualize JavaScript source complexity with plato.
</h4>

## Installation
Install the module with: `npm install -g plato`

## Usage

### From the commandline

```
Usage : plato [options] -d <output_dir> <input files>
  -h, --help
      Display this help text.
  -q, --quiet
      Reduce output to errors only
  -v, --version
      Print the version.
  -x, --exclude : String
      File exclusion regex
  -d, --dir : String *required*
      The output directory
  -l, --jshint : String
      Specify a jshintrc file for JSHint linting
  -t, --title : String
      Title of the report
  -D, --date : String
      Time to use as the report date (seconds, > 9999999999 assumed to be ms)
```

__Example__

```shell
plato -d report src
```

__Extended example__

```
plato -d report -l .jshintrc -t "My Awesome App" -x .json routes/*.js
```

### From scripts

```
var plato = require('plato');

var files = [
  'path/to/javascript/file1.js',
  ...
  'path/to/javascript/fileN.js'
];

var outputDir = './output/dir';
// null options for this example
var options = {
  title: 'Your title here'
};

var callback = function (report){
// once done the analysis,
// execute this
};

plato.inspect(files, outputDir, {}, callback);
```

## Data sources

  - Complexity data by [Phil Booth](https://github.com/philbooth)'s [complexity-report](https://github.com/philbooth/complexityReport.js)
  - Lint data from [jshint](https://github.com/jshint/jshint/)

## License

[MIT License](http://opensource.org/licenses/MIT)
