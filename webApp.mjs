import { ChessBoard } from './chessBoard.mjs';
import { Vector, Move, positionToString, stringToPosition, MultiMove } from './vector.mjs';
import { pieces } from './chessPiece.mjs';

/* from https://www.sitepoint.com/delay-sleep-pause-wait/ */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function imageForPiece(piece) {
    let color = piece.color[0];
    let appearance = piece.appearance.toUpperCase();
    if (["K", "Q", "R", "B", "N", "P"].includes(appearance)) {
        return "images/standard-pieces/" + color + appearance + ".svg";
    }
    return "images/standard-pieces/" + color + appearance + ".png";
}

class ChessGame {
    constructor(boardElement) {
        this.selectedCellElement = null;
        this.board = new ChessBoard();
        this.lastMove = null;
        this.possibleMoves = [];
        this.boardElement = boardElement;
        this.audio = {
            whiteMove: new Audio('sfx/move-white.mp3'),
            blackMove: new Audio('sfx/move-black.mp3'),
            capture: new Audio('sfx/capture.mp3'),
            check: new Audio('sfx/check.mp3'),
            castle: new Audio('sfx/castle.mp3'),
            gameEnd: new Audio('sfx/game-end.mp3'),
            promote: new Audio('sfx/promote.mp3'),
        }
    }

    clearBoard() {
        let cell = document.querySelectorAll(".cell");
        for (let c of cell) {
            c.querySelectorAll("*:not(p)").forEach(e => e.remove());
        }
    }

    renderBoard() {
        this.clearBoard();
        let cells = this.boardElement.childNodes;
        // render pieces
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                let pos2 = new Vector(x, y);
                let cell2 = cells[y * this.board.width + x + 1];
                let piece2 = this.board.at(pos2);
                if (piece2 != null) {
                    let pieceElement2 = document.createElement("img");
                    pieceElement2.src = imageForPiece(piece2);
                    pieceElement2.className = "piece";
                    cell2.appendChild(pieceElement2);
                }
                // render last move
                if (this.lastMove != null) {
                    if (this.lastMove.from.equals(pos2) || this.lastMove.to.equals(pos2)) {
                        let lastMoveElement = document.createElement("div");
                        lastMoveElement.id = "lastMove";
                        cell2.appendChild(lastMoveElement);
                    }
                }
            }
        }
        if (this.selectedCellElement == null) {
            return;
        }
        let selectedCellPosStr = this.selectedCellElement.innerText;
        if (this.board.at(selectedCellPosStr) != null && this.board.at(selectedCellPosStr).color == this.board.turnPlayer) {
            // render selected piece
            let selectedSymbol = document.createElement("div");
            selectedSymbol.id = "selected";
            this.selectedCellElement.parentNode.appendChild(selectedSymbol);
            // render possible moves
            this.possibleMoves = this.board.validateMoves(this.board.possibleMovesForPiece(stringToPosition(selectedCellPosStr)), this.board.turnPlayer);
            for (let move of this.possibleMoves) {
                let cell = document.querySelectorAll("p");
                let captureSymbol = document.createElement("div");
                captureSymbol.id = "possibleCapture";
                let moveSymbol = document.createElement("div");
                moveSymbol.id = "possibleMove";
                for (let c of cell) {
                    if (positionToString(move.to) == c.innerText) {
                        if (move.isCapture()) {
                            c.parentNode.appendChild(captureSymbol);
                        }
                        else {
                            c.parentNode.appendChild(moveSymbol);
                        }
                    }
                }
            }
        }
        else {
            this.selectedCellElement = null;
        }
    }

    resetBoard() {
        this.clearBoard();
        this.selectedCellElement = null;
        this.board = new ChessBoard();
        this.lastMove = null;
        this.possibleMoves = [];
        this.renderBoard();
    }

    cellOnClick(cell) {
        const start = Date.now();
        let posStr = cell.querySelector("p");
        if (this.selectedCellElement != null) {
            this.selectedCellElement.id = "";
        }
        else {
            this.possibleMoves = [];
        }
        for (let move of this.possibleMoves) {
            if (move.to.equals(stringToPosition(posStr.innerText))) {
                this.lastMove = new Move(move.from, move.to, move.capturedPiece);
                this.board.move(move);
                this.playSound(move);
                this.possibleMoves = [];
                break;
            }
        }
        this.selectedCellElement = cell.querySelector("p");
        this.renderBoard();
        const end = Date.now();
        console.log("render took " + (end - start) + "ms");
    }

    playSound(move) {
        // TODO: remove this
        if (this.board.isInDeepMate(this.board.turnPlayer)) {
            this.audio["gameEnd"].play();
            console.log("game ended");
            this.renderBoard();
            sleep(20).then(() => window.alert("Checkmate!"));
        }
        if (this.board.isInCheck(this.board.turnPlayer)) {
            this.audio["check"].play();
        }
        else if (move instanceof MultiMove) {
            this.audio["castle"].play();
        }
        else if (move.isCapture()) {
            this.audio["capture"].play();
        }
        else {
            this.audio[this.board.turnPlayer + "Move"].play();
        }
    }

    start() {
        window.addEventListener("resize", this.renderBoard.bind(this));
        this.createBoard();
    }

    createBoard() {
        let start = Date.now();
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                let pos = new Vector(x, y);
                let cell = document.createElement("div");
                let text = document.createElement("p");
                text.innerText = positionToString(pos);
                cell.appendChild(text);
                cell.addEventListener("mousedown", function() {
                    this.cellOnClick(cell);
                }.bind(this));
                cell.className = "cell ";
                if ((x + y) % 2 == 0) {
                    cell.className += "white";
                } else {
                    cell.className += "black";
                }
                this.boardElement.appendChild(cell);
            }
        }
        let end = Date.now();
        console.log("board creation took " + (end - start) + "ms");
        this.renderBoard();
    }

    selectPiece(e) {
        if (this.selectedPieceToPlace != null) {
            this.selectedPieceToPlace.target.className = this.selectedPieceToPlace.target.className.replace(" selected", "");
        }
        this.selectedPieceToPlace = e;
        e.target.className += " selected";
    }
}

class CheditorBox {
    constructor() {
        this.pieceSelectors = document.getElementsByClassName("piece-selector");
        for (let selector of this.pieceSelectors) {
            if (selector.className.includes("color-change")) {
                selector.addEventListener("mousedown", this.toggleColor.bind(this));
                continue;
            }
            selector.addEventListener("mousedown", this.selectPiece.bind(this));
        }
        this.lastSelected = null;
        this.isRightSideOpen = true;
        this.colorOfPieces = "white";
    }

    toggleColor() {
        let oldColor = this.colorOfPieces;
        if (this.colorOfPieces == "white") {
            this.colorOfPieces = "black";
        }
        else {
            this.colorOfPieces = "white";
        }
        console.log("changed color to", this.colorOfPieces);
        for (let selector of this.pieceSelectors) {
            if (selector.className.includes("color-change")) {
                continue;
            }
            selector.className = selector.className.replace(" " + oldColor, "") + " " + this.colorOfPieces;
        }
    }

    unselectPiece() {
        if (this.lastSelected != null) {
            this.lastSelected.target.className = this.lastSelected.target.className.replace(" selected", "");
            this.lastSelected = null;
        }
    }
    selectPiece(e) {
        let oldLastSelected = this.lastSelected;
        this.unselectPiece();
        if (oldLastSelected != null && oldLastSelected.target == e.target) {
            return;
        }
        this.lastSelected = e;
        e.target.className += " selected";
    }

    closeRightSide() {
        if (!this.isRightSideOpen) {
            return;
        }
        for (let selector of this.pieceSelectors) {
            selector.className = selector.className.replace(" selected", "");
        }
        this.isRightSideOpen = false;
        this.rightSide = document.getElementById("right-side");
        console.log(this.rightSide)
        this.rightSide.remove();
        this.lastSelected = null;
        console.log("closed right side");
    }
    openRightSide() {
        if (this.isRightSideOpen) {
            return;
        }
        this.isRightSideOpen = true;
        document.getElementById("container").appendChild(this.rightSide);
    }

    place(game, position) {
        if (this.lastSelected == null) {
            return;
        }
        let nameOfPiece = this.lastSelected.target.className.split(" ")[1];
        console.log("placing", nameOfPiece, "at", position);
        if (nameOfPiece == "remove-piece") {
            game.board.remove(stringToPosition(position));
            game.renderBoard();
            return;
        }
        let piece = pieces[nameOfPiece.toUpperCase()].init(this.colorOfPieces);
        game.board.place(piece, stringToPosition(position));
        game.renderBoard();
    }
}

window.onload = function () {
    let game = new ChessGame(document.getElementById("board"));
    game.start();
    let cheditorBox = new CheditorBox();
    document.getElementById("close-right-side").addEventListener("mousedown", function () {
        cheditorBox.closeRightSide();
    }.bind(this));
    document.getElementById("new-game").addEventListener("mousedown", function () {
        game.resetBoard();
    }.bind(this));
    document.body.addEventListener("click", function (e) {
        if (e.target != document.body &&
            e.target.className != "piece-selector-row" &&
            e.target.id != "cheditor-box" &&
            e.target.id != "container" &&
            e.target.id != "right-side" &&
            e.target.id != "left-side" &&
            e.target.id != "close-right-side") {
            return;
        }
        cheditorBox.unselectPiece();
        cheditorBox.openRightSide();
        console.log("open right side");
    }.bind(this));
    let cells = document.querySelectorAll(".cell");
    for (let cell of cells) {
        cell.addEventListener("mousedown", function (e) {
            cheditorBox.place(game, cell.querySelector("p").innerText);
        }.bind(this));
    }
}
