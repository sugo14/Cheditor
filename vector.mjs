'use strict';

export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(other) {
        if (!(other instanceof Vector)) {
            throw new Error('other must be a Vector, not a(n) ' + typeof other + ":\n" + other);
        }
        return (this.x == other.x) && (this.y == other.y);
    }
    toString() {
        return '(' + this.x + ', ' + this.y + ')';
    }
}

export class Move {
    constructor(from, to, capturedPiece) {
        this.from = from;
        this.to = to;
        this.capturedPiece = capturedPiece;
    }

    isCapture() {
        return (this.capturedPiece != undefined);
    }

    equals(other) {
        if (!(other instanceof Move)) {
            throw new Error('other must be a Move, not a(n) ' + typeof other + ":\n" + other);
        }
        return this.from.equals(other.from) && this.to.equals(other.to);
    }

    do(board) {
        let piece = board.at(this.from);
        board.place(piece, this.to);
        delete board.board[positionToString(this.from)];
    }

    undo(board) {
        let piece = board.at(this.to);
        board.place(piece, this.from);
        if (this.isCapture()) {
            board.place(this.capturedPiece, this.to);
        }
        else {
            delete board.board[positionToString(this.to)];
        }
    }

    toString() {
        return positionToString(this.from) + ' -> ' + positionToString(this.to) + (this.isCapture() ? ' (captured ' + this.capturedPiece.toString() + ')' : '');
    }
}

export class ComplexCapture extends Move {
    constructor(from, to, capturedPiece, capturedPiecePos) {
        super(from, to, capturedPiece);
        this.capturedPiecePos = capturedPiecePos;
    }

    do(board) {
        let piece = board.at(this.from);
        board.place(piece, this.to);
        delete board.board[positionToString(this.from)];
        delete board.board[positionToString(this.capturedPiecePos)];
    }

    undo(board) {
        let piece = board.at(this.to);
        board.place(piece, this.from);
        board.place(this.capturedPiece, this.capturedPiecePos);
    }
}

export class MultiMove extends Move {
    constructor(listOfMoves) {
        super(listOfMoves[0].from, listOfMoves[0].to, listOfMoves[0].capturedPiece);
        this.listOfMoves = listOfMoves;
    }

    do(board) {
        for (let move of this.listOfMoves) {
            move.do(board);
        }
    }
    undo(board) {
        for (let i = 0; i < this.listOfMoves.length; i++) {
            this.listOfMoves[this.listOfMoves.length - 1 - i].undo(board);
        }
    }
}

export function stringToPosition(posStr) {
    let x = posStr.charCodeAt(0) - 97;
    let y = 8 - parseInt(posStr.slice(1));
    return new Vector(x, y);
}

export function positionToString(posVec) {
    let file = String.fromCharCode(97 + posVec.x)
    let row = (8 - posVec.y).toString();
    return file + row;
}
