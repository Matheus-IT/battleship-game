"use strict";

const view = {
	displayMessage: function (msg) {
		var messageArea = document.querySelector("#messageArea");
		messageArea.innerHTML = msg;
	},
	displayHit: function (location) {
		var cell = document.getElementById(location);
		cell.innerHTML = "";
		cell.setAttribute("class", "hit");
	},
	displayMiss: function (location) {
		var cell = document.getElementById(location);
		cell.innerHTML = "";
		cell.setAttribute("class", "miss");
	}
};

const model = {
	gameOver: false,
	boardSize: 6, // 6 * 6
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,
	ships: [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	],

	fire: function (guess_location) {
		for (let c = 0; c < this.numShips; c++) {
			let ship = this.ships[c];
			let index = ship.locations.indexOf(guess_location);

			if (index >= 0) {
				// we have a hit
				ship.hits[index] = "hit";
				view.displayHit(guess_location);
				// evaluate if this ship was sunk
				if (this.isSunk(ship)) {
					view.displayMessage("You sank my battleship!");
					this.shipsSunk++;
				} else {
					let rows = "ABCDEF";
					// parse guess_location from numeric to alpha-numeric
					guess_location = rows[guess_location[0]] + guess_location[1];
					view.displayMessage(`Hit at location ${guess_location}!`);
				}
				return true;
			}
		}
		// if we don't have a hit
		view.displayMiss(guess_location);
		view.displayMessage("You missed.");
		return false;
	},

	isSunk: function (ship) {
		for (let c = 0; c < this.shipLength; c++) {
			if (ship.hits[c] !== "hit") return false; // the ship is still floating
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
	numGuesses: 0,
	locationsGuessed: [],

	processGuess: function (cellId) {
		const location = cellId;
		var alreadyGuessed = this.locationsGuessed;

		if (alreadyGuessed.indexOf(location) > -1) {
			view.displayMessage("Hey you already played there!");
		} else {
			var hit = model.fire(location);
			var chances_area = document.querySelector("#num_chances");

			this.numGuesses++;
			// game over
			if (20 - this.numGuesses === 0) {
				chances_area.innerHTML = "";
				view.displayMessage("<p>Game over, you ran out of chances.</p>")
				model.gameOver = true;
			} else {
				chances_area.innerHTML = `Now you have ${20 - this.numGuesses} chances.`;
			}
			if (model.shipsSunk === model.numShips) {
				chances_area.innerHTML = "";
				view.displayMessage(`<p>You sunk all my battleships in ${this.numGuesses} guesses.</p>`);
				model.gameOver = true;
			}

			alreadyGuessed.push(location);
		}

		// game over
		if (model.gameOver) {
			let messageArea = document.querySelector("#messageArea");
			let restart_button = document.createElement("a");


			restart_button.setAttribute("class", "restart_button");
			restart_button.innerHTML = "RESTART";
			restart_button.setAttribute("href", "index.html");
			messageArea.appendChild(restart_button);
			model.gameOver = true;
		}
	}
};

function handleCellClick() {
	if (!model.gameOver) {
		const cellId = this.getAttribute("id");
		controller.processGuess(cellId);
	}
}

function generateCells() {
	const game_board = document.querySelector("#board");
	var qtt_cells = model.boardSize * model.boardSize;
	var letter = 65;
	var column = 0;
	var iterations = 0;

	for (let i = 0; i < qtt_cells; i++, iterations++, column++) {
		let cell = document.createElement("button");
		// if it's the last cell of the column
		if (iterations === model.boardSize) {
			letter++;
			iterations = 0;
			column = 0;
		}
		cell.setAttribute("class", "cell");
		cell.innerHTML = `${String.fromCharCode(letter)}${column}`;
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
	const cells = document.getElementsByClassName("cell");
	setCellsIds(cells);
	for (let cell of cells) {
		cell.onclick = handleCellClick;
	}
	model.generateShipLocations();
}

window.onload = init();
