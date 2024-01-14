import { Movement, Capture, MovementCapture, Forward, Repeated, NTimeOnly } from "./movementPatterns.mjs";
import { Move, Vector } from "./vector.mjs";
/* import _ from "lodash"; */ // Console Chess

export class ChessPieceType {
    constructor(appearances, movements) {
        this.appearances = appearances;
        this.movements = movements;
    }
    init(color) {
        let copiedMovements = [];
        for (let movement of this.movements) {
            copiedMovements.push(_.cloneDeep(movement)); // javascript is going to make me kill myself
        }
        let appearance = this.appearances[color == "white" ? 1 : 0];
        return new ChessPiece(appearance, copiedMovements, color);
    }
}

export class ChessPiece {
    constructor(appearance, movements, color) {
        this.appearance = appearance;
        this.movements = movements;
        this.color = color;
        for (let pattern of this.movements) {
            pattern.setPiece(this);
        }
    }
    toString() {
        return this.appearance;
    }
    listOfMoves(board, position) {
        let moves = [];
        for (let movement of this.movements) {
            moves = moves.concat(movement.listOfMoves(board, position));
        }
        return moves;
    }
    isOfType(chessPieceType) {
        return (this.appearance == chessPieceType.appearances[(this.color == "white") ? 1 : 0]);
    }
}

export const PAWN = new ChessPieceType(
    ["p", "P"],
    [
        new NTimeOnly(1, new Forward(new Movement(new Vector(0, 2)))),
        new Forward(new Movement(new Vector(0, 1))),
        new Forward(new Capture(new Vector(1, 1))),
        new Forward(new Capture(new Vector(-1, 1))),
    ]
)
export const KNIGHT = new ChessPieceType(
    ["n", "N"],
    [
        new MovementCapture(new Vector(1, 2)), 
        new MovementCapture(new Vector(-1, 2)),
        new MovementCapture(new Vector(1, -2)),
        new MovementCapture(new Vector(-1, -2)),
        new MovementCapture(new Vector(2, 1)), 
        new MovementCapture(new Vector(-2, 1)),
        new MovementCapture(new Vector(2, -1)),
        new MovementCapture(new Vector(-2, -1)),
    ]
)
export const BISHOP = new ChessPieceType(
    ["b", "B"],
    [
        new Repeated(new MovementCapture(new Vector(1, 1))), 
        new Repeated(new MovementCapture(new Vector(1, -1))),
        new Repeated(new MovementCapture(new Vector(-1, 1))),
        new Repeated(new MovementCapture(new Vector(-1, -1)))
    ]
)
export const ROOK = new ChessPieceType(
    ["r", "R"],
    [
        new Repeated(new MovementCapture(new Vector(0, 1))), 
        new Repeated(new MovementCapture(new Vector(1, 0))),
        new Repeated(new MovementCapture(new Vector(0, -1))),
        new Repeated(new MovementCapture(new Vector(-1, 0)))
    ]
)
export const QUEEN = new ChessPieceType(
    ["q", "Q"],
    [
        new Repeated(new MovementCapture(new Vector(1, -1))),
        new Repeated(new MovementCapture(new Vector(1, 1))), 
        new Repeated(new MovementCapture(new Vector(-1, 1))),
        new Repeated(new MovementCapture(new Vector(-1, -1))),
        new Repeated(new MovementCapture(new Vector(0, 1))), 
        new Repeated(new MovementCapture(new Vector(1, 0))),
        new Repeated(new MovementCapture(new Vector(0, -1))),
        new Repeated(new MovementCapture(new Vector(-1, 0)))
    ]
)
export const KING = new ChessPieceType(
    ["k", "K"],
    [
        new MovementCapture(new Vector(1, 1)), 
        new MovementCapture(new Vector(1, -1)),
        new MovementCapture(new Vector(-1, 1)),
        new MovementCapture(new Vector(-1, -1)),
        new MovementCapture(new Vector(0, 1)), 
        new MovementCapture(new Vector(1, 0)),
        new MovementCapture(new Vector(0, -1)),
        new MovementCapture(new Vector(-1, 0))
    ]
)
export const BLOCK = new ChessPieceType(
    ["o", "O"],
    []
)
