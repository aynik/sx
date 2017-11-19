# Sx

[![Build Status via Travis CI](https://travis-ci.org/aynik/sx.svg?branch=master)](https://travis-ci.org/aynik/sx)

`sx` is a command line utility which executes javascript code, mostly to process input and/or generate output.

Pull requests are very welcome!

## Install 

```bash
$ npm install -g sx
```

## Features

- Various input modes, including list and JSON input parsing.
- Standard and file I/O supported.
- Many automations: module auto-loading, last value auto-return, auto-escaping for zsh and auto-completion both for zsh and bash.
- Poor man's beautifier (JSON.stringify).
- An interactive REPL

## Command-line tool

### Usage

```bash
$ sx [options] "commands"
```

### Options

* [`--pretty, -p`](#pretty)
* [`--json, -j`](#json)
* [`--line, -x`](#line)
* [`--list, -l`](#list)
* [`--async, -a`](#async)
* [`--filter, -f`](#filter)
* [`--string, -s`](#string)
* [`--infile, -i [file]`](#infile)
* [`--outfile, -o [file]`](#outfile)
* [`--file, -F [file]`](#file)
* [`--dialect, -d [dialect]`](#dialect)

### Combos

* [`-jxl, --json --line --list`](#json-line-list)

### More examples

* [`Express static server`](#express-static-server)

### Extras

* [`Auto-completion`](#auto-completion)
* [`Auto-escaping`](#auto-escaping)
* [`Interactive REPL`](#interactive-repl)

---

## Options

<a name="pretty" />

### sx --pretty | -p 

Pretty prints produced output, in case it's an object or an array.

__Examples__

#### An introductory hello world

```bash
$ sx -p "{hello:'world'}"

{
    "hello": "world"
}
```

---

<a name="json" />

### sx --json | -j

Accepts input as JSON, useful for chaining sx calls.

__Examples__

#### Fetches geoip data and prints user's city

```bash
$ curl -sL http://freegeoip.net/json | sx -jx x.city

Berlin
```

---

<a name="line" />

### sx --line | -x

Starts accepting input trough stdin, and exposes each line as `x`.

__Examples__

#### Prints all user's processes pids

```bash
$ ps | sx -x 'x.match(/\d+/)[0]'

337
345
4118
79235
97048
```

---

<a name="list" />

### sx --list | -l

Treats all input passed through stdin as an array of lines, and exposes it as `l`.

__Examples__

#### Counts all matching occurrences

```bash
grep "console.log" * | sx -l l.length

5
```

---

<a name="async" />

### sx --async | -a

Expects an asynchronous result, code must pass result to print callback exposed as `a`.

__Examples__

#### Echoes all incoming random bytes

```bash
$ /dev/urandom | sx -a "process.stdin.on('data', a); process.stdin.resume()" 

...
```

---

<a name="filter" />

### sx --filter | -f

Uses provided code as a predicate to test input.

__Examples__

#### Returns only javascript files

```bash
$ ls | sx -fx "path.extname(x) === '.js'"

jayscript.js
```

---

<a name="string" />

### sx --string | -s

Calls current object's toString method.

__Examples__

#### Inspects http.createServer

```bash
$ sx -s http.createServer

// vim: filetype=javascript
function (requestListener) {
      return new Server(requestListener);
}
```

---

<a name="infile" />

### sx --infile [file] | -i [file]

Uses provided file as input instead of stdin.

__Examples__

#### Filters matching lines from file
```bash
$ sx -xlfi ~/.zshrc x.match\(/export PATH/\)

node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

---

<a name="outfile" />

### sx --outfile [file] | -o [file]

Uses provided file as output instead of stdout.

NOTE: Contents of output file will be wipped out preventively.

__Examples__

#### Saves input while writing stdout

```bash
$ tail -f /var/log/system.log | sx -xo local.log "console.log(x); x"

...
```

---

<a name="file" />

### sx --file [file] | -F [file]

Uses provided file as input instead of stdin and at the same time as output instead of stdout, could be used to mutate contents of files, writing to them after the contents are on memory.

NOTE: Contents of output file will be wipped out preventively.

__Examples__

#### Replaces file contents in place

```bash
$ sx -bF Makefile "b.replace(/win32/i, 'darwin')"
```

---

<a name="dialect" />

### sx --dialect [dialect] | -d [dialect]

Use another input dialect instead of javascript.

Javascript dialects are basically different languages which follow the style and the
semantics of javascript.

This library includes the following dialects:

### Standard Javascript (js): Common ECMAScript 5.

```js
function pow(a, b){
    for (var r = a, n = 0; n < b; n++) {
        r = r * a
    }
    return r
}

function head(arr){
    return arr.slice(0, 1);
}
```

### Go-Script (gs): A clone of [Go](http://golang.com) syntax without the type stuff.

```go
func pow(a, b){
    for r := a, n := 0; n < b; n++ {
        r = r * a
    }
    return r
}

func head(arr){
    return arr[0:1]
}
```

More information (will be available soon) on (node-jsjs)[http://github.com/aynik/jsjs] parser repository.

---

## Combos

<a name="line-list" />

### sx --json --line --list | -jxl

Accepts JSON input, treating it as a list and exposing each item.

__Examples__

#### Get all even numbers in a given range

```bash
$ sx '_.range(8)' | sx -jxlf x%2==0

0
2
4
6
```

---

## More examples

<a name="express-static-server" />

#### Express static server

```bash
$ npm install -g express
$ sx 'express.call().use(express.static("./")).listen(3000); "http://localhost:3000"'

http://localhost:3000
```

#### HTTP GET with request

```bash
$ npm install -g request
$ sx -a 'request.call(0, "http://google.com", function(err, resp, body){ a(body) })'

...
```

---

## Extras

<a name="auto-completion" />

### Auto-completion

Auto-completion is provided as a script for bash and zsh.

Test in current zsh:

```bash
$ source <(sx --completion)
```

Install (bash):

```bash
$ echo "source <(sx --completion)" >> ~/.bashrc
```

Install (zsh):

```bash
$ echo "source <(sx --completion)" >> ~/.zshrc
```

Usage (core):

```bash
$ sx fs.<tab>
$ sx h<tab>
```

Usage (external module):

```bash
$ npm install -g lodash
$ sx _.<tab>
```

---

<a name="auto-escaping" />

### Auto-escaping

Auto-escaping is provided as a function for zsh.

Install:

- First you'll have to find what are your zsh function paths.

```bash
$ echo $fpath

/usr/share/zsh/site-functions /usr/share/zsh/5.0.2/functions
```

Then chose the first of them, and install the script (you may need root permissions):

```bash
$ sudo sx --escaping > /usr/share/zsh/site-functions/sx-escape-magic
```

And add to your `.zshrc` an autoload command: 

```bash
$ echo "autoload -Uz sx-escape-magic" >> ~/.zshrc
$ echo "sx-escape-magic" >> ~/.zshrc
```

Now when you restart your shell you should be able to write javascript 
code and special characters will be automatically escaped.

---
<a name="interactive-repl" />

## Interactive REPL

As an extra, `sx` comes with an interactive REPL called `isx`. It allows to build interactive programs by offering a set of REPL commands.

### Usage

```bash
$ isx <session-filename.js (default: .session.js)> 
```

### In-REPL Commands

- **:load <session-filename.js>** loads a worker and a new session into it's buffer
- **:reload** reloads the worker and feeds in current buffer
- **:test** sets the repl in test mode (no code is saved into the buffer) 
- **:build** sets the repl in build mode (written code will be save into buffer) 
- **:write** writes the current buffer to it's session file
- **:drop N-N** drops lines from the buffer at the given range
- **:move N-N N** moves selected lines at the given range to a destination line number in the buffer
- **:print** prints the current buffer
- **:quit** exits the repl


