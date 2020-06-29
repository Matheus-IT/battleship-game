"use strict";

const view = {
	displayMessage: function (msg) {
		var messageArea = document.querySelector("#messageArea");
		messageArea.innerHTML = msg;
	},
	displayHit: function (location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");
	},
	displayMiss: function (location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss");
	}
};

const model = {
	boardSize: 7, // 7 * 7
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0, // keeps the current num of ships that have been sunk
	ships: [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	],

	fire: function (guess) {
		for (let c = 0; c < this.numShips; c++) {
			let ship = this.ships[c];
			let index = ship.locations.indexOf(guess);

			if (index >= 0) {
				// we have a hit
				ship.hits[index] = "hit";
				view.displayHit(guess);
				view.displayMessage("Hit!");
				// evaluate if this ship was sunk
				if (this.isSunk(ship)) {
					view.displayMessage("You sank my battleship!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		// if we don't have a hit
		view.displayMiss(guess);
		view.displayMessage("You missed.");
		return false;
	},

	isSunk: function (ship) {
		for (let c = 0; c < this.shipLength; c++) {
			if (ship.hits !== "hit") return false; // the ship is still floating
		}
		return true; // the ship is sunk
	},

	generateShip: function () {
		var direction = Math.floor(Math.random() * 2); // 0 or 1
		var row;
		var col;

		if (direction === 1) {
			// generate a start location for a horizontal ship
			row = Math.floor(Math.random() * this.boardSize); // 0 or 6
			col = Math.floor(Math.random() * ((this.boardSize	- 3) + 1)); // 0 or 4
		} else {
			// generate a start location for a vertical ship
			row = Math.floor(Math.random() * ((this.boardSize	- 3) + 1)); // 0 or 4
			col = Math.floor(Math.random() * this.boardSize); // 0 or 6
		}

		var newShipLocations = [];
		for (var i = 0; i < this.shipLength; i++) {
			if (direction === 1) {
				// add location to array for new horizontal ship
				newShipLocations.push(row + "" + (col + i));
			} else {
				// add location to array for new vertical ship
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;
	},

	collision: function (locations) {
		for (let i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			for (let j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
					// collision of locations
					return true;
				}
			}
		}
		// no one collide
		return false;
	},

	generateShipLocations: function () {
		var locations;
		for (let i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();
			} while(this.collision(locations));
			this.ships[i].locations = locations;
		}
	}
};

const controller = {
	guesses: 0,

	processGuess: function (guess) { // takes an alpha-numeric guess
		var location = parseGuess(guess);
		if (location) {
			this.guesses++;
			var hit = model.fire(location);
			// game over
			if (hit && model.shipsSunk === model.numShips) {
				view.displayMessage(`You sunk all my battleships in ${this.guesses} guesses.`);
			}
		}
	}
};

function parseGuess(guess) {
	guess = guess.toUpperCase();
	if (guess === null || guess.length !== 2) {
		alert("oops, please enter a letter and a number on the board.");
	} else {
		var alphabet = "ABCDEFG";
		var firstChar = guess[0];
		var row = alphabet.indexOf(firstChar);
		var column = guess[1];

		if (isNaN(row) || isNaN(column)) {
			alert("oops, that isn't on the board.");
		} else if (	row < 0 || row >= model.boardSize ||
								column < 0 || column >= model.boardSize) {
			alert("oops, that's off the board.");
		} else {
			// if everything looks good 
			return row + column;
		}
	}
	// if there's a fail when checking
	return null;
}

function handleFireButton() {
	var guessInput = document.querySelector("#guessInput");
	var guess = guessInput.value;

	event.preventDefault();
	controller.processGuess(guess);
	guessInput.value = "";
}

function handleKeyPress(e) {
	var fireButton = document.querySelector("#fireButton");

	if (e.keyCode === 13) {
		e.preventDefault();
		fireButton.click();
	}
}

function init() {
	var guessInput = document.querySelector("#guessInput");
	var fireButton = document.querySelector("#fireButton");

	model.generateShipLocations();
	fireButton.onclick = handleFireButton;
	guessInput.onkeypress = handleKeyPress;

	/*
	var dts = document.getElementsByTagName("td");
	for (let dt of dts) {
		console.log(dt.getAttribute("id"));
	}
	*/
}

window.onload = init();
