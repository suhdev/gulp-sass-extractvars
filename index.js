const PLUGIN_NAME = 'gulp-sass-extractvars'; 
const through = require('through2'); 
const gutil = require('gulp-util');
const fs = require('fs'); 
const path = require('path');
const util = require('util');

let regex = /((\$[^\(\)\{\}\:\;]+?):([^\(\)\{\}\:\;]+?);)|(\/\*[\s\S]+?\*\/)|(\/\/[\s\S]+?\n)/g;
let regexWithoutComments = /((\$[^\(\)\{\}\:\;]+?):([^\(\)\{\}\:\;]+?);)/g;

module.exports = function(opts){
    var vars = {};
    let withComments = opts && opts.withComments;
    let reg = regex; 
    let commentFilter = (opts && opts.commentFilter) || function(c){return c;};
    let filter = (opts && opts.filter) || function(name,val,lines,vv){return vars[val] || val;};
    if (opts && typeof opts.brandingVariablesFile == "string"){
        if (fs.existsSync(opts.brandingVariablesFile)){
            var contents = fs.readFileSync(opts.brandingVariablesFile).toString(); 
            contents.replace(/(\$[^:;@\{\}\(\)]+):([^:;\{\}@\(\)]+);/g, (e, name, val) => {
                vars[val.replace(/[\s]*!default[\s]*/g, '')] = name; 
            })
        }
    }
    if (opts && opts.data){
        vars = {...vars,...opts.data};
    }

    function transform(file, encoding, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        } else if (file.isStream()) {
            cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        } else if (file.isBuffer()) {
            let contents = String(file.contents);
            let variables = [];
            variables.push(`// ${path.basename(file.path)} at ${file.path}`);
            reg.lastIndex = 0;
            contents.replace(reg, (e, ext, name, val,comment,otherComment) => {
                if (comment && withComments && typeof comment === "string"){
                    let ff = commentFilter(comment);
                    if (ff){
                        variables.push(ff); 
                    }
                } else if (otherComment && withComments && typeof otherComment === "string"){
                    let ff = commentFilter(otherComment);
                    if (ff){
                        variables.push(ff); 
                    }
                }else if(name && val){
                    let contextLines = []; 
                    let trimmedVal = filter(name, val.replace(/[\s]*!default[\s]*/g, ''), val,contextLines,vars);
                    if (trimmedVal){
                        if (contextLines.length){
                            variables.push(...contextLines);
                        }
                        variables.push(`${name}:${trimmedVal} !default;`);
                    }

                }
            });

            file.contents = new Buffer(variables.join('\n') + '\n\n');
            cb(null, file);
        }
    }
    
    return through.obj(transform);
}