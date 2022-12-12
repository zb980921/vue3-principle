let activeEffect
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn) // 执行 effectFn 之前，清除与之关联的依赖集合
    activeEffect = effectFn
    fn()
  }
  effectFn.deps = [] // 存储所有与该副作用函数相关联的依赖集合
  effectFn()
}

const bucket = new WeakMap()

const data = { ok: true, text: 'Hello, world!' }
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
  deps.add(activeEffect)

  activeEffect.deps.push(deps) // 将依赖集合添加到 activeEffect.deps 数组中
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
  console.log('effect run')
  // 当 obj.ok 为 false 时，修改 obj.text 不应该触发 effect
  document.body.textContent = obj.ok ? obj.text : 'not'
})

setTimeout(() => {
  obj.ok = false
}, 1000)

setTimeout(() => {
  obj.text = 'I want'
}, 2000)

/*
  1. 执行 cleanup ，清空与副作用函数相关联的 deps
  2. 赋值给 activeEffect ，执行 fn
  3. 根据 fn 函数执行过程中使用到的属性，触发 track 函数
  4. 将该属性对应的副作用函数集合添加到 activeEffect 的 deps 数组中
  5. 修改属性值，触发 trigger 函数
*/
