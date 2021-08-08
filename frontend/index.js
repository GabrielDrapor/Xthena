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

// main
// TODO loading anim
elTable.appendChild(<h1>loading...</h1>)
fetch('https://f97jw7.deta.dev/get-puzzle')
  .then(resp => resp.json())
  .then(data => {
    maps = data.puzzle
    answerTable = genAnswerTable(maps)
    console.log(maps, answerTable)
    initTable()
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

function onInput(evt) {
  if (/[\u4e00-\u9fa5]+/.test(evt.data)) {
    const [x0, y0] = getXY(evt.target)
    const dir = evt.target['data-vh']
    Array.from(elTable.querySelectorAll('.selected > input'))
      .filter(el => {
        const [x, y] = getXY(el)
        if (dir === 'h') {
          return x >= x0
        } else {
          return y >= y0
        }
      })
      .forEach((input, i) => {
        if (!evt.data[i]) return
        input.value = evt.data[i]
        check_answer(input)
      })
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

function get_td_by_coor(x, y) {
  return document.querySelector(`td[data-xy="${x},${y}"]`)
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
  }

  getQuestionCoords(activeQuestion).forEach(({ x, y }) => {
    const td = get_td_by_coor(x, y)
    td.classList.add('selected')
    const input = td.querySelector('input')
    input && (input['data-vh'] = clickedInput['data-vh'])
  })

  elHint.innerText = activeQuestion.hint
}

function showAnswer() {
  answerTable.map((r, y) =>
    r.map(
      (chars, x) =>
        chars.length && (get_td_by_coor(x, y).innerText = chars[0].char)
    )
  )
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
