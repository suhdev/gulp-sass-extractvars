# gulp-sass-extractvars

A simple GulpJS plugin to extract sass variables from sass files and optionally replace values with brand settings (variables). See examples below: 


## Examples 

### 1. Default usage: 

```js

const gulp = require('gulp'),
    concat = require('gulp-concat'), 
    pump = require('pump'), 
    path = require('path'), 
    sassExtract = require('gulp-sass-extractvars'); 

gulp.task('default',(cb)=>{
    pump([
        gulp.src(['./sass/**/*.scss']),
        sassExtract(),
        concat('_vars.scss')
        gulp.dest('./myoutputdir')
    ],(err)=>{
        cb(err); 
    });
});

```

### 2. Using filters 

The plugin supports a filtering variable values i.e. intercepting the value that gets writting to the output file. 
This is ideal if you want to only change specific variables based on some settings. 

```js

//Replacing only variables that have the 'bg-color' or 'fg-color' keeping everything else as is. 

gulp.task('default',(cb)=>{
    pump([
        gulp.src(['./sass/**/*.scss']),
        sassExtract({
            data:{
                //extracted variables that have the value '#ffffff' will 
                //have their value replaced with '$brand-color-1'
                '#ffffff':'$brand-color-1'
            },
            //filter callback receives the name of the variable, the trimmed value 
            //which is the value after removing any white space and '!default' 
            //the original value
            //lines is an array to allow adding customised lines to the output before the 
            //variable gets added to the output, and vars is any variables that have pre-defined 
            //value. See example 3 for more details. 
            filter(name,trimmed,val,lines,vars){
                if (name.indexOf('fg-color') !== -1 || name.indexOf('bg-color') !== -1){
                    return vars[trimmed]; 
                }
                return trimmed;
            }
        }),
        concat('_vars.scss')
        gulp.dest('./myoutputdir')
    ],(err)=>{
        cb(err); 
    });
});

```


### 3. Using brandingVariablesFile 

You can also provide a path to a file containing all your branding variables. You can use this to fine tune variable values replacements. 

```js

gulp.task('default',(cb)=>{
    pump([
        gulp.src(['./sass/**/*.scss']),
        sassExtract({
            brandingVariablesFile:path.resolve(process.cwd(),'./_settings.scss'),
            //filter callback receives the name of the variable, the trimmed value 
            //which is the value after removing any white space and '!default' 
            //the original value
            //lines is an array to allow adding customised lines to the output before the 
            //variable gets added to the output, and vars is any variables that have pre-defined 
            //value. See example 3 for more details. 
            filter(name,trimmed,val,lines,vars){
                if (name.indexOf('fg-color') !== -1 || name.indexOf('bg-color') !== -1){
                    return vars[trimmed]; 
                }
                return trimmed;
            }
        }),
        concat('_vars.scss')
        gulp.dest('./myoutputdir')
    ],(err)=>{
        cb(err); 
    });
});

```