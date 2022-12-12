function renderer(vnode, container) {
  console.log(typeof vnode.tag)
  if (typeof vnode.tag === 'string') {
    mountElement(vnode, container)
  } else if (typeof vnode.tag === 'function' || typeof vnode.tag === 'object') {
    mountComponent(vnode, container)
  }
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.tag)
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      el.addEventListener(key.substring(2).toLowerCase(), vnode.props[key])
    }
  }

  if (typeof vnode.children === 'string') {
    el.appendChild(document.createTextNode(vnode.children))
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => renderer(child, el))
  }

  container.appendChild(el)
}

function mountComponent(vnode, container) {
  let subtree
  if (typeof vnode.tag === 'object') {
    subtree = vnode.tag.render()
  } else if (typeof vnode.tag === 'function') {
    subtree = vnode.tag()
  }
  renderer(subtree, container)
}
