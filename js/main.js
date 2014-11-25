"use strict";

$(document).ready(function() {
    //Pops rule on page load
    $('#rules').modal();

    var gameBoard = $('#gameBoard');
    var stats = $('#wrapStats');
    var timer;
    var matches;
    var misses;
    var  i;

    //array that records the flipped tiles
    var flippedTiles;

    //Array of images 1 through 32
    var tiles = [];
    for(i = 1; i <= 32; ++i) {
        tiles.push({
            num: i,
            src: 'img/tile' + i + '.jpg',
            faceUp: false
        });
    }

    function initStats() {
            matches = 0;
            misses = 0;
            flippedTiles = [];

            $('#matches').text('Matches: ' + matches);
            $('#left').text('Left: ' + (8 - matches))
            $('#misses').text('Misses: ' + misses);
            startTimer();
            stats.fadeIn(250);
    }

    $('.rules').click(function() {
        var rules = $('#rules');
        rules.find('.dismiss').css('display', 'inline');
        rules.find('.newGame').css('display', 'none');
        rules.modal();
    });

    //Resets everything and starts new game when clicked
    $('.newGame').click(function() {
        fillBoard();
        initStats();
        playGame();
    });

    //fills the gameboard with tiles
    function fillBoard() {
        $(gameBoard).empty();
        var shuffledTiles = _.shuffle(tiles);
        var selectedTiles = shuffledTiles.slice(0, 8);

        var pairs = [];
        _.forEach(selectedTiles, function(tile) {
            pairs.push(_.clone(tile));
            pairs.push(_.clone(tile));
        });
        pairs = _.shuffle(pairs); 

        //adds everything to the gameboard
        var row = $(document.createElement('div'));
        var tileContainer;
        var flip;
        var front;
        var back;

        //fills the gameboard
        _.forEach(pairs, function(tile, index) {
            if(index > 0 && 0 == index % 4) {
                gameBoard.append(row);
                row = $(document.createElement('div'));
            }

            tileContainer = $(document.createElement('div'));
            flip = $(document.createElement('div'));
            front = $(document.createElement('img'));
            back = $(document.createElement('img'));

            tileContainer.addClass('tileContainer');
            flip.addClass('flipTransition');
            front.addClass('front');
            back.addClass('back');

            tileContainer.append(flip);
            flip.append(back, front);

            front.attr({
                src: tile.src,
                alt: 'front side of tile number' + tile.num
            });

            back.attr({
                src: 'img/tile-back.png',
                alt: 'the back of unknown tiles'
            });
            tileContainer.data('tile', tile);

            //tiles get put into row
            row.append(tileContainer);
        });

        //rows get put into gameboard
        gameBoard.append(row);

        gameBoard.fadeIn(250);
    }

    function playGame() {
        gameBoard.find('.tileContainer').click(function() {
            var tileContainer = $(this);
            var tile = tileContainer.data('tile');
            var flipCount;
            var tileContainerBefore;
            var tileBefore;

            //will flip if the tile is face down
            if(!tile.faceUp) {
                animateFlip(tileContainer, tile);
                flippedTiles.push(tileContainer)
                flipCount = flippedTiles.length;

                if(0 == flipCount % 2) {
                    tileContainerBefore = flippedTiles[flipCount - 2];
                    tileBefore = tileContainerBefore.data('tile');

                    if(tile.num != tileBefore.num) {
                        ++misses;
                        setTimeout(function() {
                            animateFlip(tileContainer, tile);
                            animateFlip(tileContainerBefore, tileBefore);
                        }, 1000); // 1 second timer after wrong pair
                    } else {
                        ++matches;
                    }
                }
                $('#results').text('Matches: ' + matches + '   Left: ' + (8 - matches) + '   Misses: ' + misses);
                $('#matches').text('Matches: ' + matches);
                $('#left').text('Left: ' + (8 - matches))
                $('#misses').text('Misses: ' + misses);
            }
            if(matches >= 8) {
                win();
            }
        });
    }

    //flip animation
    function animateFlip(tileContainer, tile) {
        tileContainer.find('.flipTransition').toggleClass('flip');
        tile.faceUp = !tile.faceUp;
    }


    //makes the timer start
    function startTimer() {
        window.clearInterval(timer);
        $('#passedTime').text('Time: 0 seconds');
        var startTime = _.now();

        timer = window.setInterval(function() {
            var passedTime = Math.floor((_.now() - startTime) / 1000);
            $('#passedTime').text('Time: ' + passedTime + ' seconds');
        }, 1000);
    }

    //when you win, this will display the message
    function win() {
        window.clearInterval(timer);
        var gameWin = $('#gameWin');
        var time = parseInt($('#passedTime').text().replace(/\D/g, ''));

        gameWin.find('p').text(
            'Congratulations! You won in ' +
            time + ' seconds. You guessed incorrectly ' +
            misses + ' times which brings you to a total of ' + flippedTiles.length / 2 +
            ' total turns. Thanks for playing!');
        gameWin.modal();
    }
});