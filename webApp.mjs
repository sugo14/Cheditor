import { ChessBoard } from './chessBoard.mjs';
import { Vector, positionToString, stringToPosition } from './vector.mjs';

let selectedCellElement = null;
let possibleMoves = [];
let board = new ChessBoard();
let turnPlayer = "white";
let chess_board;
let audio = {
    whiteMove: new Audio('sfx/move-white.mp3'),
    blackMove: new Audio('sfx/move-black.mp3'),
    capture: new Audio('sfx/capture.mp3'),
    check: new Audio('sfx/check.mp3'),
    checkmate: new Audio('sfx/game-end.webm'),
    promote: new Audio('sfx/promote.mp3'),
}

function imageForPiece(piece) {
    return "images/chess-pieces/" + piece.color[0] + piece.appearance.toUpperCase() + ".svg";
}

function createBoard() {
    let start = Date.now();
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            let pos = new Vector(x, y);
            let cell = document.createElement("div");
            let text = document.createElement("p");
            text.innerText = positionToString(pos);
            cell.appendChild(text);
            cell.addEventListener("mousedown", function () {
                const start = Date.now();
                if (selectedCellElement != null) {
                    chess_board.querySelector("#selected").id = "";
                }
                else {
                    possibleMoves = [];
                }
                for (let move of possibleMoves) {
                    if (move.to.equals(stringToPosition(text.innerText))) {
                        board.forceMove(move);
                        if (move.isCapture) {
                            audio["capture"].play();
                        }
                        else {
                            audio[turnPlayer + "Move"].play();
                        }
                        turnPlayer = (turnPlayer == "white") ? "black" : "white";
                        possibleMoves = [];
                        break;
                    }
                }
                selectedCellElement = cell.querySelector("p");
                renderBoard();
                const end = Date.now();
                console.log("render took " + (end - start) + "ms");

            })
            cell.className = "cell ";
            if ((x + y) % 2 == 0) {
                cell.className += "white";
            } else {
                cell.className += "black";
            }
            chess_board.appendChild(cell);
        }
    }
    let end = Date.now();
    console.log("board creation took " + (end - start) + "ms");
    renderBoard();
}

function clearBoard() {
    let cell = document.querySelectorAll(".cell");
    for (let c of cell) {
        c.id = "";
        c.querySelectorAll("*:not(p)").forEach(e => e.remove());
    }
}

function renderBoard() {
    clearBoard();
    document.body.style.backgroundColor = (turnPlayer == "white") ? "var(--whitePiece)" : "var(--blackPiece)";
    let cells = chess_board.childNodes;
    // render pieces
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            let cell2 = cells[y * board.width + x + 1];
            let piece2 = board.at(new Vector(x, y));
            if (piece2 != null) {
                let pieceElement2 = document.createElement("img");
                pieceElement2.src = imageForPiece(piece2);
                pieceElement2.className = "piece";
                cell2.appendChild(pieceElement2);
            }
        }
    }
    // render selected piece and possible moves
    if (selectedCellElement == null) {
        return;
    }
    let selectedCellPosStr = selectedCellElement.innerText;
    if (board.at(selectedCellPosStr) != null && board.at(selectedCellPosStr).color == turnPlayer) {
        // render selected piece
        let selectedSymbol = document.createElement("div");
        selectedSymbol.id = "selected";
        selectedCellElement.parentNode.appendChild(selectedSymbol);
        // render possible moves
        possibleMoves = board.validateMoves(board.possibleMovesForPiece(stringToPosition(selectedCellPosStr)), turnPlayer);
        // REMOVE THIS RIGHT NOW
        for (let move of possibleMoves) {
            let cell = document.querySelectorAll("p");
            for (let c of cell) {
                if (positionToString(move.to) == c.innerText) {
                    if (move.isCapture) {
                        let captureSymbol = document.createElement("div");
                        captureSymbol.id = "possibleCapture";
                        c.parentNode.appendChild(captureSymbol);
                    }
                    else {
                        let moveSymbol = document.createElement("div");
                        moveSymbol.id = "possibleMove";
                        c.parentNode.appendChild(moveSymbol);
                    }
                }
            }
        }
    }
    else {
        selectedCellElement = null;
    }
}

window.onload = function () {
    chess_board = document.getElementById("board");
    createBoard();
}
