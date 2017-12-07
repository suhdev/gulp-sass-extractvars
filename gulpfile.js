const gulp = require('gulp'),
    concat = require('gulp-concat'),
    path = require('path'),
    pump = require('pump'),
    sass = require('./index'); 


gulp.task('default',(cb)=>{
    pump([
        gulp.src([path.resolve(process.cwd(), './sass/*.scss')]),
        sass({
                // filter(name,trimmed,val,lines,vars){
                //     if (name.indexOf('fg-color') !== -1 || name.indexOf('bg-color') !== -1){
                //         return vars[trimmed]; 
                //     }
                //     return trimmed;
                // },
                varNameRegex:/(fg-color|bg-color|font-size|padding-y|padding-x)/,
                brandingVariablesFile:path.resolve(__dirname,'_settings.scss'),
                // withComments: true,
        }),
        concat('_extracted.scss'),
        gulp.dest(path.resolve(process.cwd(), './dist'))
    ],(err)=>{
        cb(err); 
    });
});