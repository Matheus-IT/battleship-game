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

	fire: function (location) {
		for (let c = 0; c < this.numShips; c++) {
			let ship = this.ships[c];
			let index = ship.locations.indexOf(location);

			if (index >= 0) {
				// we have a hit
				ship.hits[index] = "hit";
				view.displayHit(location);
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
		view.displayMiss(location);
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
			row = Math.floor(Math.random() * this.boardSize); // between 0 and 6
			col = Math.floor(Math.random() * ((this.boardSize	- 3) + 1)); // between 0 and 4
		} else {
			// generate a start location for a vertical ship
			row = Math.floor(Math.random() * ((this.boardSize	- 3) + 1)); // between 0 and 4
			col = Math.floor(Math.random() * this.boardSize); // between 0 and 6
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
	locationsGuessed: [],

	processGuess: function (cellId) { 
		const location = cellId;
		
		this.guesses++;
		var hit = model.fire(location);
		// game over
		if (hit && model.shipsSunk === model.numShips) {
			view.displayMessage(`You sunk all my battleships in ${this.guesses} guesses.`);
		}
	}
};

function handleCellClick() {
	const cellId = this.getAttribute("id");
	controller.processGuess(cellId);
}

function generateCells() {
	const game_board = document.querySelector("#board");
	var qtt_cells = 49;
	var letter = 65;
	var column = 0;
	var iterations = 0;

	for (let i = 0; i < qtt_cells; i++, iterations++, column++) {
		let cell = document.createElement("button");
		if (iterations === 7) {
			letter++;
			iterations = 0;
			column = 0;
		}
		cell.setAttribute("class", "cell");
		cell.innerHTML = `${String.fromCharCode(letter)} ${column}`;
		game_board.appendChild(cell);
	}
}

function setCellsIds(cells) {
	var pos = 0;
	const size = model.boardSize;

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			let row = String(i);
			let column = String(j);
			cells[pos].setAttribute("id", (row + column));
			pos++;
		}
	}
}

function init() {
	generateCells();
	model.generateShipLocations();
	const cells = document.getElementsByClassName("cell");
	setCellsIds(cells);
	for (let cell of cells) {
		cell.onclick = handleCellClick;
	}
}

window.onload = init();
