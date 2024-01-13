// Console Chess
import PromptSync from 'prompt-sync';
const prompt = PromptSync({ sigint: true });

let board = new ChessBoard();
console.log(board.toString());
while (true) {
    let moveString = prompt("Enter move: ");
    if (moveString == "quit") {
        break;
    }
    if (board.tryMove(board.moveFromString(moveString, "white"), "white")) {
        let possibleMoves = board.possibleMoves("black");
        board.tryMove(possibleMoves[Math.floor(Math.random() * possibleMoves.length)], "black");
        console.log("\n\n" + board.toString());
    }
    else {
        console.log("Invalid move");
    }
}