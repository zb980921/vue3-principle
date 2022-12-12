let activeEffect
const effectStack = []

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    effectStack.push(effectFn)
    activeEffect = effectStack.at(-1)
    fn() // 执行过程中，会触发 track 函数
    effectStack.pop()
    activeEffect = effectStack.at(-1)
  }
  effectFn.deps = []
  effectFn()
}

const bucket = new WeakMap()

const data = { foo: true, bar: true }
const obj = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },

  set(target, key, newVal) {
    target[key] = newVal
    trigger(target, key)
  },
})

function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect) // activeEffect 指向 effectStack 栈顶元素

  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effectsToRun = new Set(effects)
  effectsToRun.forEach(fn => fn())
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

effect(() => {
  console.log('effectFn1 run')
  effect(() => {
    console.log('effectFn2 run')
    obj.bar
  })
  obj.foo
})

setTimeout(() => {
  obj.foo = false
}, 1000)
