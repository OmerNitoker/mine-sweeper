"use strict";



/////////////////////////////////////////////////////////
//-------------------Boards and Mats------------------//
///////////////////////////////////////////////////////
function createMat(rowIdx, colIdx) {
  const mat = [];
  for (var i = 0; i < rowIdx; i++) {
    const row = [];
    for (var j = 0; j < colIdx; j++) {
      row.push('');
    }
    mat.push(row);
  }
  return mat;
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

function getEmptyCells(board) {
  var emptyCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j];
      if (currCell.type === FLOOR && currCell.gameElement === null)
        emptyCells.push({ i, j });
    }
  }
  if (!emptyCells.length) return null;
  return emptyCells;
}

////////////////////////////////////////////
//-----------------Rendering-------------//
//////////////////////////////////////////

// --> Renders into an already made board in the HTML
function renderBoard(board) {
  var strHtml = ''
  for (var i = 0; i < board.length; i++) {
    const row = board[i]
    strHtml += '<tr>'
    for (var j = 0; j < board.length; j++) {
      const cell = row[j]
      const cellId = `cell-${i}-${j}`
      strHtml += `<td id="${cellId}" onclick="onCellClicked(this, event)" class="cell unclicked"></td>`
    }
    strHtml += '</tr>'
  }
  const elTable = document.querySelector('table')
  elTable.innerHTML = strHtml
}



function renderCell(elCell, location) {
  const currCell = gBoard[location.i][location.j]
  if (currCell.isMine) {
    elCell.innerText = MINE
    elCell.classList.add('boom')
    gameOver()
    return
  }
  const value = currCell.minesAroundCount ? currCell.minesAroundCount : ''
  elCell.innerText = value
  if (value === '') expandShown(gBoard, location.i, location.j)
}

/////////////////////////////////////////
//-----------------Randoms-------------//
////////////////////////////////////////

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
  // The maximum is exclusive and the minimum is inclusive
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/////////////////////////////////////////////////////
//--------------extra shit and sheet--------------//
////////////////////////////////////////////////////
function makeId(length = 6) {
  var txt = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return txt;
}

function handleModal() {
  gElModal.classList.toggle("hidden");
  /* <div class='modal hidden'>modal</div> */
}

function playSound() {
  const audio = new Audio("filename.type");
  audio.play();
}

function onHandleKey(event) {
  const i = gGamerPos.i;
  const j = gGamerPos.j;
  switch (event.key) {
    case "ArrowLeft":
    case "a":
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
    case "d":
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
    case "w":
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
    case "s":
      moveTo(i + 1, j);
      break;
  }
}