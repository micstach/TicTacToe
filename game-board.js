define(["require", "exports"], function (require, exports) {
    /// <reference path="libs/typed/jquery/jquery.d.ts" />
    (function (GameboardItem) {
        GameboardItem[GameboardItem["E"] = 0] = "E";
        GameboardItem[GameboardItem["X"] = 1] = "X";
        GameboardItem[GameboardItem["O"] = 2] = "O";
    })(exports.GameboardItem || (exports.GameboardItem = {}));
    var GameboardItem = exports.GameboardItem;
    ;
    var Gameboard = (function () {
        function Gameboard() {
            this.board = [0 /* E */, 0 /* E */, 0 /* E */, 0 /* E */, 0 /* E */, 0 /* E */, 0 /* E */, 0 /* E */, 0 /* E */];
            this.winner = 0 /* E */;
            this.activeItem = 1 /* X */;
        }
        Object.defineProperty(Gameboard.prototype, "HighlightedField", {
            get: function () {
                return this.highlightedField;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Gameboard.prototype, "HightlightedFiled", {
            set: function (value) {
                this.highlightedField = value;
            },
            enumerable: true,
            configurable: true
        });
        Gameboard.prototype.setWinner = function (winner) {
            this.winner = winner;
        };
        Gameboard.prototype.setActiveItem = function (item) {
            this.activeItem = item;
        };
        Gameboard.prototype.getAcitveItem = function () {
            return this.activeItem;
        };
        Gameboard.prototype.switchActiveItem = function () {
            if (this.activeItem == 2 /* O */)
                this.activeItem = 1 /* X */;
            else if (this.activeItem == 1 /* X */)
                this.activeItem = 2 /* O */;
        };
        Gameboard.prototype.setLastUserGuid = function (userGuid) {
            this.lastUserGuid = userGuid;
        };
        Gameboard.prototype.getLastUserGuid = function () {
            return this.lastUserGuid;
        };
        Gameboard.prototype.setBoardItem = function (i, j) {
            this.board[3 * (j - 1) + (i - 1)] = this.activeItem;
            this.winner = this.testWinner();
        };
        Gameboard.prototype.getBoardItem = function (position) {
            var coords = position.split('x');
            var row = parseInt(coords[0]);
            var column = parseInt(coords[1]);
            return this.board[3 * (row - 1) + (column - 1)];
        };
        Gameboard.prototype.setBoard = function (board) {
            for (var i = 0; i < this.board.length; i++) {
                this.board[i] = board[i];
            }
        };
        Gameboard.prototype.clear = function () {
            for (var i = 0; i < this.board.length; i++) {
                this.board[i] = 0 /* E */;
            }
            $('.field').removeClass('highlighted');
        };
        Gameboard.prototype.draw = function () {
            $('.field').removeClass('highlighted-x').removeClass('highlighted-o');
            $('.field').removeClass('O').removeClass('X');
            for (var i = 0; i < this.board.length; i++) {
                var x = ((i) % 3) + 1;
                var y = Math.floor((i) / 3) + 1;
                var id = y + 'x' + x;
                if (this.board[i] == 2 /* O */)
                    $('#' + id).addClass('O');
                else if (this.board[i] == 1 /* X */)
                    $('#' + id).addClass('X');
            }
            this.winner = this.testWinner();
            if (this.winner === 0 /* E */)
                if (this.highlightedField !== null) {
                    if (this.activeItem == 2 /* O */)
                        $('#' + this.highlightedField).addClass('highlighted-o');
                    else if (this.activeItem == 1 /* X */)
                        $('#' + this.highlightedField).addClass('highlighted-x');
                }
        };
        Gameboard.prototype.getWinner = function () {
            return this.winner;
        };
        Gameboard.prototype.testWinner = function () {
            var templates = [
                ['1x1', '2x2', '3x3'],
                ['3x1', '2x2', '1x3'],
                ['1x1', '2x1', '3x1'],
                ['1x2', '2x2', '3x2'],
                ['1x3', '2x3', '3x3'],
                ['1x1', '1x2', '1x3'],
                ['2x1', '2x2', '2x3'],
                ['3x1', '3x2', '3x3']
            ];
            for (var i = 0; i < templates.length; i++) {
                var template = templates[i];
                var counter = 1;
                var first = this.getBoardItem(template[0]);
                for (var j = 1; j < template.length; j++) {
                    if (this.getBoardItem(template[j]) === first)
                        counter++;
                }
                if (first !== 0 /* E */) {
                    if (counter === 3) {
                        $('.field').removeClass('highlighted');
                        for (var j = 0; j < template.length; j++) {
                            $('#' + template[j]).addClass('highlighted');
                        }
                        return first;
                    }
                }
            }
            return 0 /* E */;
        };
        Gameboard.prototype.isFinished = function () {
            if (this.winner != 0 /* E */)
                return true;
            else {
                var empty = 0;
                for (var i = 0; i < this.board.length; i++)
                    empty += (this.board[i] === 0 /* E */) ? 1 : 0;
                return (empty == 0) ? true : false;
            }
        };
        Gameboard.prototype.update = function (data) {
            this.setBoard(data.board);
            this.setLastUserGuid(data.lastUserGuid);
            this.setActiveItem(data.activeItem);
            this.setWinner(data.winner);
            this.highlightedField = data.highlightedField;
        };
        return Gameboard;
    })();
    exports.Gameboard = Gameboard;
});
//var gameboard = new Gameboard() ;
//
//var gameId = null ;
//var userGuid = null ;
//var timeLimit = 5 ;
//var timeOut = null ;
//
//var connection = null ;
//
//$(document).ready(function(){
//
//    // websocket connection
//    connection = new WebSocket('ws://192.168.0.110:8080');
//
//    timeOut = setTimeout(timeCounter, 1000, timeLimit);
//
//    connection.onopen = function(){
//        connection.send(JSON.stringify({'userGuid': userGuid})) ;
//    };
//    
//    (<any>$('#tools')).hide() ;
//    
//    $('#replay').click(function(e){
//        
//        gameboard = new Gameboard() ;
//        gameboard.draw() ;
//                
//        connection.send(JSON.stringify(gameboard));
//        e.preventDefault();
//        
//        (<any>$('#tools')).hide() ;
//        
//    });
//    
//    
//    
//    $('.field').click(function(e){
//        if (gameboard.isFinished()) return ;
//        if (gameboard.getLastUserGuid() === userGuid) return ;
//        if (gameboard.getBoardItem($(this).attr('id')) != GameboardItem.E) return ;
//        
//        gameboard.setLastUserGuid(userGuid) ;
//        
//        var id = $(this).attr('id');
//        var position = id.split('x');
//
//        var row = parseInt(position[0]) ;
//        var column = parseInt(position[1]) ;
//
//        gameboard.setBoardItem(column, row);
//        gameboard.switchActiveItem() ;
//        gameboard.draw();
//
//        connection.send(JSON.stringify(gameboard));
//    });
//    
//    
//    connection.onmessage = function (message) {
//        // try to parse JSON message. Because we know that the server always returns
//        // JSON this should work without any problem but we should make sure that
//        // the massage is not chunked or otherwise damaged.
//        
//        try {
//            var json = JSON.parse(message.data);
//        
//            if (json.playersCount !== undefined)
//            {
//                
//                $('#playersCount').text(json.playersCount);    
//            }
//            else if (json.userGuid !== undefined)
//            {
//                if (userGuid == null)
//                {
//                    userGuid = json.userGuid ;
//                    $('#userGuid').text(userGuid);
//                }
//            }
//            else if (json.ownerGuid !== userGuid)
//            {
//                $('.field').removeClass('highlighted') ;
//
//                gameboard.setBoard(json.board) ;
//                gameboard.setLastUserGuid(json.lastUserGuid);
//                gameboard.setActiveItem(json.activeItem);
//                gameboard.setWinner(json.winner);
//                
//                if (json.winner === GameboardItem.E)
//                    $('#winner').html('');
//                
//                gameboard.draw() ;
//
//                if (json.winner === GameboardItem.E)
//                    if (json.highlightedField !== null)
//                        $('#' + json.highlightedField).addClass('highlighted'); 
//            }
//        
//        } catch (e) {
//            return;
//        }
//    };    
//});
//# sourceMappingURL=game-board.js.map