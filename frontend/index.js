import { arr, html } from './utils'

const elTable = document.querySelector('table')
const elBtnInit = document.querySelector('.btn-init')
const elBtnAnswer = document.querySelector('.btn-answer')
const elHint = document.querySelector('.hint')

let maps, answerTable

// bind events
elBtnInit.onclick = initTable
elBtnAnswer.onclick = showAnswer
elTable.onclick = cell_click // 只需要绑一个点击回调
elTable.oninput = onInput
elTable.onkeydown = onKeyDown

// main
// TODO loading anim
const loading = <h1 class="loading">loading...</h1>
document.body.append(loading)
fetch('https://f97jw7.deta.dev/get-puzzle')
  .then(resp => resp.json())
  .then(data => {
    maps = data.puzzle
    answerTable = genAnswerTable(maps)
    console.log(maps, answerTable)
    initTable()
    setTimeout(() => {
      loading.remove()
      document.querySelector('main').style.opacity = 1
      document.querySelector('main').style.transform = 'scale(1) translateY(0)'
    })
  })

// function defs
function getQuestionCoords({ direction, answer, start_coor }) {
  const [y0, x0] = start_coor
  return answer.split('').map((char, i) => {
    let xM = 0,
      yM = 0
    if (direction === 'h') xM = 1
    else if (direction === 'v') yM = 1
    return { x: x0 + xM * i, y: y0 + yM * i, char, i }
  })
}

function genAnswerTable(questions) {
  const t = arr(10, arr(10, [], true), true)
  questions.forEach(q =>
    getQuestionCoords(q).forEach(({ x, y, char, i }) =>
      t[x][y].push({ char, localIndex: i, question: q })
    )
  )
  return t
}

function getSelectedInputs(targetEl, after = true) {
  const [x0, y0] = getXY(targetEl)
  return Array.from(elTable.querySelectorAll('.selected > input')).filter(
    el => {
      const [x, y] = getXY(el)
      if (targetEl['data-vh'] === 'h') {
        return after ? x >= x0 : x < x0
      } else {
        return after ? y >= y0 : y < y0
      }
    }
  )
}

function onKeyDown(evt) {
  const inputs = getSelectedInputs(evt.target, false)
  if (
    evt.target.tagName !== 'INPUT' ||
    evt.key !== 'Backspace' ||
    inputs.length <= 0 ||
    evt.target.value
  )
    return
  inputs[inputs.length - 1].focus()
}

function onInput(evt) {
  if (/[\u4e00-\u9fa5]+/.test(evt.data)) {
    const inputs = getSelectedInputs(evt.target)
    for (let i = 0; i < inputs.length; i++) {
      if (!evt.data[i]) {
        inputs[i].focus()
        break
      }
      inputs[i].value = evt.data[i]
      check_answer(inputs[i])
    }
  }
}

function getAnswer(x, y) {
  return answerTable[x][y].length ? answerTable[x][y][0].char : null
}

function check_answer(input) {
  const [x, y] = input.getAttribute('data-xy').split(',')
  const ans = getAnswer(x, y)
  if (input.value === ans) {
    input.style.display = 'none'
    const td = input.parentElement
    td.innerHTML = ans
    td.classList.add('correct')
  }
}

function getInputByCoord(x, y) {
  return document.querySelector(`input[data-xy="${x},${y}"]`)
}

// return [x,y]
function getXY(el) {
  return el.getAttribute('data-xy').split(',')
}

function cell_click(event) {
  let clickedInput = event.target
  if (clickedInput.tagName !== 'INPUT') {
    return
  }

  const [x, y] = getXY(clickedInput)
  const ansObjs = answerTable[x][y]
  let activeQuestion

  document
    .querySelectorAll('.selected')
    .forEach(el => el.classList.remove('selected'))

  if (ansObjs.length === 2) {
    if (clickedInput['data-vh'] === 'h') clickedInput['data-vh'] = 'v'
    else clickedInput['data-vh'] = 'h'
    activeQuestion = ansObjs.filter(
      obj => obj.question.direction === clickedInput['data-vh']
    )[0].question
  } else {
    activeQuestion = ansObjs[0].question
    clickedInput['data-vh'] = activeQuestion.direction
  }

  getQuestionCoords(activeQuestion).forEach(({ x, y }) => {
    const input = getInputByCoord(x, y)
    input.parentElement.classList.add('selected')
    // const input = td.querySelector('input')

    input && (input['data-vh'] = clickedInput['data-vh'])
  })

  elHint.innerText = activeQuestion.hint
}

function showAnswer() {
  for (let x = 0; x < 10; x++)
    for (let y = 0; y < 10; y++) {
      const input = getInputByCoord(x, y)
      if (!input) continue
      input.value = getAnswer(x, y)
      input.disabled = true
    }
}

// TODO use flex
function initTable() {
  elTable.innerHTML = ''
  // JSX 语法支持 https://vanilla-jsx.github.io/vanilla-jsx/#/Lowercase
  const rows = arr(10).map((_, y) => {
    const tr = <tr></tr>
    tr.append(
      ...arr(10).map((_, x) => {
        const isEmpty = !answerTable[x][y].length > 0
        return (
          <td class={isEmpty ? 'empty' : ''} data-xy={x + ',' + y}>
            {!isEmpty && (
              <input
                class="input_cell"
                type="text"
                data-xy={x + ',' + y}
              ></input>
            )}
          </td>
        )
      })
    )
    return tr
  })
  elTable.append(...rows)
}
