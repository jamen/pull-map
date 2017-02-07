var test = require('tape')
var pull = require('pull-stream')
var map = require('./')

/**
 * A lot of these test are taken from pull-stream/pull-stream
 * So I can make sure maps are compatible, modified to match this project's API
 * Credit goes to those authors.  <3
 * As for other tests (e.g. map.through), those are mine.
 */

test('sync map throughs ends stream', function (t) {
  var err = new Error('unwholesome number')
  pull(
    pull.values([1,2,3,3.4,4]),
    map(function (e) {
      if(e !== ~~e)
        throw err
    }),
    pull.drain(null, function (_err) {
      t.equal(_err, err)
      t.end()
    })
  )
})

test('async map', function (t) {
  pull(
    pull.count(),
    pull.take(21),
    map(function (data, cb) {
      return cb(null, data + 1)
    }),
    pull.collect(function (err, ary) {
      console.log(ary)
      t.equal(ary.length, 21)
      t.end()
    })
  )
})

test('abort async map', function (t) {
  t.plan(2)

  var err = new Error('abort')

  var read = pull(
    pull.infinite(),
    map(function (data, cb) {
      setImmediate(function () {
        cb(null, data)
      })
    })
  )

  read(null, function (end) {
    if(!end) throw new Error('expected read to end')
    t.ok(end, "read's callback")
  })

  read(err, function (end) {
    if(!end) throw new Error('expected abort to end')
    t.ok(end, "Abort's callback")
    t.end()
  })
})

test('abort async map (async source)', function (t) {
  t.plan(2)

  var err = new Error('abort')

  var read = pull(
    function(err, cb) {
      setImmediate(function() {
        if (err) return cb(err)
        cb(null, 'x')
      })
    },
    map(function (data, cb) {
      setImmediate(function () {
        cb(null, data)
      })
    })
  )

  read(null, function (end) {
    if(!end) throw new Error('expected read to end')
    t.ok(end, "read's callback")
  })

  read(err, function (end) {
    if(!end) throw new Error('expected abort to end')
    t.ok(end, "Abort's callback")
    t.end()
  })
})

test('async map aborts when map errors', function (t) {
  t.plan(2)
  var ERR = new Error('abort')
  pull(
    pull.values([1,2,3], function (err) {
      console.log('on abort')
      t.equal(err, ERR, 'abort gets error')
      t.end()
    }),
    map(function (data, cb) {
      cb(ERR)
    }),
    pull.collect(function (err) {
      t.equal(err, ERR, 'collect gets error')
    })
  )
})

test('through map passes data', function (t) {
  t.plan(2)

  pull(
    pull.values([1, 2.5, 3, 4.5, 5]),
    map.through(function (data) {
      if (data !== ~~data) return 0
    }),
    pull.collect(function (err, data) {
      t.same(data, [1, 0, 3, 0, 5], 'maps through')
    })
  )

  pull(
    pull.values([1, 2.5, 3, 4.5, 5]),
    map.through(function (data, done) {
      setImmediate(function () {
        if (data !== ~~data) done(null, 0)
        else done(null)
      })
    }),
    pull.collect(function (err, data) {
      t.same(data, [1, 0, 3, 0, 5], 'maps through async')
    })
  )
})
