const div = document.createElement('div')
export function html(strs, ...values) {
  div.innerHTML = strs.reduce((acc, cur, i) => acc + cur + values[i] ?? '', '')
  return div.firstElementChild
}

export function arr(len, v = null, clone = false) {
  const rst = Array(len).fill(v)
  if (clone && typeof v === 'object') {
    return rst.map(() => JSON.parse(JSON.stringify(v)))
  }
  return rst
}
