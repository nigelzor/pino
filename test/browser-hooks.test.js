'use strict'
const test = require('tape')
const pino = require('../browser')

test('calls send function after write', t => {
  t.plan(6)

  const logger = pino({
    hooks: {
      logMethod (args, method) {
        t.ok(Array.isArray(args))
        t.is(args.length, 3)
        t.deepEqual(args, ['a', 'b', 'c'])

        t.is(typeof method, 'function')
        t.is(method.name, 'LOG')

        method.apply(this, [args.join('-')])
      }
    },
    browser: {
      write: (o) => {
        t.is(o.msg, 'a-b-c')
      }
    }
  })

  logger.info('a', 'b', 'c')
})

test('fatal method invokes hook', t => {
  t.plan(2)

  const logger = pino({
    hooks: {
      logMethod (args, method) {
        t.pass()
        method.apply(this, [args.join('-')])
      }
    },
    browser: {
      write: (o) => {
        t.is(o.msg, 'a')
      }
    }
  })

  logger.fatal('a')
})

test('children get the hook', t => {
  t.plan(4)

  const expected = ['a-b', 'c-d']

  const root = pino({
    hooks: {
      logMethod (args, method) {
        t.pass()
        method.apply(this, [args.join('-')])
      }
    },
    browser: {
      write: (o) => {
        t.is(o.msg, expected.shift())
      }
    }
  })
  const child = root.child({ child: 'one' })
  const grandchild = child.child({ child: 'two' })

  child.info('a', 'b')
  grandchild.info('c', 'd')
})
