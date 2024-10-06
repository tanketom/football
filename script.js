// script.js
document.addEventListener('DOMContentLoaded', () => {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const startButton = document.getElementById('startButton');
    const ticker = document.getElementById('ticker');

    const teams = {};

    // Populate team selects with team names
    const teamNames = ['Brackenford United', 'Elderglen FC']; // Add more team names as needed
    teamNames.forEach(teamName => {
        const option1 = document.createElement('option');
        option1.value = teamName;
        option1.textContent = teamName;
        team1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = teamName;
        option2.textContent = teamName;
        team2Select.appendChild(option2);
    });

    startButton.addEventListener('click', () => {
        const team1Name = team1Select.value;
        const team2Name = team2Select.value;
        loadTeam(team1Name, team1 => {
            loadTeam(team2Name, team2 => {
                displayTeamDetails(team1, team2);
                startGame(team1, team2);
            });
        });
    });

    function loadTeam(teamName, callback) {
        fetch(`JSON/${teamName.toLowerCase().replace(/ /g, '_')}.json`)
            .then(response => response.json())
            .then(data => {
                teams[teamName] = data;
                callback(data);
            });
    }

    function displayTeamDetails(team1, team2) {
        const team1Details = document.createElement('div');
        team1Details.innerHTML = `<h2>${team1.teamName}</h2><p>Manager: ${team1.manager}</p><p>${team1.history}</p>`;
        document.body.insertBefore(team1Details, ticker);

        const team2Details = document.createElement('div');
        team2Details.innerHTML = `<h2>${team2.teamName}</h2><p>Manager: ${team2.manager}</p><p>${team2.history}</p>`;
        document.body.insertBefore(team2Details, ticker);
    }

    function startGame(team1, team2) {
        ticker.innerHTML = '';
        let gameLog = [];
        // Simulate game logic here
        for (let i = 0; i < 90; i++) { // Simulate 90 minutes
            const decision = makeDecision(team1, team2);
            gameLog.push(decision);
            updateTicker(decision);
        }
    }

    function makeDecision(team1, team2) {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        const player1 = team1.players[Math.floor(Math.random() * team1.players.length)];
        const player2 = team2.players[Math.floor(Math.random() * team2.players.length)];
        
        // Simulate a duel based on player stats and dice roll
        const duelResult = simulateDuel(player1, player2, diceRoll);
        return `Minute ${Math.floor(Math.random() * 90) + 1}: ${duelResult}`;
    }

    function simulateDuel(player1, player2, diceRoll) {
        const player1Score = player1.strength + player1.dexterity + diceRoll;
        const player2Score = player2.strength + player2.dexterity + diceRoll;

        if (player1Score > player2Score) {
            return `${player1.name} from ${team1.teamName} outmaneuvers ${player2.name} from ${team2.teamName} and advances the ball!`;
        } else {
            return `${player2.name} from ${team2.teamName} intercepts the ball from ${player1.name} from ${team1.teamName}!`;
        }
    }

    function updateTicker(decision) {
        const p = document.createElement('p');
        p.textContent = decision;
        ticker.appendChild(p);
        ticker.scrollTop = ticker.scrollHeight;
    }
});