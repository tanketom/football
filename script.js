document.addEventListener('DOMContentLoaded', () => {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');
    const startButton = document.getElementById('startButton');
    const scoreboard = document.getElementById('scoreboard');
    const clock = document.getElementById('clock');
    const field = document.getElementById('field');
    const goalScorers = document.getElementById('goalScorers');
    const ticker = document.getElementById('ticker');

    let teams = {};
    let gameInterval;
    let gameTime = 0;
    let team1, team2;
    let score = { team1: 0, team2: 0 };
    let substitutions = { team1: 0, team2: 0 };
    let yellowCards = {};
    let redCards = {};
    let ballPosition = { x: 2, y: 2 }; // Start in the middle of the grid
    let ballPossession = ''; // 'team1' or 'team2'

    const commentaryPhrases = {
        start: [
            "The referee blows the whistle and starts the game between {team1} and {team2}.",
            "Kick-off! {team1} faces {team2} in today's match.",
            "The game begins! {team1} vs {team2}."
        ],
        goal: [
            "{player} from {team} scores! The score is now {score}.",
            "What a goal by {player} of {team}! The scoreboard reads {score}.",
            "Goal! {player} nets one for {team}. It's now {score}."
        ],
        pass: [
            "{player1} from {team1} passes to {player2}.",
            "{player1} makes a swift pass to {player2}.",
            "A beautiful pass from {player1} to {player2}."
        ],
        tackle: [
            "A dangerous tackle there from {player1}, taking down {player2}.",
            "{player1} makes a strong tackle on {player2}.",
            "{player1} from {team1} stops {player2} with a solid tackle."
        ],
        foul: [
            "{player1} commits a foul on {player2}. The referee is not happy.",
            "A foul by {player1} on {player2}. The referee gives a warning.",
            "{player1} from {team1} fouls {player2}. The game is paused."
        ],
        substitution: [
            "{playerOut} is substituted by {playerIn} for {team}.",
            "{team} makes a substitution: {playerOut} out, {playerIn} in.",
            "Substitution for {team}: {playerOut} is replaced by {playerIn}."
        ],
        redCard: [
            "{player} from {team} receives a red card and is sent off!",
            "The referee shows a red card to {player} of {team}.",
            "{player} from {team} is sent off with a red card!"
        ],
        yellowCard: [
            "{player} from {team} receives a yellow card.",
            "The referee shows a yellow card to {player} of {team}.",
            "{player} from {team} is booked with a yellow card."
        ],
        general: [
            "The game continues with intense action on the field.",
            "Both teams are fighting hard for control of the ball.",
            "It's a tense match with both sides showing great skill."
        ],
        advance: [
            "{player} is advancing up the field, and dribbles past {opponent} up the left wing!",
            "{player} moves forward with the ball, evading {opponent}!",
            "{player} from {team} makes a run up the pitch, leaving {opponent} behind!"
        ],
        intercept: [
            "{opponent} intercepts {player} and grabs possession of the ball for {team}.",
            "{opponent} from {team} cuts off {player}'s advance and takes the ball.",
            "{opponent} steals the ball from {player}, turning the play around for {team}."
        ]
    };

    function getRandomPhrase(type, replacements) {
        const phrases = commentaryPhrases[type];
        let phrase = phrases[Math.floor(Math.random() * phrases.length)];
        for (const key in replacements) {
            phrase = phrase.replace(`{${key}}`, replacements[key]);
        }
        return phrase;
    }

    // List of JSON files in the /JSON folder
    const jsonFiles = [
        'brackenford_united.json',
        'elderglen_fc.json'
        // Add more JSON files here
    ];

    // Load all team data from the JSON folder
    fetchTeams();

    function fetchTeams() {
        jsonFiles.forEach(file => {
            fetch(`JSON/${file}`)
                .then(response => response.json())
                .then(data => {
                    teams[data.teamName] = data;
                    populateTeamSelect(team1Select, data.teamName);
                    populateTeamSelect(team2Select, data.teamName);
                });
        });
    }

    function populateTeamSelect(selectElement, teamName) {
        const option = document.createElement('option');
        option.value = teamName;
        option.textContent = teamName;
        selectElement.appendChild(option);
    }

    startButton.addEventListener('click', startGame);

    function startGame() {
        team1 = teams[team1Select.value];
        team2 = teams[team2Select.value];
        if (!team1 || !team2) {
            alert('Please select both teams.');
            return;
        }

        resetGame();
        ballPossession = Math.random() < 0.5 ? 'team1' : 'team2'; // Coin toss
        addCommentary(getRandomPhrase('start', { team1: team1.teamName, team2: team2.teamName }));
        gameInterval = setInterval(simulateMinute, 1000);
    }

    function resetGame() {
        gameTime = 0;
        score = { team1: 0, team2: 0 };
        substitutions = { team1: 0, team2: 0 };
        yellowCards = {};
        redCards = {};
        ballPosition = { x: 2, y: 2 }; // Reset to middle
        ballPossession = ''; // Reset possession
        scoreboard.textContent = '0 - 0';
        clock.textContent = '00:00';
        goalScorers.innerHTML = '';
        ticker.innerHTML = '';
        field.innerHTML = '';
    }

    function simulateMinute() {
        gameTime++;
        clock.textContent = formatTime(gameTime);

        if (gameTime > 90) {
            clearInterval(gameInterval);
            addCommentary('The referee blows the final whistle. The game is over.');
            return;
        }

        // Simulate game events
        const event = Math.random();
        if (event < 0.2) {
            // Goal event
            if (attemptGoal()) {
                const scoringTeam = ballPossession;
                const scorer = getRandomPlayer(scoringTeam);
                score[scoringTeam]++;
                updateScoreboard();
                addGoalScorer(scorer);
                addCommentary(`<b>${getRandomPhrase('goal', { player: scorer.name, team: teams[scoringTeam].teamName, score: `${score.team1} - ${score.team2}` })}</b>`);
                resetBallPosition();
            }
        } else if (event < 0.4) {
            // Foul event
            const player1 = getRandomPlayer('team1');
            const player2 = getRandomPlayer('team2');
            handleFoul(player1, player2);
        } else if (event < 0.5) {
            // Substitution event
            const team = Math.random() < 0.5 ? 'team1' : 'team2';
            if (substitutions[team] < 3) {
                const playerOut = getRandomPlayer(team, true);
                const playerIn = getRandomPlayer(team, false, true);
                handleSubstitution(team, playerOut, playerIn);
            }
        } else {
            // Regular game event
            handleBallMovement();
        }
    }

    function handleBallMovement() {
        const direction = Math.random();
        const player = getRandomPlayer(ballPossession);
        const opponent = getRandomPlayer(ballPossession === 'team1' ? 'team2' : 'team1');
        player.constitution -= 1; // Decrease constitution for active player

        if (player.constitution <= 0 && substitutions[ballPossession] < 3) {
            const playerIn = getRandomPlayer(ballPossession, false, true);
            handleSubstitution(ballPossession, player, playerIn);
        }

        if (direction < 0.25 && ballPosition.y > 0) {
            ballPosition.y--; // Move up
            addCommentary(getRandomPhrase('advance', { player: player.name, opponent: opponent.name, team: teams[ballPossession].nickname }));
        } else if (direction < 0.5 && ballPosition.y < 4) {
            ballPosition.y++; // Move down
            addCommentary(getRandomPhrase('advance', { player: player.name, opponent: opponent.name, team: teams[ballPossession].nickname }));
        } else if (direction < 0.75 && ballPosition.x > 0) {
            ballPosition.x--; // Move left
            addCommentary(getRandomPhrase('advance', { player: player.name, opponent: opponent.name, team: teams[ballPossession].nickname }));
        } else if (ballPosition.x < 4) {
            ballPosition.x++; // Move right
            addCommentary(getRandomPhrase('advance', { player: player.name, opponent: opponent.name, team: teams[ballPossession].nickname }));
        } else {
            // Interception by opponent
            ballPossession = ballPossession === 'team1' ? 'team2' : 'team1';
            addCommentary(getRandomPhrase('intercept', { player: player.name, opponent: opponent.name, team: teams[ballPossession].nickname }));
        }
    }

    function attemptGoal() {
        const { x, y } = ballPosition;
        const distanceToGoal = Math.abs(x - 2) + Math.abs(y - 2); // Manhattan distance to the center
        let goalProbability;

        if (distanceToGoal === 0) {
            goalProbability = 0.3; // Highest chance to score from the center
        } else if (distanceToGoal === 1) {
            goalProbability = 0.2;
        } else if (distanceToGoal === 2) {
            goalProbability = 0.15;
        } else if (distanceToGoal === 3) {
            goalProbability = 0.1;
        } else {
            goalProbability = 0.05; // Lowest chance to score from the farthest positions
        }

        return Math.random() < goalProbability;
    }

    function handleFoul(player1, player2) {
        const team1Name = team1.teamName;
        const team2Name = team2.teamName;
        const player1Key = `${player1.name}-${team1Name}`;
        const player2Key = `${player2.name}-${team2Name}`;

        if (!yellowCards[player1Key]) yellowCards[player1Key] = 0;
        if (!yellowCards[player2Key]) yellowCards[player2Key] = 0;

        const foulPlayer = Math.random() < 0.5 ? player1 : player2;
        const foulTeam = foulPlayer === player1 ? team1Name : team2Name;
        const foulPlayerKey = foulPlayer === player1 ? player1Key : player2Key;

        yellowCards[foulPlayerKey]++;
        if (yellowCards[foulPlayerKey] === 2) {
            redCards[foulPlayerKey] = true;
            addCommentary(`<b>${getRandomPhrase('redCard', { player: foulPlayer.name, team: foulTeam })}</b>`);
            addGoalScorer(foulPlayer, '🟨🟨');
        } else {
            addCommentary(getRandomPhrase('yellowCard', { player: foulPlayer.name, team: foulTeam }));
        }
    }

    function handleSubstitution(team, playerOut, playerIn) {
        substitutions[team]++;
        addCommentary(getRandomPhrase('substitution', { playerOut: playerOut.name, playerIn: playerIn.name, team: teams[team].teamName }));
    }

    function getRandomPlayer(team, onPitch = true, notOnPitch = false) {
        const players = teams[team].players;
        const eligiblePlayers = players.filter((player, index) => {
            const isOnPitch = index < 11;
            if (onPitch && isOnPitch) return true;
            if (notOnPitch && !isOnPitch) return true;
            return false;
        });
        return eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
    }

    function updateScoreboard() {
        scoreboard.textContent = `${score.team1} - ${score.team2}`;
        scoreboard.classList.add('flash');
        setTimeout(() => scoreboard.classList.remove('flash'), 1000);
    }

    function addGoalScorer(player, card = '') {
        const p = document.createElement('p');
        p.textContent = `${player.name} (${player.nickname}) - ${player.position} ${card}`;
        goalScorers.appendChild(p);
    }

    function addCommentary(text) {
        const p = document.createElement('p');
        p.innerHTML = text;
        ticker.appendChild(p);
        ticker.scrollTop = ticker.scrollHeight;
    }

    function formatTime(minutes) {
        const min = Math.floor(minutes);
        const sec = Math.floor((minutes - min) * 60);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    function resetBallPosition() {
        ballPosition = { x: 2, y: 2 }; // Reset to middle
        ballPossession = Math.random() < 0.5 ? 'team1' : 'team2'; // Coin toss for possession
    }
});