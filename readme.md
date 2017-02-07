
# pull-map

> Create sync, async, or through maps in pull-streams

```js
var map = require('pull-map')

pull(
  pull.values([1, 2, 3, 4, 5]),

  // Sync map
  map(num => num * 3),

  // Async map
  map((num, done) => {
    hash(num, done)
  }),

  pull.log()
)
```

The [`map`](#api_map) function is like [`pull.map`](https://github.com/pull-stream/pull-stream/blob/master/docs/throughs/map.md) and [`pull.asyncMap`](https://github.com/pull-stream/pull-stream/blob/master/docs/throughs/async-map.md) combined, by sync or async depending if the `done` callback is provided.  There is also [`map.through`](#api_map_through), which passes data on `undefined`.

## Installation

```sh
$ npm install --save pull-map
```

## Usage

<a name="api_map"></a>
### `map(fn)`

A [through stream]() that maps values with `map(x => ...)` or async map with `map((x, cb) => ...)`.  Async map's callback takes `cb(err, data)`.  One function for all your pull-stream mapping needs!

```js
// A sync map
var foo = map(source => source.toLowerCase())

// An async map
var bar = map((source, done) => {
  fs.readFile(source, done)
})
```

<a name="api_map_through"></a>
### `map.through(fn)`

The same sync/async functionality as [`map`](#api_map), except passes on data if it receives `undefined`.  Useful when you only want to replace some of the data in the pipeline.

```js
pull(
  pull.values([1, 2.5, 3, 4.5, 5])
  map.through(function (num) {
    if (num !== Math.floor(num)) return -num
  })
  pull.collect(function (err, nums) {
    console.log(nums)
    // => [1, -2.5, 3, -4.5, 5]
  })
)
```

<a name="api_sync_async">
### `map.sync(fn)`
### `map.async(fn)`

The sync and async map methods behind [`map`](#api_map).

```js
pull(
  count(),
  map.sync(x => x * 3)
  map.async(function (x, done) {
    hash(x, done)
  }),
  pull.log()
)
```

## License

MIT © [Jamen Marz](https://git.io/jamen)

---

[![version](https://img.shields.io/npm/v/pull-map.svg?style=flat-square)][package] [![travis](https://img.shields.io/travis/pull-map/jamen.svg?style=flat-square)](https://travis-ci.org/pull-map/jamen) [![downloads/month](https://img.shields.io/npm/dm/pull-map.svg?style=flat-square)][package] [![downloads](https://img.shields.io/npm/dt/pull-map.svg?style=flat-square)][package] [![license](https://img.shields.io/npm/l/pull-map.svg?style=flat-square)][package] [![support me](https://img.shields.io/badge/support%20me-paypal-green.svg?style=flat-square)](https://www.paypal.me/jamenmarz/5usd) [![follow](https://img.shields.io/github/followers/jamen.svg?style=social&label=Follow)](https://github.com/jamen)
[package]: https://npmjs.com/package/pull-map
