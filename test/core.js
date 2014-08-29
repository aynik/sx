var test = require('tape').test;
var exec = require('child_process').exec;
var fs = require('fs');

var testOut = function(t, success){
    return function(err, stdout, stderr){
        t.notOk(err);
        t.notOk(stderr);
        success(stdout.substr(0, stdout.length - 1));
    };
};

test("Should run all tests", function(t){ 
    t.test("sx --completion", function(t){
        t.plan(3);
        exec('./bin/sx --completion', testOut(t, function(stdout){
            t.same(fs.readFileSync('./extra/completion.sh', 'utf-8'), stdout);
        }));
    });

    t.test("sx --escaping", function(t){
        t.plan(3);
        exec('./bin/sx --escaping', testOut(t, function(stdout){
            t.same(fs.readFileSync('./extra/escaping.sh', 'utf-8'), stdout);
        }));
    });

    t.test("sx --pretty", function(t){
        t.plan(3);
        exec('./bin/sx -p "{a:1}"', testOut(t, function(stdout){
            t.same("{\n    \"a\": 1\n}", stdout);
        }));
    });

    t.test("sx --json", function(t){
        t.plan(3);
        exec('./bin/sx "{a:\'b\'}" | ./bin/sx -jx "x.a"', testOut(t, function(stdout){
            t.same("b", stdout);
        }));
    });

    t.test("sx --line", function(t){
        t.plan(3);
        exec('./bin/sx 3 | ./bin/sx -x "+x+5"', testOut(t, function(stdout){
            t.same("8", stdout);
        }));
    });

    t.test("sx --list", function(t){
        t.plan(3);
        exec('for n in 1 2 3; do echo $n; done | ./bin/sx -l "l[1]"', testOut(t, function(stdout){
            t.same("2", stdout);
        }));
    });

    t.test("sx --async", function(t){
        t.plan(3);
        exec('./bin/sx -a "setTimeout(a.bind(0, 1), 100)"', testOut(t, function(stdout){
            t.same("1", stdout);
        }));
    });

    t.test("sx --filter", function(t){
        t.plan(3);
        exec('./bin/sx 1 | ./bin/sx -fx "x==1"', testOut(t, function(stdout){
            t.same("1", stdout);
        }));
    });

    t.test("sx --string", function(t){
        t.plan(3);
        exec('./bin/sx -s "Function()"', testOut(t, function(stdout){
            t.same("// vim: filetype=javascript\nfunction anonymous() {}", stdout);
        }));
    });

    t.test("sx --infile", function(t){
        t.plan(3);
        exec('./bin/sx -jbi package.json b.name', testOut(t, function(stdout){
            t.same("sx", stdout);
        }));
    });

    t.test("sx --outfile", function(t){
        t.plan(3);
        exec('./bin/sx -o .tmp 123 && echo $(cat .tmp)', testOut(t, function(stdout){
            t.same("123", stdout);
        }));
    });

    t.test("sx --file", function(t){
        t.plan(3);
        exec('./bin/sx -bF .tmp "(parseInt(b, 10) * 2)" && echo $(cat .tmp) && rm .tmp', testOut(t, function(stdout){
            t.same("246", stdout);
        }));
    });
});

