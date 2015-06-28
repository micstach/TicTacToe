/// <reference path="game-player.ts" />
/// <reference path="game-board.ts" />
define(["require", "exports", "game-player", "game-board"], function (require, exports, GamePlayer, GameGameboard) {
    var Challenge = (function () {
        function Challenge() {
            this.guid = null;
            this.status = "created";
            this.challenger = new GamePlayer.Player("", "");
            this.challenged = new GamePlayer.Player("", "");
            this.nextTurn = new GamePlayer.Player("", "");
            this.winner = null;
            this.gameboard = new GameGameboard.Gameboard();
        }
        Challenge.prototype.update = function (data) {
            this.guid = data.guid;
            this.status = data.status;
            this.challenger.update(data.challenger);
            this.challenged.update(data.challenged);
            this.nextTurn.update(data.nextTurn);
            if (data.winner !== null) {
                if (this.winner == null) {
                    this.winner = new GamePlayer.Player("", "");
                }
                this.winner.update(data.winner);
            }
            this.gameboard.update(data.gameboard);
        };
        return Challenge;
    })();
    exports.Challenge = Challenge;
});
//# sourceMappingURL=game-challenge.js.map