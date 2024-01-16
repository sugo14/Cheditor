'use strict';

import { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, BLOCK } from './chessPiece.mjs';
import { Vector, Move, positionToString, stringToPosition } from './vector.mjs';

export class ChessBoard {
    constructor() {
        this.height = 8;
        this.width = 8;
        this.turnPlayer = "white";
        this.board = {};

        for (let x = 0; x < this.width; x++) {
            this.place(PAWN.init("black"), new Vector(x, 1));
            this.place(PAWN.init("white"), new Vector(x, 6));
        }
        for (let i = 0; i < 2; i++) {
            let color = (i == 0) ? "black" : "white";
            let row = (color == "black") ? 0 : 7;
            this.place(ROOK.init(color), new Vector(0, row));
            this.place(KNIGHT.init(color), new Vector(1, row));
            this.place(BISHOP.init(color), new Vector(2, row));
            this.place(QUEEN.init(color), new Vector(3, row));
            this.place(KING.init(color), new Vector(4, row));
            this.place(BISHOP.init(color), new Vector(5, row));
            this.place(KNIGHT.init(color), new Vector(6, row));
            this.place(ROOK.init(color), new Vector(7, row));
        }
    }

    positionValid(position) {
        if (position.x >= 0 && position.x < this.width && position.y >= 0 && position.y < this.height) {
            return true;
        }
        return false;
    }
    positionEmpty(position) {
        if (this.at(position) == null) {
            return true;
        }
        return false;
    }

    at(position) {
        let strPos;
        if (position instanceof Vector) {
            strPos = positionToString(position);
        }
        else if (typeof position == "string") {
            strPos = position;
            position = stringToPosition(position);
        }
        else {
            throw new Error("Position must be a Vector or a String, not " + typeof position + ":\n" + position);
        }
        if (position.x < 0 || position.x >= this.width || position.y < 0 || position.y >= this.height || !(strPos in this.board)) {
            return null;
        }
        return this.board[strPos];
    }
    place(piece, position) {
        if (!(position.x < 0 || position.x >= this.width || position.y < 0 || position.y >= this.height)) {
            this.board[positionToString(position)] = piece;
        }
    }

    possibleMoves(color) {
        let allPossibleMoves = [];
        for (const stringPos of Object.keys(this.board)) {
            const position = stringToPosition(stringPos);
            const piece = this.board[stringPos];
            if (piece == null) {
                continue;
            }
            if (piece.color == color) {
                allPossibleMoves = allPossibleMoves.concat(this.possibleMovesForPiece(position));
            }
        }
        return allPossibleMoves;
    }
    possibleMovesForPiece(position) {
        let piece = this.at(position);
        if (piece == null) {
            return [];
        }
        let moves = piece.listOfMoves(this, position);
        return moves;
    }
    
    #move(move) {
        let piece = this.at(move.from);
        this.place(piece, move.to);
        delete this.board[positionToString(move.from)];
    }
    move(move) {
        let piece = this.at(move.from);
        if (piece == null) {
            console.log("Invalid move: no piece at start position");
            return false;
        }
        if (piece.color == this.turnPlayer) {
            let possibleMoves = piece.listOfMoves(this, move.from);
            if (possibleMoves.some(aMove => aMove.equals(move))) {
                // success
                this.#move(move);
                this.turnPlayer = (this.turnPlayer == "white") ? "black" : "white";
                return true;
            }
        }
        else {
            console.log("Invalid move: piece of incorrect color");
            return false;
        }
        console.log("Invalid move: piece does not have the given final move");
        return false;
    }

    isInCheck(color) {
        let kingPos = null;
        for (let key of Object.keys(this.board)) {
            let piece = this.board[key];
            if (piece.color == color) {
                if (piece.isOfType(KING)) {
                    kingPos = stringToPosition(key);
                    break;
                }
            }
        }
        if (kingPos == null) {
            throw new Error("No " + color + " king found");
        }
        let possibleMovesForOtherColor = this.possibleMoves((color == "white") ? "black" : "white");
        for (let possibleMove of possibleMovesForOtherColor) {
            if (possibleMove.to.equals(kingPos)) {
                return true;
            }
        }
        return false;
    }
    isInMate(color) {
        let possibleMoves = this.possibleMoves(color);
        return (possibleMoves.length == 0);
    }
    isInCheckmate(color) {
        return (this.isInCheck(color) && this.isInMate(color));
    }
    isInStalemate(color) {
        return (!this.isInCheck(color) && this.isInMate(color));
    }
    validateMoves(moves, turnPlayer) {
        let newMoves = [];
        for (let move of moves) {
            // make move
            let pieceCaptured = null;
            if (move.isCapture) {
                pieceCaptured = this.at(move.to);
            }
            this.#move(move);
            // check if king would be put in check as a result
            if (!this.isInCheck(turnPlayer)) {
                newMoves.push(move);
            }
            // undo move
            this.#move(new Move(move.to, move.from));
            if (pieceCaptured != null) {
                this.place(pieceCaptured, move.to);
            }
        }
        return newMoves;
    }

    // for Console only

    toASCII() {
        let str = '';
        for (let y = 0; y < this.height; y++) {
            let line = (8 - y).toString() + '   ';
            for (let x = 0; x < this.width; x++) {
                let pos = new Vector(x, y);
                let piece = this.at(pos);
                if (piece != null) { line += piece.toString(); }
                else { line += '.'; }
                line += ' ';
            }
            str += line + '\n';
        }
        str += '\n    ';
        for (let x = 0; x < this.width; x++) {
            str += String.fromCharCode(x + 97) + ' ';
        }
        return str + '\n';
    }
    moveFromString(moveString, color) {
        let pieceAppearance, finalPos;
        if (moveString.length == 2) {
            pieceAppearance = "p";
            finalPos = stringToPosition(moveString);
        }
        else {
            pieceAppearance = moveString[0].toLowerCase();
            finalPos = stringToPosition(moveString.slice(1));
        }
        for (let strPos of Object.keys(this.board)) {
            let position = stringToPosition(strPos);
            let piece = this.board[strPos];
            if (piece == null) {
                continue;
            }
            if ((piece.toString().toLowerCase() == pieceAppearance && piece.color == color)) {
                let possibleMoves = piece.listOfMoves(this, position);
                if (possibleMoves.some(move => move.equals(new Move(position, finalPos)))) {
                    return new Move(position, finalPos);
                }
            }
        }
        throw new Error("No piece with appearance " + pieceAppearance + " found with possible move " + positionToString(finalPos));
    }
}
