// script.js
document.addEventListener('DOMContentLoaded', () => {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const startButton = document.getElementById('startButton');
    const ticker = document.getElementById('ticker');
    const clock = document.getElementById('clock');

    const teams = {};
    let team1Score = 0;
    let team2Score = 0;
    let currentMinute = 0;
    let gameInterval;

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

        if (team1Name === team2Name) {
            alert('Please select two different teams.');
            return;
        }

        loadTeam(team1Name, team1 => {
            loadTeam(team2Name, team2 => {
                displayTeamDetails(team1, team2);
                startGame(team1, team2);
            });
        });
    });

    function loadTeam(teamName, callback) {
        fetch(`JSON/${teamName.toLowerCase().replace(/ /g, '_')}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                teams[teamName] = data;
                callback(data);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    function displayTeamDetails(team1, team2) {
        const existingDetails = document.querySelectorAll('body > div:not(#ticker)');
        existingDetails.forEach(detail => detail.remove());

        const team1Details = document.createElement('div');
        team1Details.innerHTML = `<h2>${team1.teamName}</h2><p>Manager: ${team1.manager}</p><p>${team1.history}</p>`;
        document.body.insertBefore(team1Details, ticker);

        const team2Details = document.createElement('div');
        team2Details.innerHTML = `<h2>${team2.teamName}</h2><p>Manager: ${team2.manager}</p><p>${team2.history}</p>`;
        document.body.insertBefore(team2Details, ticker);
    }

    function startGame(team1, team2) {
        ticker.innerHTML = '';
        team1Score = 0;
        team2Score = 0;
        currentMinute = 0;
        updateScoreboard(team1, team2);
        updateClock();

        gameInterval = setInterval(() => {
            if (currentMinute >= 90) {
                clearInterval(gameInterval);
                return;
            }
            currentMinute++;
            const decision = makeDecision(team1, team2);
            updateTicker(decision);
            updateClock();
        }, 1000); // Update every second for real-time simulation
    }

    function makeDecision(team1, team2) {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        const player1 = team1.players[Math.floor(Math.random() * team1.players.length)];
        const player2 = team2.players[Math.floor(Math.random() * team2.players.length)];
        
        // Simulate a duel based on player stats and dice roll
        const duelResult = simulateDuel(player1, player2, diceRoll, team1, team2);
        return `Minute ${currentMinute}: ${duelResult}`;
    }

    function simulateDuel(player1, player2, diceRoll, team1, team2) {
        const player1Score = player1.strength + player1.dexterity + diceRoll;
        const player2Score = player2.strength + player2.dexterity + diceRoll;
        const fieldSides = ['left wing', 'right wing', 'center field', 'defensive third', 'attacking third'];
        const fieldSide = fieldSides[Math.floor(Math.random() * fieldSides.length)];

        if (player1Score > player2Score) {
            if (Math.random() < 0.03) { // 3% chance to score
                team1Score++;
                updateScoreboard(team1, team2);
                return `${player1.name} from ${team1.teamName} scores a goal from the ${fieldSide}!`;
            }
            return `${player1.name} from ${team1.teamName} outmaneuvers ${player2.name} from ${team2.teamName} on the ${fieldSide} and advances the ball!`;
        } else {
            if (Math.random() < 0.03) { // 3% chance to score
                team2Score++;
                updateScoreboard(team1, team2);
                return `${player2.name} from ${team2.teamName} scores a goal from the ${fieldSide}!`;
            }
            return `${player2.name} from ${team2.teamName} intercepts the ball from ${player1.name} from ${team1.teamName} on the ${fieldSide}!`;
        }
    }

    function updateTicker(decision) {
        const p = document.createElement('p');
        p.textContent = decision;
        ticker.appendChild(p);
        ticker.scrollTop = ticker.scrollHeight;
    }

    function updateScoreboard(team1, team2) {
        let scoreboard = document.getElementById('scoreboard');
        if (!scoreboard) {
            scoreboard = document.createElement('div');
            scoreboard.id = 'scoreboard';
            scoreboard.style.fontSize = '24px';
            scoreboard.style.marginBottom = '20px';
            document.body.insertBefore(scoreboard, document.body.firstChild);
        }
        scoreboard.textContent = `${team1.teamName} ${team1Score} - ${team2Score} ${team2.teamName}`;
    }

    function updateClock() {
        const minutes = Math.floor(currentMinute / 60);
        const seconds = currentMinute % 60;
        clock.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
});