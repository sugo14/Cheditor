'use strict';

import { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, BLOCK } from './chessPiece.mjs';
import { Vector, Move, positionToString, stringToPosition } from './vector.mjs';

export class ChessBoard {
    constructor() {
        this.height = 8;
        this.width = 8;
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
    forceMove(move) {
        let piece = this.at(move.from);
        this.place(piece, move.to);
        delete this.board[positionToString(move.from)];
    }

    possibleMovesForPiece(position) {
        let piece = this.at(position);
        if (piece == null) {
            return [];
        }
        return piece.listOfMoves(this, position);
        // REMOVE THIS RIGHT NOW
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
                allPossibleMoves = allPossibleMoves.concat(piece.listOfMoves(this, position));
            }
        }
        return allPossibleMoves;
    }
    
    tryMove(move, turnPlayer) {
        let piece = this.at(move.from);
        if (piece == null) {
            // console.log("Invalid move: no piece at start position");
            return false;
        }
        if (piece.color == turnPlayer) {
            let possibleMoves = piece.listOfMoves(this, move.from);
            if (possibleMoves.some(aMove => aMove.equals(move))) {
                // success
                this.forceMove(move);
                return true;
            }
        }
        else {
            // console.log("Invalid move: piece of incorrect color");
            return false;
        }
        // console.log("Invalid move: piece does not have the given final move");
        return false;
    }

    toString() {
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

    validateMoves(moves, turnPlayer) {
        let newMoves = [];
        let kingPos;
        for (let key of Object.keys(this.board)) {
            let piece = this.board[key];
            if (piece.color == turnPlayer) {
                if (piece.isOfType(KING)) {
                    kingPos = key;
                    break;
                }
            }
        }
        for (let move of moves) {
            this.forceMove(move);
            let possibleMoves = this.possibleMoves((turnPlayer == "white") ? "black" : "white");
            let isKingSafe = true;
            for (let possibleMove of possibleMoves) {
                if (possibleMove.to.equals(kingPos)) {
                    isKingSafe = false;
                }
            }
            if (isKingSafe) {
                newMoves.push(move);
            }
        }
        return newMoves;
    }
}
