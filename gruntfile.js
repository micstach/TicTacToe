module.exports = function (grunt) {
    grunt.initConfig({
        typescript: {
            base: {
                src: ["*.ts"],
                options: {
                    module: 'amd',
                    watch: true,
                    target: 'ES5',
                    sourceMap: true
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("default", ["typescript"]);
};