# Sx (javascript's swiss army knife)

[![Build Status via Travis CI](https://travis-ci.org/aynik/be.svg?branch=master)](https://travis-ci.org/aynik/sx)

`Sx` is a command line utility which executes javascript code.

Pull requests are very welcome!

## Install 

```shell
$ npm install -g sx
```

## Load auto-completion

Auto-completion is provided as a script for bash and zsh.

Test in current shell:

```shell
$ source <(sx --complete)
```

Install (bash):

```shell
$ echo "source <(sx --complete)" >> ~/.bashrc
```

Install (zsh):

```shell
$ echo "source <(sx --complete)" >> ~/.zshrc
```

Usage (core):

```shell
$ sx fs.<tab>
$ sx h<tab>
```

Usage (external module):

```shell
$ npm install -g lodash
$ sx _.<tab>
```

## Features

- Various input modes, including list and JSON input parsing.
- Module auto-loading, not perfect but very handy for development or browsing.
- Auto-completion scripts for bash and zsh, module discovery.
- Poor man's beautifier (JSON.stringify).

## Documentation

### Usage

```shell
$ sx [options] "commands"
```

### Options

* [`--pretty, -p`](#pretty)
* [`--json, -j`](#json)
* [`--input, -i`](#input)
* [`--list, -l`](#list)
* [`--reduce [memo], -r [memo]`](#reduce)
* [`--async, -a`](#async)
* [`--filter, -f`](#filter)
* [`--string, -s`](#string)

### Combos

* [`-jil, --json --input --list`](#json-input-list)
* [`-jilr [memo], --json --input --list --reduce [memo]`](#json-input-list-reduce)

### Practical examples

* [`Express static server`](#express-static-server)

---

## Options

<a name="pretty" />
### sx --pretty | -p 

Pretty prints produced output, in case it's an object or an array.

__Examples__

#### An introductory hello world

```shell
$ sx -p "{hello:'world'}"

{
    "hello": "world"
}
```

<a name="json" />
### sx --json | -j

Accepts input as JSON, useful for chaining sx calls.

__Examples__

#### Fetches geoip data and prints user's city

```shell
$ curl -sL http://freegeoip.net/json | sx -ji i.city

Berlin
```

<a name="input" />
### sx --input | -i

Starts accepting input trough stdin, and exposes each line as `i`.

__Examples__

#### Prints all user's processes pids

```shell
$ ps | sx -i 'i.match(/\d+/)[0]'

337
345
4118
79235
97048
```

<a name="list" />
### sx --list | -l

Treats all input passed through stdin as an array of lines, and exposes it as `l`.

__Examples__

#### Counts all matching occurrences

```shell
grep "console.log" * | sx -l l.length

5
```

<a name="reduce" />
### sx --reduce [memo] | -r [memo]

Performs reduce operations instead of map when used with combo `-il`.

__Examples__

#### Sums all file sizes recursively from the current directory

```shell
$ find . -type f -exec stat -f '%z' {} \; | sx -jl l | sx -jilr 0 "a+(i/1024)" | sx -i "i+'kb'"

1004.939453125kb
```

<a name="async" />
### sx --async | -a

Expects an asynchronous result, code must pass result to print callback exposed as `a`.

__Examples__

#### Echoes all incoming random bytes

```shell
$ /dev/urandom | sx -a "process.stdin.on('data', a); process.stdin.resume()" 

...
```

<a name="filter" />
### sx --filter | -f

Uses provided code as a predicate to test input.

__Examples__

#### Returns only javascript files

```shell
ls | sx -fi "path.extname(i) === '.js'"

jayscript.js
```

<a name="string" />
### sx --string | -s

Calls current object's toString method.

__Examples__

#### Inspects http.createServer

```shell
$ sx -s http.createServer

// vim: filetype=javascript
function (requestListener) {
      return new Server(requestListener);
}
```

## Combos

<a name="json-input-list" />
### sx --json --input --list | -jil

Accepts JSON input, treating it as a list.

__Examples__

#### Get all even numbers in a given range

```shell
$ sx '_.range(8)' | sx -jilf i%2==0

0
2
4
6
```

<a name="json-input-list-reduce" />
### sx --json --input --list --reduce [memo] | -jilr [memo]

Accepts JSON input, treating it as a list and performing reduction on it.

__Examples__

#### Sum all numbers for a given range

```shell
$ sx '_.range(4)' | sx -jilr 0 a+i

6
```

## More examples

#### Express static server

```shell
$ npm install -g express
$ sx 'express.call().use(express.static("./")).listen(3000); "http://localhost:3000"'

http://localhost:3000
```

#### HTTP GET with request

```shell
$ npm install -g request
$ sx -a 'request.call(0, "http://google.com", function(err, resp, body){ a(body) })'

...
```


