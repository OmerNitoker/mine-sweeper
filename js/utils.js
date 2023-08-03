"use strict";

function renderBoard(board) {
  var strHtml = ''
  for (var i = 0; i < board.length; i++) {
    const row = board[i]
    strHtml += '<tr>'
    for (var j = 0; j < board.length; j++) {
      const cell = row[j]
      const cellId = `cell-${i}-${j}`
      strHtml += `<td id="${cellId}" onclick="onCellClicked(this)" oncontextmenu="onCellMarked(this, event)" class="cell"></td>`
    }
    strHtml += '</tr>'
  }
  const elTable = document.querySelector('tbody')
  elTable.innerHTML = strHtml
}

function renderCell(elCell, location) {
  const currCell = gBoard[location.i][location.j]
  const valInCell = getCellVal(currCell)
  if (valInCell === MINE) {
    renderLife()
    elCell.innerText = MINE
    if (gLifes === 1) {
      elCell.classList.add('boom')
      gameLost()
      return
    }
    setTimeout(showNone, 1000, elCell)
    gLifes--
  }
  else {
    elCell.classList.add('clicked')
    gGame.shownCount++
    elCell.innerText = valInCell
    if (valInCell === '') expandShown(gBoard, location.i, location.j)
    checkIfWon()
  }
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}


