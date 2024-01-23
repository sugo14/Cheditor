'use strict';

import { Vector, Move, ComplexCapture, MultiMove } from './vector.mjs';

class MovementPattern {
    constructor(movementVector) {
        this.movementVector = movementVector;
    }
    setPiece(piece) { }
    listOfMoves(board, position) { }
    getMovementVector() {
        return this.movementVector;
    }
    setMovementVector(movementVector) {
        this.movementVector = movementVector;
    }
}

export class Movement extends MovementPattern {
    constructor(movementVector) {
        super(movementVector);
    }
    listOfMoves(board, position) {
        let endPos = new Vector(position.x + this.movementVector.x, position.y + this.movementVector.y);
        if (board.positionValid(endPos) && board.positionEmpty(endPos)) {
            return [new Move(position, endPos)];
        }
        return [];
    }
}

export class Capture extends Movement {
    setPiece(piece) {
        this.color = piece.color;
    }
    listOfMoves(board, position) {
        let endPos = new Vector(position.x + this.movementVector.x, position.y + this.movementVector.y);
        if (board.positionValid(endPos) && !board.positionEmpty(endPos)) {
            let piece = board.at(endPos);
            if (piece.color != this.color) {
                return [new Move(position, endPos, piece)];
            }
        }
        return [];
    }
}

export class MovementCapture extends MovementPattern {
    constructor(movementVector) {
        super(movementVector);
        this.movement = new Movement(movementVector);
        this.capture = new Capture(movementVector);
    }
    setMovementVector(movementVector) {
        super.setMovementVector(movementVector);
        this.movement.setMovementVector(movementVector);
        this.capture.setMovementVector(movementVector);
    }
    setPiece(piece) {
        this.movement.setPiece(piece);
        this.capture.setPiece(piece);
    }
    listOfMoves(board, position) {
        let movement = this.movement.listOfMoves(board, position);
        let capture = this.capture.listOfMoves(board, position);
        if (movement.length > 0) {
            return movement;
        }
        else if (capture.length > 0) {
            return capture;
        }
        else {
            return [];
        }
    }
}

/* Movement pattern wrappers */

class MovementPatternWrapper extends MovementPattern {
    constructor(movementPattern) {
        super(movementPattern.getMovementVector());
        this.movementPattern = movementPattern;
    }
    setMovementVector(movementVector) {
        super.setMovementVector(movementVector);
        this.movementPattern.setMovementVector(movementVector);
    }
    setPiece(piece) {
        super.setPiece(piece);
        this.movementPattern.setPiece(piece);
    }
}

export class Forward extends MovementPatternWrapper {
    constructor(movementPattern) {
        super(movementPattern);
    }
    setPiece(piece) {
        super.setPiece(piece);
        if (piece.color == "white") {
            let oldMovementVector = this.movementPattern.movementVector;
            this.setMovementVector(new Vector(oldMovementVector.x, -oldMovementVector.y));
            this.movementPattern.setMovementVector(this.movementVector);
        }
    }
    listOfMoves(board, position) {
        return this.movementPattern.listOfMoves(board, position);
    }
}

export class Repeated extends MovementPatternWrapper {
    constructor(movementPattern, repeatTimes) {
        super(movementPattern);
        if (repeatTimes === undefined) {
            this.repeatTimes = Infinity;
        }
        else {
            this.repeatTimes = repeatTimes;
        }
    }
    listOfMoves(board, position) {
        let moves = [];
        let lastMoves = [new Move(position, position)];
loops:
        for (let i = 0; i < this.repeatTimes; i++) {
            if (lastMoves.length === 0) {
                break loops;
            }
            for (let lastMove of lastMoves) {
                let newMoves = this.movementPattern.listOfMoves(board, lastMove.to);
                if (newMoves.length === 0) {
                    break loops;
                    // no more moves are possible, so break regardless of repeatTimes left (makes Infinity work)
                } 
                moves = moves.concat(newMoves);
                newMoves = newMoves.filter(newMove => {
                    if (newMove.isCapture()) {
                        return false;
                        // stop a line after a capture, because pieces can't x-ray through other ones
                    }
                    return true;
                });
                lastMoves = newMoves;
            }
        }
        return moves.map(move => new Move(position, move.to, move.capturedPiece));
        // moves will have the wrong start position because of how repetition works, so must return move with accurate start position for piece
    }
}

export class NTimeOnly extends MovementPatternWrapper {
    constructor(n, movementPattern) {
        super(movementPattern);
        this.n = n;
        this.lastPositions = [];
    }
    setPiece(piece) {
        super.setPiece(piece);
        this.piece = piece;
    }
    listOfMoves(board, position) {
        if ((this.lastPositions.length == 0) ||
            !(this.lastPositions[this.lastPositions.length - 1].equals(position))) {
            this.lastPositions.push(position);
        }
        if (this.lastPositions.length <= this.n) {
            return this.movementPattern.listOfMoves(board, position);
        }
        return [];
    }
}

/* Special movement patterns */

export class KingSideCastle extends MovementPattern {
    constructor() {
        super();
    }
    setPiece(piece) {
        this.color = piece.color;
    }
    listOfMoves(board, position) {
        if (!board.castleRights[this.color].kingSide) {
            return [];
        }
        let endPos = new Vector(position.x + 2, position.y);
        let position2 = new Vector(position.x + 3, position.y);
        let endPos2 = new Vector(position.x + 1, position.y);
        if (board.positionEmpty(endPos) && board.positionEmpty(endPos2)) {
            return [new MultiMove([
                new Move(position, endPos),
                new Move(position2, endPos2)])];
        }
        return [];
    }
}

export class QueenSideCastle extends MovementPattern {
    constructor() {
        super();
    }
    setPiece(piece) {
        this.color = piece.color;
    }
    listOfMoves(board, position) {
        if (!board.castleRights[this.color].queenSide) {
            return [];
        }
        let endPos = new Vector(position.x - 2, position.y);
        let position2 = new Vector(position.x - 4, position.y);
        let endPos2 = new Vector(position.x - 1, position.y);
        let inBetween = new Vector(position.x - 3, position.y);
        if (board.positionEmpty(endPos) && board.positionEmpty(endPos2) && board.positionEmpty(inBetween)) {
            return [new MultiMove([
                new Move(position, endPos),
                new Move(position2, endPos2)]
            )];
        }
        return [];
    }
}

export class EnPassant extends MovementPattern {
    constructor() {
        super();
    }
    setPiece(piece) {
        this.color = piece.color;
    }
    listOfMoves(board, position) {
        let capture1 = new Vector(position.x + 1, position.y);
        let capture2 = new Vector(position.x - 1, position.y);
        let to1 = new Vector(position.x + 1, position.y + (this.color == 'white' ? -1 : 1));
        let to2 = new Vector(position.x - 1, position.y + (this.color == 'white' ? -1 : 1));
        if (board.enPassantSquares.some(square => square.equals(to1))) {
            let pieceCaptured = board.at(capture1);
            if (pieceCaptured != null && pieceCaptured.color != this.color) {
                return [new ComplexCapture(position, to1, pieceCaptured, capture1)];
            }
        }
        if (board.enPassantSquares.some(square => square.equals(to2))) {
            let pieceCaptured = board.at(capture2);
            if (pieceCaptured != null && pieceCaptured.color != this.color) {
                return [new ComplexCapture(position, to2, pieceCaptured, capture2)];
            }
        }
        return [];
    }
}
