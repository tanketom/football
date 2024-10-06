document.addEventListener('DOMContentLoaded', () => {
    const teamSelect1 = document.getElementById('team1');
    const teamSelect2 = document.getElementById('team2');
    const scoreboard = document.getElementById('score');
    const ticker = document.getElementById('ticker');
    const teams = [];
    let ballPosition = { row: 2, col: 2 };
    let homeScore = 0;
    let awayScore = 0;
    let currentMinute = 0;
    let gameInterval;
    let homeTeam, awayTeam;

    const teamFiles = ['JSON/brackenford_united.json', 'JSON/elderglen_fc.json'];

    const formations = {
        "4-4-2": {
            "Goalkeeper": [{ top: "80%", left: "50%" }],
            "Defender": [
                { top: "60%", left: "20%" },
                { top: "60%", left: "40%" },
                { top: "60%", left: "60%" },
                { top: "60%", left: "80%" }
            ],
            "Midfielder": [
                { top: "40%", left: "20%" },
                { top: "40%", left: "40%" },
                { top: "40%", left: "60%" },
                { top: "40%", left: "80%" }
            ],
            "Forward": [
                { top: "20%", left: "40%" },
                { top: "20%", left: "60%" }
            ]
        },
        "4-3-3": {
            "Goalkeeper": [{ top: "80%", left: "50%" }],
            "Defender": [
                { top: "60%", left: "20%" },
                { top: "60%", left: "40%" },
                { top: "60%", left: "60%" },
                { top: "60%", left: "80%" }
            ],
            "Midfielder": [
                { top: "40%", left: "30%" },
                { top: "40%", left: "50%" },
                { top: "40%", left: "70%" }
            ],
            "Forward": [
                { top: "20%", left: "20%" },
                { top: "20%", left: "50%" },
                { top: "20%", left: "80%" }
            ]
        }
    };

    // Load teams from JSON files
    function loadTeams() {
        teamFiles.forEach(file => {
            fetch(file)
                .then(response => response.json())
                .then(data => {
                    teams.push(data);
                    populateTeamSelect(teamSelect1, data);
                    populateTeamSelect(teamSelect2, data);
                });
        });
    }

    // Populate team select dropdown
    function populateTeamSelect(selectElement, team) {
        const option = document.createElement('option');
        option.value = team.teamName;
        option.text = team.teamName;
        selectElement.add(option);
    }

    // Validate formation
    function validateFormation(formation) {
        const positions = formation.split('-');
        const totalPlayers = positions.reduce((sum, num) => sum + parseInt(num), 0);
        return totalPlayers === 10;
    }

    // Generate dynamic formation
    function generateFormation(formation) {
        const positions = formation.split('-');
        const formationMap = {
            "Goalkeeper": [{ top: "80%", left: "50%" }],
            "Defender": [],
            "Midfielder": [],
            "Forward": []
        };

        const positionNames = ["Defender", "Midfielder", "Forward"];
        let topOffsets = ["60%", "40%", "20%"];
        let leftOffsets = ["20%", "40%", "60%", "80%"];

        positions.forEach((count, index) => {
            for (let i = 0; i < count; i++) {
                formationMap[positionNames[index]].push({
                    top: topOffsets[index],
                    left: leftOffsets[i % leftOffsets.length]
                });
            }
        });

        return formationMap;
    }

    // Display team formation
    function displayTeamFormation(team, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const formation = validateFormation(team.formation) ? generateFormation(team.formation) : formations["4-4-2"];
        team.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player';
            playerDiv.innerText = `${player.name} (${player.nickname})`;
            const position = formation[player.position].shift();
            playerDiv.style.top = position.top;
            playerDiv.style.left = position.left;
            container.appendChild(playerDiv);
        });
    }

    // Event listener for team selection
    teamSelect1.addEventListener('change', () => {
        homeTeam = teams.find(team => team.teamName === teamSelect1.value);
        displayTeamFormation(homeTeam, 'field');
    });

    teamSelect2.addEventListener('change', () => {
        awayTeam = teams.find(team => team.teamName === teamSelect2.value);
        displayTeamFormation(awayTeam, 'field');
    });

    // Simulate a football game
    function startGame() {
        currentMinute = 0;
        ballPosition = { row: 2, col: 2 };
        homeScore = 0;
        awayScore = 0;
        updateScoreboard();
        ticker.innerHTML = '<p>The referee blows his whistle, starting the game!</p>';
        gameInterval = setInterval(simulateMinute, 1000);
    }

    // Simulate each minute of the game
    function simulateMinute() {
        if (currentMinute >= 90) {
            clearInterval(gameInterval);
            ticker.innerHTML += `<p>Full time! Final score: ${homeScore} - ${awayScore}</p>`;
            return;
        }

        currentMinute++;
        const duelResult = simulateDuel();
        if (duelResult === 'home') {
            moveBallTowardsGoal('home');
        } else {
            moveBallTowardsGoal('away');
        }

        // Check for goal
        if (ballPosition.col === 0 || ballPosition.col === 4) {
            const scoringTeam = ballPosition.col === 0 ? 'home' : 'away';
            const goalkeeper = scoringTeam === 'home' ? getPlayerInCell(awayTeam, { row: 2, col: 0 }) : getPlayerInCell(homeTeam, { row: 2, col: 4 });
            const goalScored = attemptGoal(goalkeeper);

            if (goalScored) {
                if (scoringTeam === 'home') {
                    homeScore++;
                    ticker.innerHTML += `<p>Goal for ${homeTeam.teamName}! Score: ${homeScore} - ${awayScore}</p>`;
                } else {
                    awayScore++;
                    ticker.innerHTML += `<p>Goal for ${awayTeam.teamName}! Score: ${homeScore} - ${awayScore}</p>`;
                }
                updateScoreboard();
                ballPosition = { row: 2, col: 2 };
            } else {
                ticker.innerHTML += `<p>Great save by the goalkeeper!</p>`;
            }
        }
    }

    // Simulate a duel based on player attributes
    function simulateDuel() {
        const homePlayer = getPlayerInCell(homeTeam, ballPosition);
        const awayPlayer = getPlayerInCell(awayTeam, ballPosition);

        const homeScore = calculatePlayerScore(homePlayer);
        const awayScore = calculatePlayerScore(awayPlayer);

        ticker.innerHTML += `<p>${homePlayer.name} (Home) vs ${awayPlayer.name} (Away)</p>`;

        // Check for yellow/red card
        const foul = checkForFoul(homePlayer, awayPlayer);
        if (foul) {
            handleFoul(foul);
        }

        return homeScore > awayScore ? 'home' : 'away';
    }

    // Get player in the current cell
    function getPlayerInCell(team, position) {
        return team.players[Math.floor(Math.random() * team.players.length)];
    }

    // Calculate player score based on attributes
    function calculatePlayerScore(player) {
        return player.strength + player.dexterity + player.intelligence;
    }

    // Attempt to score a goal considering the goalkeeper's attributes
    function attemptGoal(goalkeeper) {
        const goalkeeperScore = calculatePlayerScore(goalkeeper);
        const goalChance = Math.random() * 100;
        return goalChance > goalkeeperScore;
    }

    // Move the ball towards the goal
    function moveBallTowardsGoal(team) {
        const direction = team === 'home' ? -1 : 1;
        if (ballPosition.col + direction >= 0 && ballPosition.col + direction <= 4) {
            ballPosition.col += direction;
        } else {
            ballPosition.row = Math.max(0, Math.min(4, ballPosition.row + (Math.random() > 0.5 ? 1 : -1)));
        }
        ticker.innerHTML += `<p>${team === 'home' ? homeTeam.teamName : awayTeam.teamName} moves the ball to (${ballPosition.row}, ${ballPosition.col})</p>`;
    }

    // Check for foul
    function checkForFoul(homePlayer, awayPlayer) {
        const foulChance = Math.random();
        const homeFoul = homePlayer.strength > 80 && homePlayer.intelligence < 60 && foulChance < 0.1;
        const awayFoul = awayPlayer.strength > 80 && awayPlayer.intelligence < 60 && foulChance < 0.1;

        if (homeFoul) {
            return { team: 'home', player: homePlayer };
        } else if (awayFoul) {
            return { team: 'away', player: awayPlayer };
        }
        return null;
    }

    // Handle foul
    function handleFoul(foul) {
        const cardChance = Math.random();
        const player = foul.player;
        const team = foul.team === 'home' ? homeTeam : awayTeam;

        if (cardChance < 0.5) {
            player.yellowCards = (player.yellowCards || 0) + 1;
            ticker.innerHTML += `<p>Yellow card for ${player.name} (${team.teamName})</p>`;
            if (player.yellowCards === 2) {
                sendOffPlayer(player, team);
            }
        } else {
            ticker.innerHTML += `<p>Red card for ${player.name} (${team.teamName})</p>`;
            sendOffPlayer(player, team);
        }
    }

    // Send off player
    function sendOffPlayer(player, team) {
        ticker.innerHTML += `<p>${player.name} (${team.teamName}) is sent off!</p>`;
        team.players = team.players.filter(p => p !== player);
    }

    // Update the scoreboard
    function updateScoreboard() {
        scoreboard.innerHTML = `${homeScore} - ${awayScore}`;
        scoreboard.classList.add('flash');
        setTimeout(() => scoreboard.classList.remove('flash'), 500);
    }

    // Load teams on page load
    loadTeams();

    // Start the game when both teams are selected
    document.getElementById('startButton').addEventListener('click', startGame);
});
