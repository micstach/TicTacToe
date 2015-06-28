/// <reference path="libs/typed/jquery/jquery.d.ts" />
/// <reference path="libs/typed/bootstrap/bootstrap.d.ts" />
/// <reference path="libs/typed/underscore.d.ts" />
/// <reference path="libs/typed/require.d.ts" />
/// <reference path="game-player.ts" />
/// <reference path="game-challenge.ts" />
/// <reference path="game-board.ts" />
define(["require", "exports", "jquery", "underscore", "bootstrap", "game-player", "game-challenge", "game-board", "text!../templates/users.template", "bootstrap"], function (require, exports, $, _, bootstrap, GamePlayer, GameChallenge, GameGameboard) {
    var playersTemplate = require("text!../templates/users.template");
    var player = null;
    var challenge = null;
    var connection = null;
    function challangePlayer(guid, name) {
        if (connection !== null) {
            challenge = new GameChallenge.Challenge();
            challenge.challenger = player;
            challenge.challenged = new GamePlayer.Player(guid, name);
            var payload = {
                type: "challenge-request",
                challenge: challenge
            };
            connection.send(JSON.stringify(payload));
        }
    }
    function connectionOpen() {
        console.log("Websocket connection established");
        if (connection !== null) {
            connection.send(JSON.stringify({
                'guid': player.guid,
                'type': 'login-request'
            }));
        }
    }
    function connectionRecieveMessage(message) {
        var payload = JSON.parse(message.data);
        if (payload.type == "player-data") {
            $('#player-winnings').html(payload.user.winnings);
            $('#player-lost').html(payload.user.lost);
        }
        else if (payload.type == "players-list") {
            $('.player-challange').unbind("click");
            var width = ($(window).width() - $('#players').width()) / 2;
            $('#players').css('margin-left', Math.floor(width) + 'px');
            var template = _.template(playersTemplate);
            var templateData = {
                users: payload.players
            };
            $('#players').html(template(templateData));
            $('.player-challange').click(function (e) {
                var guid = $(this).attr('data-player-guid');
                var name = $(this).attr('data-player-name');
                challangePlayer(guid, name);
            });
        }
        else if (payload.type == "challenge-request") {
            challenge = new GameChallenge.Challenge();
            challenge.update(payload.challenge);
            $("#challenge-question-challenger").html(challenge.challenger.name);
            $("#challange-question").modal();
        }
        else if (payload.type == "challenge-response") {
            if (payload.challenge.status == "accepted") {
                $("#challenge-accepted-opponent").html(payload.challenge.challenged.name);
                challenge.update(payload.challenge);
                $("#start-challenge").click(function () {
                    challenge.status = "start";
                    challenge.nextTurn.update(challenge.challenged);
                    challenge.gameboard.lastUserGuid = challenge.nextTurn.guid;
                    var payload = {
                        type: "challenge-playing",
                        challenge: challenge
                    };
                    connection.send(JSON.stringify(payload));
                });
                $("#challange-accepted").modal();
                $('.player-challange').hide();
            }
            else {
                $("#challenge-rejected-opponent").html(payload.challenge.challenged.name);
                $("#challange-rejected").modal();
                $('.player-challange').text("challenge");
            }
        }
        else if (payload.type == "challenge-playing") {
            if (payload.challenge.status == "start") {
                challenge.update(payload.challenge);
                $("#players").hide();
                $('#player-move').text(challenge.nextTurn.name);
                $("#game-layout").show();
                $(".field").mousemove(function (e) {
                    if (challenge.gameboard.isFinished())
                        return;
                    if (challenge.nextTurn.guid !== player.guid)
                        return;
                    if (challenge.gameboard.getBoardItem($(this).attr('id')) != 0 /* E */)
                        return;
                    // $(this).addClass('hover');
                    challenge.gameboard.HightlightedFiled = $(this).attr('id');
                    challenge.gameboard.ownerGuid = player.guid;
                    challenge.status = "moving";
                    challenge.gameboard.draw();
                    // send gameboard to opponent
                    var payload = {
                        type: "challenge-playing",
                        challenge: challenge
                    };
                    connection.send(JSON.stringify(payload));
                });
                $('.field').mouseleave(function (e) {
                    challenge.gameboard.HightlightedFiled = null;
                    challenge.gameboard.ownerGuid = player.guid;
                    challenge.status = "moving";
                    challenge.gameboard.draw();
                    var payload = {
                        type: "challenge-playing",
                        challenge: challenge
                    };
                    connection.send(JSON.stringify(payload));
                });
                $("#game-board").mouseleave(function (e) {
                    challenge.gameboard.HightlightedFiled = null;
                    challenge.gameboard.ownerGuid = player.guid;
                    challenge.status = "moving";
                    challenge.gameboard.draw();
                    var payload = {
                        type: "challenge-playing",
                        challenge: challenge
                    };
                    connection.send(JSON.stringify(payload));
                });
                $(".field").click(function (e) {
                    if (challenge.gameboard.isFinished())
                        return;
                    if (challenge.nextTurn.guid !== player.guid)
                        return;
                    if (challenge.gameboard.getBoardItem($(this).attr('id')) != 0 /* E */)
                        return;
                    challenge.gameboard.setLastUserGuid(player.guid);
                    var id = $(this).attr('id');
                    var position = id.split('x');
                    var row = parseInt(position[0]);
                    var column = parseInt(position[1]);
                    challenge.gameboard.setBoardItem(column, row);
                    challenge.gameboard.switchActiveItem();
                    challenge.gameboard.highlightedField = null;
                    challenge.gameboard.draw();
                    challenge.status = "click";
                    if (challenge.nextTurn.guid == challenge.challenger.guid)
                        challenge.nextTurn.update(challenge.challenged);
                    else
                        challenge.nextTurn.update(challenge.challenger);
                    $('#player-move').text(challenge.nextTurn.name);
                    connection.send(JSON.stringify({
                        type: "challenge-playing",
                        challenge: challenge
                    }));
                });
            }
            else if (payload.challenge.status == "moving") {
                challenge.update(payload.challenge);
                challenge.gameboard.draw();
            }
            else if (payload.challenge.status == "click") {
                challenge.update(payload.challenge);
                $('#player-move').text(challenge.nextTurn.name);
                challenge.gameboard.draw();
                if (challenge.gameboard.isFinished()) {
                    challenge.status = "finished";
                    connection.send(JSON.stringify({
                        type: "challenge-finished",
                        challenge: challenge
                    }));
                }
                else {
                }
            }
        }
        else if (payload.type == "challenge-finished") {
            challenge.update(payload.challenge);
            if (challenge.winner != null) {
                $("#challenge-completed-winner-name").html(challenge.winner.name);
                $("#challenge-completed-winner").show();
                $("#challenge-completed-draw").hide();
            }
            else {
                $("#challenge-completed-winner").hide();
                $("#challenge-completed-draw").show();
            }
            $("#challenge-completed").modal();
        }
    }
    function initializeConnection() {
        connection = new WebSocket('ws://192.168.0.103:8080');
        connection.onopen = connectionOpen;
        connection.onmessage = connectionRecieveMessage;
    }
    $(document).ready(function () {
        var bs = bootstrap;
        var width = ($(window).width() - $('#name-form').width()) / 2;
        $('#name-form').css('margin-left', Math.floor(width) + 'px');
        $('#user-logoff').click(function (e) {
            $.ajax({
                url: 'logoff/' + player.guid,
                method: 'post'
            }).done(function (e) {
                $('#user').hide();
                $('#name-form').show();
                $('#players').hide();
            }).fail(function () {
            });
        });
        $('#connect').click(function (e) {
            var userName = $('#nameField').val();
            $.ajax({
                url: 'login/' + userName,
                method: 'post'
            }).done(function (data) {
                initializeConnection();
                player = new GamePlayer.Player(data.guid, data.name);
                $('#player').show();
                $('#player-name').html(player.name);
                $('#player-winnings').html(data.winnings);
                $('#player-lost').html(data.lost);
                $('#name-form').hide();
                $('#players').show();
            }).fail(function () {
                alert("error !");
            });
            e.preventDefault();
        });
        $('#accept-challenge').click(function () {
            if (challenge !== null) {
                challenge.status = "accepted";
                if (connection !== null) {
                    var payload = {
                        type: "challenge-response",
                        challenge: challenge
                    };
                    connection.send(JSON.stringify(payload));
                }
            }
        });
        $('#reject-challenge').click(function () {
            if (challenge !== null) {
                challenge.status = "rejected";
                if (connection !== null) {
                    var payload = {
                        type: "challenge-response",
                        challenge: challenge
                    };
                    connection.send(JSON.stringify(payload));
                }
            }
        });
        $('#challenge-completed-close').click(function () {
            $("#game-layout").hide();
            $("#players").show();
            connection.send(JSON.stringify({
                'guid': player.guid,
                'type': 'players-request'
            }));
            challenge.gameboard.clear();
            challenge.gameboard.draw();
        });
        var width = $(window).width();
        $('.field').width(width / 4);
        $('.field').height(width / 4);
        var gameLayoutWidth = 3 * (width / 4);
        $("#game-layout").css({ "margin-left": (width - gameLayoutWidth) / 2 + "px" });
    });
});
//# sourceMappingURL=index.js.map