/// <reference path="game-player.ts" />
/// <reference path="game-board.ts" />

import GamePlayer = require("game-player");
import GameGameboard = require("game-board");

export class Challenge
{
    guid: string;
    status: string;
    
    challenger: GamePlayer.Player ;
    challenged: GamePlayer.Player ;
    
    nextTurn: GamePlayer.Player ; 
    
    winner: GamePlayer.Player ;
    
    gameboard: GameGameboard.Gameboard ;
    
    constructor() {
        this.guid = null;
        this.status = "created" ;
        this.challenger = new GamePlayer.Player("","");
        this.challenged = new GamePlayer.Player("","");
        this.nextTurn = new GamePlayer.Player("", "");
        this.winner = null ;
        this.gameboard = new GameGameboard.Gameboard() ;
    }
    
    update(data) {
        this.guid = data.guid;
        this.status = data.status ;
        
        this.challenger.update(data.challenger) ;
        this.challenged.update(data.challenged) ;

        this.nextTurn.update(data.nextTurn) ;
        
        if (data.winner !== null) {
            if (this.winner == null) {
                this.winner = new GamePlayer.Player("","");
            }
            this.winner.update(data.winner) ;
        }
        
        this.gameboard.update(data.gameboard) ;
    }
}   