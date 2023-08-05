'use strict'

var gBoard
var gGame
var gIntervalId
var gLifes
var gIsLost = false
var gIsWon = false
var gIsHintActive
var gIsManual = false
var gManualPre = false
var gMegaHintClicks = 0
var gMegaHintCells = []
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
    gIsHintActive = false
    gManualPre = false
    if (gIsManual) hideModal()
    gIsManual = false
    stopTime()
    renderFlagsLeft()
    renderLife()
    renderTime()
    renderBoard(gBoard); //in utils
    renderHints()
    renderSafeClicks()
    showSmiley()
    megaHintRestart()
}


function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isMine: false,
                isShown: false,
                isMarked: false
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
    const currCell = gBoard[location.i][location.j]
    if (gMegaHintClicks > 0) {
        elCell.classList.add('mark')
        gMegaHintCells.push(location)
        gMegaHintClicks--
        if (gMegaHintClicks === 0) {
            megaHintOff()
            showArea(gBoard, gMegaHintCells)
            setTimeout(hideArea, 2000, gBoard, gMegaHintCells)
        }
        else if (gMegaHintClicks === 1) changeModal()
        return
    }
    if (!gGame.isOn && !gIsManual) {
        startTime()
        gGame.isOn = true
        setMines(gBoard, location)
        CountNegs(gBoard)
    }
    if (gManualPre) {
        elCell.innerText = MINE
        currCell.isMine = true
        gLevel.MINES++
        renderFlagsLeft()
        return
    }
    if (!gGame.isOn && gIsManual) {
        startTime()
        gGame.isOn = true
    }
    if (elCell.classList.contains('clicked') || elCell.classList.contains('marked')) return
    if (gIsHintActive) {
        showCellHint(elCell)
        hideHint()
        return
    }
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
    if (board[rowIdx][colIdx].minesAroundCount !== 0) return
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
                currCell.isShown = true
                gGame.shownCount++
                const value = (currCell.minesAroundCount) ? currCell.minesAroundCount : ''
                elCell.innerText = value
                expandShown(board, i, j)
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
    const location = getCellCoord(elCell.id)
    const currCell = gBoard[location.i][location.j]
    if (elCell.classList.contains('clicked')) return
    elCell.classList.toggle('marked')
    if (elCell.classList.contains('marked')) {
        currCell.isMarked = true
        elCell.innerText = FLAG
        gGame.markedCount++
        renderFlagsLeft()
    }
    else {
        currCell.isMarked = false
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
                currCell.isShown = true
                var content = currCell.minesAroundCount
                if (currCell.minesAroundCount === 0) content = ''
                if (currCell.isMine) content = MINE
                elCell.innerText = content
            }
            else if (elCell.classList.contains('marked') && !currCell.isMine) {
                elCell.classList.add('clicked')
                currCell.isShown = true
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
            const currCell = gBoard[i][j]
            if (currCell.isShown || currCell.isMarked) continue
            var elCell = document.querySelector(`#cell-${i}-${j}`)
            currCell.isMarked = true
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

function hintActivate(elBulb) {
    if (!gGame.isOn) return
    gIsHintActive = true
    elBulb.classList.add('glow')
}

function renderHints() {
    for (var i = 0; i < 3; i++) {
        const elHint = document.querySelector(`.hint${i + 1}`)
        if (elHint.classList.contains('hide')) elHint.classList.remove('hide')
        if (elHint.classList.contains('glow')) elHint.classList.remove('glow')

    }
}

function showCellHint(elCell) {
    // if (!gGame.isOn) return
    const location = getCellCoord(elCell.id)
    console.log('location:', location)          /////////////////////////////////////////////////////
    const currCell = gBoard[location.i][location.j]
    const cellContent = getCellVal(currCell)
    console.log('cellContent:', cellContent)

    elCell.innerText = cellContent
    setTimeout(showNone, 1000, elCell)

}

function hideHint() {
    for (var i = 0; i < 3; i++) {
        const elHint = document.querySelector(`.hint${i + 1}`)
        if (elHint.classList.contains('glow')) {
            elHint.classList.remove('glow')
            elHint.classList.add('hide')
        }
    }
    gIsHintActive = false
}

function showSafeClick(board) {
    const elSafeCount = document.querySelector('.safe-clicks span')
    var count = +(elSafeCount.innerText)
    if (count === 0) return
    const SafeCellLocation = foundSafeCell(board)
    const elSafeCell = document.querySelector(`#cell-${SafeCellLocation.i}-${SafeCellLocation.j}`)
    elSafeCell.classList.add('mark')
    setTimeout(() => {
        elSafeCell.classList.remove('mark');
    }, 3000)
    count--
    elSafeCount.innerText = count
}

function foundSafeCell(board) {
    const safeCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMine) safeCells.push({ i, j })
        }
    }
    const randIdx = getRandomInt(0, safeCells.length)
    return safeCells[randIdx]
}

function renderSafeClicks() {
    const elSafeCount = document.querySelector('.safe-clicks span')
    elSafeCount.innerText = 3
}

function manualInit() {
    onInit()
    gManualPre = true
    gIsManual = true
    const elModal = document.querySelector('.manual-modal')
    elModal.classList.remove('hide')
    gLevel.MINES = 0
    renderFlagsLeft()
}

function playManual() {
    gManualPre = false
    CountNegs(gBoard)
    hideMines(gBoard)
}

function hideMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isMine) {
                const elCell = document.querySelector(`#cell-${i}-${j}`)
                elCell.innerText = ''
            }
        }
    }
}

function hideModal() {
    const elModal = document.querySelector('.manual-modal')
    elModal.classList.add('hide')
}

function megaHintInit() {
    const elModal = document.querySelector('.mega-modal')
    elModal.classList.remove('hide')
    gMegaHintClicks = 2
    const elBtn = document.querySelector('.mega-hint')
    elBtn.style.backgroundColor = "white"
}

function megaHintRestart() {
    gMegaHintClicks = 0
    gMegaHintCells = []
    const elBtn = document.querySelector('.mega-hint')
    if (elBtn.classList.contains('hide')) elBtn.classList.remove('hide')
    elBtn.style.backgroundColor = "rgb(175, 108, 237)"
}

function showArea(board, locations) {
    for (var i = locations[0].i; i <= locations[1].i; i++) {
        for (var j = locations[0].j; j <= locations[1].j; j++) {
            const currCell = board[i][j]
            if (currCell.isShown || currCell.isMarked) continue
            const elCell = document.querySelector(`#cell-${i}-${j}`)
            const content = getCellVal(currCell)
            elCell.classList.add('clicked')
            elCell.innerText = content
        }
    }
    const elCellStart = document.querySelector(`#cell-${locations[0].i}-${locations[0].j}`)
    elCellStart.classList.remove('mark')
    const elCellEnd = document.querySelector(`#cell-${locations[1].i}-${locations[1].j}`)
    elCellEnd.classList.remove('mark')
}

function hideArea(board, locations) {
    
    for (var x = locations[0].i; x <= locations[1].i; x++) {
        for (var y = locations[0].j; y <= locations[1].j; y++) {
            const currCell = board[x][y]
            if (!currCell.isShown && !currCell.isMarked) {
                const elCell = document.querySelector(`#cell-${x}-${y}`)
                elCell.innerText = ''
                elCell.classList.remove('clicked')
            }
        }
    }
    
}

function megaHintOff() {
    const elBtn = document.querySelector('.mega-hint')
    elBtn.classList.add('hide')
    const elModal = document.querySelector('.mega-modal')
    elModal.classList.add('hide')
    
}

function changeModal() {
    const elSpan = document.querySelector('.mega-modal p span')
    elSpan.innerText = 'bottom right'
}

