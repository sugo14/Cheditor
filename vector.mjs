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
    constructor(from, to, isCapture) {
        this.from = from;
        this.to = to;
        if (isCapture == undefined) {
            this.isCapture = false;
        }
        else {
            this.isCapture = isCapture;
        }
    }

    equals(other) {
        if (!(other instanceof Move)) {
            throw new Error('other must be a Move, not a(n) ' + typeof other + ":\n" + other);
        }
        return this.from.equals(other.from) && this.to.equals(other.to);
    }

    toString() {
        return positionToString(this.from) + ' -> ' + positionToString(this.to) + (this.isCapture ? ' (capture)' : '');
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
