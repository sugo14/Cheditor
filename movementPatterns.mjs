'use strict';

import { Vector, Move, positionToString } from './vector.mjs';

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
        let move = new Vector(position.x + this.movementVector.x, position.y + this.movementVector.y);
        if (board.positionValid(move) && board.positionEmpty(move)) {
            return [new Move(position, move)];
        }
        return [];
    }
}

export class Capture extends Movement {
    setPiece(piece) {
        this.color = piece.color;
    }
    listOfMoves(board, position) {
        let move = new Vector(position.x + this.movementVector.x, position.y + this.movementVector.y);
        if (board.positionValid(move) && !board.positionEmpty(move)) {
            if (board.at(move).color != this.color) {
                return [new Move(position, move, true)];
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

// Movement pattern wrappers

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
                    if (newMove.isCapture) {
                        return false;
                        // stop a line after a capture, because pieces can't x-ray through other ones
                    }
                    return true;
                });
                lastMoves = newMoves;
            }
        }
        return moves.map(move => new Move(position, move.to, move.isCapture));
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
