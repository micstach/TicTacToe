/// <reference path="libs/typed/jquery/jquery.d.ts" />
export enum GameboardItem { E, X, O };

export class Gameboard
{
    board: Array<GameboardItem> = [GameboardItem.E, GameboardItem.E, GameboardItem.E,
                                   GameboardItem.E, GameboardItem.E, GameboardItem.E,
                                   GameboardItem.E, GameboardItem.E, GameboardItem.E];
    
    activeItem: GameboardItem ;
    
    ownerGuid: string ;
    highlightedField: string;
    lastUserGuid: string ;
    winner: GameboardItem = GameboardItem.E;
    time: number ;
    timer: number ;
        
    constructor() {
        this.activeItem = GameboardItem.X;
    }
    
    get HighlightedField(): string {
        return this.highlightedField;
    }
    
    set HightlightedFiled(value: string){
        this.highlightedField = value;
    }
    
    setWinner(winner: GameboardItem)
    {
        this.winner = winner ;
    }

    setActiveItem(item: GameboardItem)
    {
        this.activeItem = item ;
    }
    
    getAcitveItem(): GameboardItem { return this.activeItem ; }
    
    switchActiveItem()
    {
        if (this.activeItem == GameboardItem.O)
            this.activeItem = GameboardItem.X ;
        else if (this.activeItem == GameboardItem.X)
            this.activeItem = GameboardItem.O ;
    }
        
    setLastUserGuid(userGuid: string)
    {
        this.lastUserGuid = userGuid;   
    }
    
    getLastUserGuid()
    {
        return this.lastUserGuid;
    }
    
    setBoardItem(i: number, j:number)
    {
        this.board[3 * (j-1) + (i-1)] = this.activeItem;
        
        this.winner = this.testWinner() ;
    }
    
    getBoardItem(position: string): GameboardItem
    {
        var coords = position.split('x');

        var row = parseInt(coords[0]) ;
        var column = parseInt(coords[1]) ;
        
        return this.board[3*(row-1) + (column-1)] ;
    }
    
    setBoard(board: Array<GameboardItem>)
    {
        for (var i=0; i<this.board.length; i++)
        {
            this.board[i] = board[i] ;
        }
    }
    
    clear()
    {
        for (var i=0; i<this.board.length; i++)
        {
            this.board[i] = GameboardItem.E ;
        }
        
        $('.field')
            .removeClass('highlighted-o')
            .removeClass('highlighted-x')
            .removeClass('O')
            .removeClass('X') ;
    }
    
    draw()
    {
        $('.field').removeClass('highlighted-x').removeClass('highlighted-o') ;

        $('.field').removeClass('O').removeClass('X');

        for (var i=0; i<this.board.length; i++)
        {
            var x = ((i) % 3) + 1 ;
            var y = Math.floor((i) / 3) + 1;

            var id = y + 'x' + x ;

            if (this.board[i] == GameboardItem.O)
                $('#' + id).addClass('O') ;
            else if (this.board[i] == GameboardItem.X)
                $('#' + id).addClass('X') ;
        }
        this.winner = this.testWinner();    
        
        if (this.winner === GameboardItem.E)
            if (this.highlightedField !== null) {
                if (this.activeItem == GameboardItem.O)
                    $('#' + this.highlightedField).addClass('highlighted-o'); 
                else if (this.activeItem == GameboardItem.X)
                    $('#' + this.highlightedField).addClass('highlighted-x'); 
            }
    }
    
    getWinner() : GameboardItem { return this.winner ;}
    
    testWinner() : GameboardItem   
    {
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
        
        for (var i=0; i<templates.length; i++)
        {
            var template = templates[i] ;
            
            var counter = 1 ;
            var first: GameboardItem = this.getBoardItem(template[0]) ;
            for (var j=1; j<template.length; j++)
            {
                if (this.getBoardItem(template[j]) === first)
                    counter++ ;
            }
            
            if (first !== GameboardItem.E)
            {
                if (counter === 3)
                {
                    $('.field').removeClass('highlighted');
                    for (var j=0; j<template.length; j++)
                    {
                        $('#' + template[j]).addClass('highlighted');
                    }
                    return first ;
                }
            }
        }
        
        return GameboardItem.E;
    }
    
    isFinished(): boolean {
        if (this.winner != GameboardItem.E)
            return true ;
        else
        {
            var empty = 0 ;
            for (var i=0; i<this.board.length; i++)
                empty += (this.board[i] === GameboardItem.E) ? 1 : 0 ;
            
            return (empty == 0) ? true : false ;
        }
    }
    
    update(data) {
        this.setBoard(data.board) ;
        this.setLastUserGuid(data.lastUserGuid);
        this.setActiveItem(data.activeItem);
        this.setWinner(data.winner);      
        
        this.highlightedField = data.highlightedField ;
    }
}
