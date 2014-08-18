module.exports = function compile(node){
    var noop = function(){ return '' };
    var rules = {  
        'Function': function(){
            var name = node.name ? ' ' + node.name : '',
                elements = node.elements ? node.elements.length ?
                        node.elements.map(compile) : [] : [];
                return (name ?  'var' + name + '=' : '')
                       + '(function' + name 
                       + '(' +node.params.join(',') + '){'
                       + elements.join(';') 
                       + '})';
        },
        'FunctionCall': function(){
            var name = node.name ? node.name.type ?
                compile(node.name) : node.name : '',
            args = node.arguments ? node.arguments.length ?
                node.arguments.map(compile) : [] : [];
            return name + '(' + args.join(',') + ')';
        },
        'PropertyAccess': function(){
            var base = node.base ?  compile(node.base) : '',
                name = node.name ?  node.name.type ?
                    compile(node.name) : node.name : '';
            if (name.toString()
                .match(/\d+|[^\w$_]+[\w\d$_]*/)) 
                    return base + '[' +name + ']';
            else return base + '.' +name; 
        },
        'Variable': function(){
            return node.name;
        },
        'NumericLiteral': function(){
            return node.value;
        },
        'StringLiteral': function(){
            var replaces = [
                ["\\r","\\r"],
                ["\\n","\\n"],
                ["\\\\","\\\\"],
            ];
            return '\"' +replaces.reduce(function(str, rep){
                return str.replace(new RegExp(rep[0],'g'),rep[1]); 
            }, node.value) + '\"';
        },
        'NullLiteral': function(){
            return 'null';
        },
        'BooleanLiteral': function(){
            return node.value; 
        },
        'RegularExpressionLiteral': function(){
            return '/' +node.body + '/' +node.flags;
        },
        'This': function(){
            return 'this';
        },
        'ArrayLiteral': function(){
            var elements = node.elements ?  node.elements.length ?
                node.elements.map(compile) : [] : [];
            return '[' + (elements.length ? elements.join(',') : '') + ']';
        },
        'ObjectLiteral': function(){
            var properties = node.properties ?  node.properties.length ?
                node.properties.map(compile) : [] : [];
            return '{' + (properties.length ? properties.join(',') : '') + '}';
        },
        'PropertyAssignment': function(){
            var value = node.value ?  compile(node.value) : 'undefined';
            return '\"' +node.name + '\":' +value;
        },
        'GetterDefinition': function(){
            var body = node.body ?  node.body.length ?
                node.body.map(compile) : [] : [];
            return 'get ' +node.name + '(){' + body.join(';') + '}';
        },
        'SetterDefinition': function(){
            var body = node.body ?  node.body.length ?
                node.body.map(compile) : [] : [];
            return 'set ' +node.name + '(' +node.param
               + '){' +body.join(';') + '}';
        },
        'NewOperator': function(){
            var constructor = node.constructor ? node.constructor.type ?
                    compile(node.constructor) : node.constructor : '',
                args = node.arguments ?  node.arguments.length ?
                    node.arguments.map(compile) : [] : [];
            return 'new ' +constructor + '(' +args.join(',') + ')';
        },
        'FunctionCallArguments': noop,
        'PropertyAccessProperty': noop,
        'PostfixExpression': function(){
           var expression = node.expression ? compile(node.expression) : '';
           return expression +node.operator;
        },
        'UnaryExpression': function(){
           var expression = node.expression ? compile(node.expression) : '';
           return node.operator + ' ' +expression;
        },
        'ConditionalExpression': function(){
            var condition = node.condition ?  node.condition.type ?
                compile(node.condition) : node.condition : '',
              trueExpression = node.trueExpression ?  node.trueExpression.type ?
                compile(node.trueExpression) : node.trueExpression : '',
              falseExpression = node.falseExpression ?  node.falseExpression.type ?
                compile(node.falseExpression) : node.falseExpression : '';
            return condition + '?' + '(' + trueExpression + ')' 
                + ':' + '(' +falseExpression + ')';
        },
        'AssignmentExpression': function(){
            var left = node.left ?  compile(node.left) : 'undefined',
                right = node.right ?  compile(node.right) : 'undefined';
            return left +node.operator + (right.toString().indexOf('var') === 0 ?
                right.replace(/^var/,'') : right);
        },
        'Block': function(){
           var statements = node.statements ?  node.statements.length ?
                node.statements.map(compile) : [] : [];
           return statements.join(';'); 
        },
        'VariableStatement': function(){
            var declarations = node.declarations ?  node.declarations.length ?
                node.declarations.map(compile) : [] : [];
            return  'var ' + declarations.join(','); 
        },
        'VariableDeclaration': function(){
            var value = node.value ?  compile(node.value) : undefined;
            return node.name + (value === undefined ?  '' : '=' + value);
        },
        'BinaryExpression': function(){
            var left = node.left ?  compile(node.left) : 'undefined',
                right = node.right ?  compile(node.right) : 'undefined';
            if (node.operator === ',') node.operator = ',';
            else node.operator = node.operator;
            return left +node.operator +right;
        },
        'EmptyStatement': function(){
            return '';
        },
        'IfStatement': function(){
           var condition = node.condition ? compile(node.condition) : '',
              ifStatement = node.ifStatement ? compile(node.ifStatement) : '',
              elseStatement = node.elseStatement ?  compile(node.elseStatement) : '';
            return 'if (' +condition + '){' +ifStatement 
               + '}' +(elseStatement ?  ' else {' +elseStatement + '}' : '');
        },
        'DoWhileStatement': function(){
            var condition = node.condition ?  compile(node.condition) : '',
                statement = node.statement ?  compile(node.statement) : '';
            return 'do {' +statement + '} while(' +condition + ')';
        },
        'WhileStatement': function(){
            var condition = node.condition ?  compile(node.condition) : '',
                statement = node.statement ?  compile(node.statement) : '';
            return 'while(' +condition + ')' + '{' +statement + '}';
        },
        'ForStatement': function(){
           var initializer = node.initializer ? compile(node.initializer) : '',
               test = node.test ?  compile(node.test) : '',
               counter= node.counter ?  compile(node.counter) : '',
               statement = node.statement ?  compile(node.statement) : '';
            return 'for (' +initializer + ';' +test + ';' +counter + '){' 
                +statement + '}';
        },
        'ForInStatement': function(){
           var iterator = node.iterator ?  node.iterator.type ?
                    compile(node.iterator) : node.iterator : '',
               collection = node.collection ? compile(node.collection) : '',
               statement = node.statement ? compile(node.statement) : '';
            return 'for (' + iterator + ' in ' + collection + '){' 
                + statement + '}';
        },
        'ContinueStatement': function(){
            return 'continue';
        },
        'BreakStatement': function(){
            return 'break';
         },
        'ReturnStatement': function(){
            var value = node.value ? node.value.type ?
                compile(node.value) : node.value : '';
            return 'return' +(value ? ' ' : '') +value + ';';
        },
        'WithStatement': function(){
            var environment = node.environment ? compile(node.environment) : '',
                statement = node.statement ? compile(node.statement) : '';
            return 'with(' + environment + '){' +statement + '}';
        },
        'SwitchStatement': function(){
            var expression = node.expression ?  node.expression.type ?
                    compile(node.expression) : node.expression : '',
                clauses = node.clauses ?  node.clauses.length ?
                    node.clauses.map(compile) : [] : [];
            return 'switch(' + expression + '){'
                   + (clauses.length ? clauses.join('') : '') + '}';
        },
        'CaseClause': function(){
            var selector = node.selector ? node.selector.type ?
                    compile(node.selector) : node.selector : '\"\"',
                statements = node.statements ? node.statements.length ?
                    node.statements.map(compile) : [] : [];
            return 'case ' +selector + ':' 
                + (statements.length ? statements.join(';') : '');
        },
        'DefaultClause': function(){
            var statements = node.statements ? node.statements.length ?
                node.statements.map(compile) : [] : [];
            return 'default:' + statements.join(';');
        },
        'LabelledStatement': noop,
        'ThrowStatement': function(){
            var exception = node.exception ? node.exception.type ?
            compile(node.exception) : node.exception : '';
            return 'throw ' +exception;
        },
        'TryStatement': function(){
            var block = node.block ? compile(node.block) : '',
               _catch = node.catch ? compile(node.catch) : '',
               _finally = node.finally ? compile(node.finally) : '';
            return 'try{' + block + '}' +(_catch && _catch ) +(_finally && _finally );
        },
        'Catch': function(){
            var block = node.block ?  node.block.type ?
                compile(node.block) : node.block : '';
            return 'catch(' 
               +(node.identifier ? node.identifier : '')
               + '){' + block + '}';
        },
        'Finally': function(){
            var block = node.block ?  node.block.type ?
                compile(node.block) : node.block : '';
            return 'finally{' + block + '}';
        },
        'DebuggerStatement': noop,
        'Program': function(){
            var elements = node.elements ? node.elements.length ?
                node.elements.map(compile) : [] : [];
            return elements.filter(function(e){ return e !== ''; }).join(';');
        }
    };
    if (node && node.type in rules) return rules[node.type]();
};
