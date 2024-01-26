import { Movement, Capture, MovementCapture, Forward, RequiredValidMoves, Repeated, NTimeOnly, KingSideCastle, QueenSideCastle, EnPassant } from "./movementPatterns.mjs";
import { Move, Vector } from "./vector.mjs";

export class ChessPieceType {
    constructor(appearances, movements) {
        this.appearances = appearances;
        this.movements = movements;
    }
    init(color) {
        let copiedMovements = [];
        for (let movement of this.movements) {
            copiedMovements.push(_.cloneDeep(movement));
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

export let pieces = {
    PAWN: new ChessPieceType(
        ["p", "P"],
        [
            new RequiredValidMoves(
                [new Forward(new Movement(new Vector(0, 1)))],
                new NTimeOnly(1, new Forward(new Movement(new Vector(0, 2))))
            ),
            new Forward(new Movement(new Vector(0, 1))),
            new Forward(new Capture(new Vector(1, 1))),
            new Forward(new Capture(new Vector(-1, 1))),
            new EnPassant(),
        ]
    ),
    KNIGHT: new ChessPieceType(
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
    ),
    BISHOP: new ChessPieceType(
        ["b", "B"],
        [
            new Repeated(new MovementCapture(new Vector(1, 1))), 
            new Repeated(new MovementCapture(new Vector(1, -1))),
            new Repeated(new MovementCapture(new Vector(-1, 1))),
            new Repeated(new MovementCapture(new Vector(-1, -1))),
        ]
    ),
    ROOK: new ChessPieceType(
        ["r", "R"],
        [
            new Repeated(new MovementCapture(new Vector(0, 1))), 
            new Repeated(new MovementCapture(new Vector(1, 0))),
            new Repeated(new MovementCapture(new Vector(0, -1))),
            new Repeated(new MovementCapture(new Vector(-1, 0))),
        ]
    ),
    QUEEN: new ChessPieceType(
        ["q", "Q"],
        [
            new Repeated(new MovementCapture(new Vector(1, -1))),
            new Repeated(new MovementCapture(new Vector(1, 1))), 
            new Repeated(new MovementCapture(new Vector(-1, 1))),
            new Repeated(new MovementCapture(new Vector(-1, -1))),
            new Repeated(new MovementCapture(new Vector(0, 1))), 
            new Repeated(new MovementCapture(new Vector(1, 0))),
            new Repeated(new MovementCapture(new Vector(0, -1))),
            new Repeated(new MovementCapture(new Vector(-1, 0))),
        ]
    ),
    KING: new ChessPieceType(
        ["k", "K"],
        [
            new MovementCapture(new Vector(1, 1)), 
            new MovementCapture(new Vector(1, -1)),
            new MovementCapture(new Vector(-1, 1)),
            new MovementCapture(new Vector(-1, -1)),
            new MovementCapture(new Vector(0, 1)), 
            new MovementCapture(new Vector(1, 0)),
            new MovementCapture(new Vector(0, -1)),
            new MovementCapture(new Vector(-1, 0)),
            new KingSideCastle(),
            new QueenSideCastle(),
        ]
    ),
    ARCHBISHOP: new ChessPieceType(
        ["a", "A"],
        [
            new Repeated(new MovementCapture(new Vector(1, 1))), 
            new Repeated(new MovementCapture(new Vector(1, -1))),
            new Repeated(new MovementCapture(new Vector(-1, 1))),
            new Repeated(new MovementCapture(new Vector(-1, -1))),
            new MovementCapture(new Vector(1, 2)), 
            new MovementCapture(new Vector(-1, 2)),
            new MovementCapture(new Vector(1, -2)),
            new MovementCapture(new Vector(-1, -2)),
            new MovementCapture(new Vector(2, 1)), 
            new MovementCapture(new Vector(-2, 1)),
            new MovementCapture(new Vector(2, -1)),
            new MovementCapture(new Vector(-2, -1)),
        ]
    ),
    CHANCELLOR: new ChessPieceType(
        ["c", "C"],
        [
            new Repeated(new MovementCapture(new Vector(1, 0))), 
            new Repeated(new MovementCapture(new Vector(-1, 0))),
            new Repeated(new MovementCapture(new Vector(0, 1))),
            new Repeated(new MovementCapture(new Vector(0, -1))),
            new MovementCapture(new Vector(1, 2)), 
            new MovementCapture(new Vector(-1, 2)),
            new MovementCapture(new Vector(1, -2)),
            new MovementCapture(new Vector(-1, -2)),
            new MovementCapture(new Vector(2, 1)), 
            new MovementCapture(new Vector(-2, 1)),
            new MovementCapture(new Vector(2, -1)),
            new MovementCapture(new Vector(-2, -1)),
        ]
    ),
    NIGHTRIDER: new ChessPieceType(
        ["i", "I"],
        [
            new Repeated(new MovementCapture(new Vector(1, 2))), 
            new Repeated(new MovementCapture(new Vector(-1, 2))),
            new Repeated(new MovementCapture(new Vector(1, -2))),
            new Repeated(new MovementCapture(new Vector(-1, -2))),
            new Repeated(new MovementCapture(new Vector(2, 1))), 
            new Repeated(new MovementCapture(new Vector(-2, 1))),
            new Repeated(new MovementCapture(new Vector(2, -1))),
            new Repeated(new MovementCapture(new Vector(-2, -1))),
        ]
    ),
    SUPERQUEEN: new ChessPieceType(
        ["s", "S"],
        [
            new Repeated(new MovementCapture(new Vector(1, -1))),
            new Repeated(new MovementCapture(new Vector(1, 1))), 
            new Repeated(new MovementCapture(new Vector(-1, 1))),
            new Repeated(new MovementCapture(new Vector(-1, -1))),
            new Repeated(new MovementCapture(new Vector(0, 1))), 
            new Repeated(new MovementCapture(new Vector(1, 0))),
            new Repeated(new MovementCapture(new Vector(0, -1))),
            new Repeated(new MovementCapture(new Vector(-1, 0))),
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
}
