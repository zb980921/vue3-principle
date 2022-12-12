let activeEffect
function effect(fn) {
  activeEffect = fn
  fn()
}

const bucket = new WeakMap()

const data = { text: 'Hello, world!' }
const obj = new Proxy(data, {
  get(target, key) {
    if (!activeEffect) return target[key]

    // 根据 target 从 bucket 中取得 depsMap: key -> effects
    let depsMap = bucket.get(target)
    // 如果不存在 depsMap, 新建一个 Map 并与 target 关联
    if (!depsMap) {
      bucket.set(target, (depsMap = new Map()))
    }

    // 根据 key 取出 effects
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
    return target[key]
  },

  set(target, key, newVal) {
    target[key] = newVal
    const depsMap = bucket.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)
    effects && effects.forEach(fn => fn())
  },
})

effect(() => {
  console.log('effect fun')
  document.body.textContent = obj.text
})

setTimeout(() => {
  obj.text = 'Hello, Vue3!'
  obj.notExist = 'Hello, Vue3!'
}, 1500)
