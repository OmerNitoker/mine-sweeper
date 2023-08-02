'use strict'

var gBoard
const gLevel = {
    SIZE: 12,
    MINES: 32
}
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
const MINE = '💣'
const FLAG = '🚩'

function onInit() {
    gBoard = buildBoard();
    console.log('gBoard:', gBoard)

    renderBoard(gBoard);
}


function buildBoard() {
    const board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    //set mines
    var count = gLevel.MINES
    while (count > 0) {
        const randRowIdx = getRandomInt(0, gLevel.SIZE)
        const randColIdx = getRandomInt(0, gLevel.SIZE)
        const currCell = board[randRowIdx][randColIdx]
        if (currCell.isMine === true) continue
        currCell.isMine = true
        count--
    }

    //count neighbors
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j) //func in utils
        }
    }
    return board
}

function getCellVal(cell) {
    if (cell.isMine) return MINE
    if (cell.minesAroundCount === 0) return ''
    return cell.minesAroundCount
}

function onCellClicked(elCell, ev) {

    if (elCell.classList.contains('clicked')) return
    elCell.classList.add('clicked')
    elCell.classList.remove('unclicked')
    const location = getCellCoord(elCell.id)
    console.log('location:', location)

    renderCell(elCell, location)
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

            if (elCell.classList.contains('clicked')) continue
            else {
                elCell.classList.add('clicked')
                elCell.classList.remove('unclicked')
                const value = (currCell.minesAroundCount) ? currCell.minesAroundCount : '' 
                elCell.innerText = value
            }
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



