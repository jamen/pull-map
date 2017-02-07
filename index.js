module.exports = map
map.sync = syncMap
map.async = asyncMap
map.through = throughMap

function map (fn) {
  return fn.length > 1 ? asyncMap(fn) : syncMap(fn)
}

function syncMap (fn) {
  return function (read) {
    return function (end, write) {
      read(end, function (end, data) {
        if (end) return write(end)
        try {
          data = fn(data)
        } catch (err) {
          return read(err, write)
        }
        write(null, data)
      })
    }
  }
}

function asyncMap (fn) {
  var busy = false
  var endLate
  var endWrite

  return function (read) {
    return function next (end, write) {
      if (endLate) return write(endLate)
      if (end) {
        endLate = end
        if (!busy) return read(end, write)
        return read(end, function () {
          if (!busy) return write(end)
          endWrite = write
        })
      }

      function done (err, data) {
        busy = false
        if (endLate) {
          write(endLate)
          endWrite(endLate)
        } else if (err) {
          next(err, write)
        } else {
          write(null, data)
        }
      }

      read(null, function (end, data) {
        if (end) return write(end)
        if (endLate) return write(endLate)
        busy = true
        fn(data, done)
      })
    }
  }
}

function throughMap (fn) {
  if (fn.length > 1) {
    return asyncMap(function (data, done) {
      fn(data, function (err, ret) {
        done(err, ret === undefined ? data : ret)
      })
    })
  } else {
    return syncMap(function (data) {
      var ret = fn(data)
      return ret === undefined ? data : ret
    })
  }
}
