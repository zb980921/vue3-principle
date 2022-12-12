let activeEffect // 存储被注册的副作用函数

// 用于注册副作用函数
function effect(fn) {
  activeEffect = fn
  fn()
}

// 存放副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'Hello, world!' }

// 代理原始数据
const obj = new Proxy(data, {
  // 拦截读取操作，收集副作用函数
  get(target, key) {
    if (activeEffect) {
      bucket.add(activeEffect)
    }
    return target[key]
  },

  // 拦截设置操作，执行副作用函数
  set(target, key, newVal) {
    target[key] = newVal
    bucket.forEach(fn => fn())
    return true // 操作成功
  },
})

effect(() => {
  console.log('effect fun')
  document.body.textContent = obj.text
})

setTimeout(() => {
  // obj.text = 'Hello, Vue3!'
  obj.notExist = 'Hello, Vue3!'
}, 1500)
