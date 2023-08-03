'use strict'

var gBoard
var gGame
var gIntervalId
var gLifes
var gIsLost = false
var gIsWon = false
const MINE = '💣'
const FLAG = '🚩'
const gLevel = {
    SIZE: 8,
    MINES: 14
}

function onInit() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard();
    gIsLost = false
    gIsWon = false
    gLifes = 3
    stopTime()
    renderFlagsLeft()
    renderLife()
    renderTime()
    renderBoard(gBoard); //in utils
    showSmiley()
}


function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isMine: false,
            }
        }
    }
    return board
}

function setMines(board, location) {
    var count = gLevel.MINES
    while (count > 0) {
        const randRowIdx = getRandomInt(0, gLevel.SIZE)
        const randColIdx = getRandomInt(0, gLevel.SIZE)
        const currCell = board[randRowIdx][randColIdx]
        if (currCell.isMine === true) continue
        if (randRowIdx === location.i && randColIdx === location.j) continue
        currCell.isMine = true
        count--
    }
    return board
}

function getCellVal(cell) {
    if (cell.isMine) return MINE
    if (cell.minesAroundCount === 0) return ''
    return cell.minesAroundCount
}

function onCellClicked(elCell) {
    const location = getCellCoord(elCell.id)
    if (!gGame.isOn) {
        startTime()
        setMines(gBoard, location)
        CountNegs(gBoard)
        gGame.isOn = true
    }
    if (elCell.classList.contains('clicked') || elCell.classList.contains('marked')) return
    renderCell(elCell, location) //in utils
}

function getCellCoord(strCellId) {
    const coord = {}
    const parts = strCellId.split('-')
    coord.i = +parts[1]
    coord.j = +parts[2]
    return coord
}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue;
            if (j < 0 || j >= board[0].length) continue;
            var currCell = gBoard[i][j]
            const elCell = document.querySelector(`#cell-${i}-${j}`)
            if (elCell.classList.contains('clicked') || elCell.classList.contains('marked')) continue
            else {
                elCell.classList.add('clicked')
                gGame.shownCount++
                const value = (currCell.minesAroundCount) ? currCell.minesAroundCount : ''
                elCell.innerText = value
            }
        }
    }

}

function CountNegs(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue;
            if (j < 0 || j >= board[0].length) continue;
            var currCell = board[i][j];
            if (currCell.isMine) count++;
        }
    }
    return count;
}

function onCellMarked(elCell, ev) {
    ev.preventDefault()
    if (elCell.classList.contains('clicked')) return
    elCell.classList.toggle('marked')
    if (elCell.classList.contains('marked')) {
        elCell.innerText = FLAG
        gGame.markedCount++
        renderFlagsLeft()
    }
    else {
        elCell.innerText = ''
        gGame.markedCount--
        renderFlagsLeft()
    }
}

function getBoardSize(btn) {
    if (btn.innerText === 'Beginner') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
    }
    else if (btn.innerText === 'Medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
    }
    else {
        gLevel.SIZE = 12
        gLevel.MINES = 32
    }
    onInit()
}

function gameLost() {
    gIsLost = true
    gGame.isOn = false
    showAll()
    showSmiley()
    stopTime()
}

function checkIfWon() {
    if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) gamewon()
}

function gamewon() {
    gGame.isOn = false
    gIsWon = true
    markAll()
    showSmiley()
    stopTime()
}

function showAll() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const currCell = gBoard[i][j]
            var elCell = document.querySelector(`#cell-${i}-${j}`)
            if (!(elCell.classList.contains('clicked')) && !(elCell.classList.contains('marked'))) {
                elCell.classList.add('clicked')
                var content = currCell.minesAroundCount
                if (currCell.minesAroundCount === 0) content = ''
                if (currCell.isMine) content = MINE
                elCell.innerText = content
            }
            else if (elCell.classList.contains('marked') && !currCell.isMine) {
                elCell.classList.add('clicked')
                elCell.innerText = '❌'
            }
        }
    }
}

function showSmiley() {
    var elSmiley = document.querySelector('.smiley')
    if (gIsLost) elSmiley.innerText = '😵‍💫'
    else if (gIsWon) elSmiley.innerText = '🤩'
    else elSmiley.innerText = '🙂'
}

function markAll() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var elCell = document.querySelector(`#cell-${i}-${j}`)
            if (elCell.classList.contains('clicked') || elCell.classList.contains('marked')) continue
            elCell.innerText = FLAG
            gGame.markedCount++
        }
    }
}

function startTime() {
    gIntervalId = setInterval(renderTime, 1000)
}

function stopTime() {
    clearInterval(gIntervalId)
    gIntervalId = 0
}

function renderTime() {
    const timeCount = gGame.secsPassed
    const mins = Math.floor(timeCount / 60) < 10 ? '0' + Math.floor(timeCount / 60) : Math.floor(timeCount / 60)
    const secs = timeCount % 60 < 10 ? '0' + timeCount % 60 : timeCount % 60
    const strHTML = `${mins}:${secs}`

    var elTimer = document.querySelector('.time span')
    elTimer.innerHTML = strHTML

    gGame.secsPassed++

}

function showNone(elCell) {
    elCell.innerText = ''
}

function renderLife() {
    if (!gGame.isOn) {
        for (var i = 0; i < gLifes; i++) {
            const elHeart = document.querySelector(`.heart${i + 1}`)
            elHeart.innerHTML = '&#10084;&#65039;'
        }
    }
    else {
        const elLife = document.querySelector(`.heart${gLifes}`)
        elLife.innerHTML = `&#129293;`
    }
}

function renderFlagsLeft() {
    const elFlagsLeft = document.querySelector('.flags-left span')
    const left = gLevel.MINES - gGame.markedCount 
    elFlagsLeft.innerText = `${left}`
}

