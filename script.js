document.addEventListener('DOMContentLoaded', () => {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const field = document.getElementById('field');
    const startButton = document.getElementById('startButton');
    const ticker = document.getElementById('ticker');

    // List of team JSON files
    const teams = [
        '/JSON/brackenford_united.json',
        '/JSON/elderglen_fc.json'
        // Add more team JSON files here as needed
    ];

    let team1, team2;
    let ballPosition = { x: 4, y: 3 }; // Start at center circle
    let score = { team1: 0, team2: 0 };
    let gameTime = 0;
    let gameInterval;

    // Function to fetch and populate team data
    const loadTeams = async () => {
        try {
            for (const teamFile of teams) {
                const response = await fetch(teamFile);
                const teamData = await response.json();
                populateTeamSelect(team1Select, teamData);
                populateTeamSelect(team2Select, teamData);
            }
        } catch (error) {
            console.error('Error loading team data:', error);
        }
    };

    // Function to populate a select element with team data
    const populateTeamSelect = (selectElement, teamData) => {
        const option = document.createElement('option');
        option.value = teamData.teamName;
        option.textContent = teamData.teamName;
        selectElement.appendChild(option);
    };

    // Function to create the grid
    const createGrid = () => {
        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 9; x++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                field.appendChild(cell);
            }
        }
    };

    // Function to update the ball position on the field
    const updateBallPosition = () => {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.innerHTML = '';
        });
        const ballCell = document.querySelector(`.grid-cell[data-x='${ballPosition.x}'][data-y='${ballPosition.y}']`);
        const ball = document.createElement('div');
        ball.id = 'ball';
        ballCell.appendChild(ball);
    };

    // Function to simulate a duel between two players
    const duel = (player1, player2) => {
        const player1Score = rollDice(player1);
        const player2Score = rollDice(player2);

        return player1Score > player2Score ? player1 : player2;
    };

    // Function to roll dice based on player attributes
    const rollDice = (player) => {
        const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        let score = 0;

        attributes.forEach(attr => {
            score += Math.floor(Math.random() * player[attr]);
        });

        return score;
    };

    // Function to start the game
    const startGame = async () => {
        const team1Name = team1Select.value;
        const team2Name = team2Select.value;

        team1 = await fetchTeamData(team1Name);
        team2 = await fetchTeamData(team2Name);

        ticker.innerHTML = '';
        addTickerMessage(`The referee blows her whistle, and the game is on!`);

        gameTime = 0;
        score = { team1: 0, team2: 0 };
        ballPosition = { x: 4, y: 3 }; // Reset ball position to center

        updateBallPosition();

        gameInterval = setInterval(simulateMinute, 1000); // Simulate each minute
    };

    // Function to fetch team data based on team name
    const fetchTeamData = async (teamName) => {
        const teamFile = teams.find(file => file.includes(teamName.toLowerCase().replace(' ', '_')));
        const response = await fetch(teamFile);
        return await response.json();
    };

    // Function to simulate each minute of the game
    const simulateMinute = () => {
        gameTime++;

        // Simulate a duel between random players from each team
        const player1 = team1.players[Math.floor(Math.random() * team1.players.length)];
        const player2 = team2.players[Math.floor(Math.random() * team2.players.length)];
        const winner = duel(player1, player2);

        if (winner.teamNumber <= 11) {
            // Team 1 wins the duel
            addTickerMessage(`${player1.nickname} advances up the field, overtaking ${player2.name}`);
            moveBallTowardsGoal(team1);
        } else {
            // Team 2 wins the duel
            addTickerMessage(`${player2.name} intercepts ${team1.teamName}'s ${player1.nickname} and ${team2.teamName} now has the ball`);
            moveBallTowardsGoal(team2);
        }

        updateBallPosition();

        if (gameTime === 45) {
            addTickerMessage(`The referee blows for half time, and ${team1.teamName} now has to think hard over for a few minutes to see if they can turn this around.`);
            clearInterval(gameInterval);
            setTimeout(() => {
                addTickerMessage(`The second half begins!`);
                gameInterval = setInterval(simulateMinute, 1000);
            }, 3000); // 3 seconds break for half time
        } else if (gameTime === 90) {
            addTickerMessage(`The referee blows the final whistle! The game ends with a score of ${score.team1} - ${score.team2}.`);
            clearInterval(gameInterval);
        }
    };

    // Function to move the ball towards the goal
    const moveBallTowardsGoal = (team) => {
        if (team === team1) {
            if (ballPosition.x < 8) ballPosition.x++;
        } else {
            if (ballPosition.x > 0) ballPosition.x--;
        }

        // Check if the ball is at the goal
        if ((team === team1 && ballPosition.x === 8 && ballPosition.y === 3) ||
            (team === team2 && ballPosition.x === 0 && ballPosition.y === 3)) {
            scoreGoal(team);
        }
    };

    // Function to handle scoring a goal
    const scoreGoal = (team) => {
        if (team === team1) {
            score.team1++;
            addTickerMessage(`${team1.players.name} hammers that past the ${team2.players.name}, he stood no chance there.`);
            addTickerMessage(`Up one there, ${team1.teamName}, now ${team2.teamName} must gather themselves.`);
        } else {
            score.team2++;
            addTickerMessage(`${team2.players.name} hammers that past the ${team1.players.name}, he stood no chance there.`);
            addTickerMessage(`The equaliser is in and the score is now ${score.team1} - ${score.team2}! Back to the old drawing board, who will take this?`);
        }

        // Reset ball position to center after a goal
        ballPosition = { x: 4, y: 3 };
        updateBallPosition();
    };

    // Function to add messages to the ticker
    const addTickerMessage = (message) => {
        const p = document.createElement('p');
        p.textContent = message;
        ticker.appendChild(p);
        ticker.scrollTop = ticker.scrollHeight; // Auto-scroll to the bottom
    };

    loadTeams();
    createGrid();

    startButton.addEventListener('click', startGame);
});