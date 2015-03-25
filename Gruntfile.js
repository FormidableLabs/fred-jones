'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js', '!lib/assets/**/*.js']
      },
      test: {
        src: ['test/**/*.js','!test/fixtures/**/*.js']
      },
      assets: {
        src: ['lib/assets/scripts/*.js']
      }
    },
    casper : {
      test: {
        files: {
          'reports/casper.xml': [
            'test/casper-overview.js',
            'test/casper-sortable-file-list.js'
          ],
        },
        options : {
          test: true,
          verbose: true,
          'fail-fast': true,
          'log-level': 'error',
          concise: true,
          parallel : false,
          concurrency : 2
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-casper');

  grunt.registerTask('runtest',function(){
    var done = this.async();

    grunt.util.spawn({
        cmd : './bin/plato',
        args : [
          '-q',
          '-dtmp',
          '-ttest report',
          'test/fixtures/a.js','test/fixtures/b.js','test/fixtures/empty.js'
        ]
      },
      function(err, result, code){
        console.log(result.stdout);
        console.log(result.stderr);
        if (err || code !== 0) {
          grunt.fatal('Running plato binary failed');
        }
        done();
      }
    );
  });

  grunt.registerTask('runbin',function(){
    var done = this.async();

    grunt.util.spawn({
        cmd : './bin/plato',
        args : [
          '-q',
          '-r',
          '-l.jshintrc',
          '-xvendor|bundles',
          '-dreports',
          '-tPlato report',
          'lib/'
        ]
      },
      function(err, result, code){
        console.log(result.stdout);
        if (err || code !== 0) {
          console.log(err);
          grunt.fatal('Running plato binary failed');
        }
        done();
      }
    );
  });

  grunt.registerTask('test', ['jshint', 'nodeunit', 'runtest', 'runbin', 'casper']);
  grunt.registerTask('default', ['test']);

};
