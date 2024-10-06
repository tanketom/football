document.addEventListener('DOMContentLoaded', () => {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const field = document.getElementById('field');
    const startButton = document.getElementById('startButton');
    const ticker = document.getElementById('ticker');
    const scoreboard = document.getElementById('scoreboard');
    const scoreDisplay = document.getElementById('score');
    const matchClock = document.createElement('div');
    matchClock.id = 'matchClock';
    scoreboard.appendChild(matchClock);
    const highlights = document.getElementById('highlights');

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
    let substitutions = { team1: 3, team2: 3 };

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

        // Check for yellow or red card
        const strengthRoll = Math.floor(Math.random() * player1.strength);
        const intelligenceRoll = Math.floor(Math.random() * player1.intelligence);

        if (strengthRoll > 90 && intelligenceRoll < 30) {
            if (Math.random() > 0.5) {
                addTickerMessage(`🟥: ${player1.name} is sent off for a harsh tackle!`);
                addHighlightMessage(`🟥: ${player1.name} sent off at ${gameTime} min`);
                removePlayer(team1, player1);
            } else {
                addTickerMessage(`🟨: ${player1.name} receives a yellow card for a rough tackle.`);
                addHighlightMessage(`🟨: ${player1.name} booked at ${gameTime} min`);
                player1.yellowCards = (player1.yellowCards || 0) + 1;
                if (player1.yellowCards === 2) {
                    addTickerMessage(`🟨 🟨: ${player1.name} receives a second yellow and is sent off!`);
                    addHighlightMessage(`🟨 🟨: ${player1.name} sent off at ${gameTime} min`);
                    removePlayer(team1, player1);
                }
            }
        }

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
        substitutions = { team1: 3, team2: 3 };

        updateBallPosition();
        updateScoreboard();

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
        updateMatchClock();

        // Simulate a duel between random players from each team
        const player1 = team1.players[Math.floor(Math.random() * team1.players.length)];
        const player2 = team2.players[Math.floor(Math.random() * team2.players.length)];
        const winner = duel(player1, player2);

        if (winner.teamNumber <= 11) {
            // Team 1 wins the duel
            addTickerMessage(getRandomMessage('advance', player1, player2));
            moveBallTowardsGoal(team1);
        } else {
            // Team 2 wins the duel
            addTickerMessage(getRandomMessage('intercept', player2, player1));
            moveBallTowardsGoal(team2);
        }

        updateBallPosition();

        // Check for player substitutions
        if (player1.constitution < 50 && substitutions.team1 > 0) {
            substitutePlayer(team1, player1);
        }
        if (player2.constitution < 50 && substitutions.team2 > 0) {
            substitutePlayer(team2, player2);
        }

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
            if (Math.random() < 0.3) { // 30% chance of scoring
                scoreGoal(team);
            } else {
                addTickerMessage(`The shot is saved by ${team === team1 ? team2.players.name : team1.players.name}!`);
            }
        }
    };

    // Function to handle scoring a goal
    const scoreGoal = (team) => {
        let scorer, goalkeeper;
        if (team === team1) {
            score.team1++;
            scorer = team1.players.find(player => player.position === 'Forward');
            goalkeeper = team2.players.find(player => player.position === 'Goalkeeper');
            addTickerMessage(`<b>${scorer.name} hammers that past ${goalkeeper.name}, he stood no chance there. The score is now ${score.team1} - ${score.team2}!</b>`);
            addHighlightMessage(`⚽: ${scorer.name} scored at ${gameTime} min`);
            addTickerMessage(`Up one there, ${team1.teamName}, now ${team2.teamName} must gather themselves.`);
            addTickerMessage(getCelebrationMessage(scorer));
        } else {
            score.team2++;
            scorer = team2.players.find(player => player.position === 'Forward');
            goalkeeper = team1.players.find(player => player.position === 'Goalkeeper');
            addTickerMessage(`<b>${scorer.name} hammers that past ${goalkeeper.name}, he stood no chance there. The score is now ${score.team1} - ${score.team2}!</b>`);
            addHighlightMessage(`⚽: ${scorer.name} scored at ${gameTime} min`);
            addTickerMessage(`The equaliser is in and the score is now ${score.team1} - ${score.team2}! Back to the old drawing board, who will take this?`);
            addTickerMessage(getCelebrationMessage(scorer));
        }

        // Reset ball position to center after a goal
        ballPosition = { x: 4, y: 3 };
        updateBallPosition();
        updateScoreboard();
    };

    // Function to update the scoreboard
    const updateScoreboard = () => {
        scoreDisplay.textContent = `${score.team1} - ${score.team2}`;
        scoreDisplay.classList.add('flash');
        setTimeout(() => {
            scoreDisplay.classList.remove('flash');
        }, 1000);
    };

    // Function to update the match clock
    const updateMatchClock = () => {
        matchClock.textContent = `Time: ${gameTime} min`;
    };

    // Function to add messages to the ticker
    const addTickerMessage = (message) => {
        const p = document.createElement('p');
        p.innerHTML = message;
        ticker.appendChild(p);
        ticker.scrollTop = ticker.scrollHeight; // Auto-scroll to the bottom
    };

    // Function to add messages to the highlights
    const addHighlightMessage = (message) => {
        const p = document.createElement('p');
        p.innerHTML = message;
        highlights.appendChild(p);
    };

    // Function to get a random message from a set of templates
    const getRandomMessage = (type, player1, player2) => {
        const messages = {
            advance: [
                `${player1.nickname} advances up the field, overtaking ${player2.name}`,
                `${player1.nickname} skillfully dribbles past ${player2.name}`,
                `${player1.nickname} makes a brilliant run, leaving ${player2.name} behind`
            ],
            intercept: [
                `${player2.name} intercepts ${team1.teamName}'s ${player1.nickname} and ${team2.teamName} now has the ball`,
                `${player2.name} cuts off the pass from ${player1.nickname}, possession goes to ${team2.teamName}`,
                `${player2.name} steps in and takes the ball from ${player1.nickname}`
            ]
        };
        const selectedMessages = messages[type];
        return selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
    };

    // Function to get a celebration message based on player's charisma
    const getCelebrationMessage = (player) => {
        const highCharismaMessages = [
            `${player.name} celebrates with the crowd, they're loving it!`,
            `${player.name} does a victory dance, the fans go wild!`,
            `${player.name} pumps up the crowd, what a moment!`
        ];
        const lowCharismaMessages = [
            `${player.name} celebrates quietly.`,
            `${player.name} acknowledges the crowd.`,
            `${player.name} gives a thumbs up to the fans.`
        ];
        return player.charisma > 70 ? highCharismaMessages[Math.floor(Math.random() * highCharismaMessages.length)] : lowCharismaMessages[Math.floor(Math.random() * lowCharismaMessages.length)];
    };

    // Function to substitute a player
    const substitutePlayer = (team, player) => {
        const substitute = team.players.find(p => p.teamNumber > 11 && !p.substituted);
        if (substitute) {
            substitute.substituted = true;
            player.substituted = true;
            addTickerMessage(`🔄: ${player.name} is substituted by ${substitute.name}`);
            addHighlightMessage(`🔄: ${player.name} substituted by ${substitute.name} at ${gameTime} min`);
            team.players = team.players.map(p => (p.teamNumber === player.teamNumber ? substitute : p));
            if (team === team1) {
                substitutions.team1--;
            } else {
                substitutions.team2--;
            }
        }
    };

    // Function to remove a player from the game
    const removePlayer = (team, player) => {
        team.players = team.players.filter(p => p.teamNumber !== player.teamNumber);
    };

    loadTeams();
    createGrid();

    startButton.addEventListener('click', startGame);
});
