define(["require", "exports"], function (require, exports) {
    var Player = (function () {
        function Player(_guid, _name) {
            this.guid = _guid;
            this.name = _name;
        }
        Player.prototype.acceptChallenge = function () {
        };
        Player.prototype.update = function (json) {
            this.name = json.name;
            this.guid = json.guid;
        };
        return Player;
    })();
    exports.Player = Player;
});
//# sourceMappingURL=game-player.js.map