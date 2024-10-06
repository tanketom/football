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

    // Load all team data from the JSON folder
    fetchTeams();

    function fetchTeams() {
        fetch('JSON/')
            .then(response => response.json())
            .then(files => {
                files.forEach(file => {
                    fetch(`JSON/${file}`)
                        .then(response => response.json())
                        .then(data => {
                            teams[data.teamName] = data;
                            populateTeamSelect(team1Select, data.teamName);
                            populateTeamSelect(team2Select, data.teamName);
                        });
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
        addCommentary(getRandomPhrase('start', { team1: team1.teamName, team2: team2.teamName }));
        gameInterval = setInterval(simulateMinute, 1000);
    }

    function resetGame() {
        gameTime = 0;
        score = { team1: 0, team2: 0 };
        substitutions = { team1: 0, team2: 0 };
        yellowCards = {};
        redCards = {};
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
        if (event < 0.1) {
            // Goal event
            const scoringTeam = Math.random() < 0.5 ? 'team1' : 'team2';
            const scorer = getRandomPlayer(scoringTeam);
            score[scoringTeam]++;
            updateScoreboard();
            addGoalScorer(scorer);
            addCommentary(`<b>${getRandomPhrase('goal', { player: scorer.name, team: teams[scoringTeam].teamName, score: `${score.team1} - ${score.team2}` })}</b>`);
        } else if (event < 0.2) {
            // Foul event
            const player1 = getRandomPlayer('team1');
            const player2 = getRandomPlayer('team2');
            handleFoul(player1, player2);
        } else if (event < 0.3) {
            // Substitution event
            const team = Math.random() < 0.5 ? 'team1' : 'team2';
            if (substitutions[team] < 3) {
                const playerOut = getRandomPlayer(team, true);
                const playerIn = getRandomPlayer(team, false, true);
                handleSubstitution(team, playerOut, playerIn);
            }
        } else if (event < 0.5) {
            // Regular game event
            const player1 = getRandomPlayer('team1');
            const player2 = getRandomPlayer('team2');
            addCommentary(getRandomPhrase('pass', { player1: player1.name, player2: player2.nickname, team1: team1.teamName }));
        } else if (event < 0.7) {
            // Tackle event
            const player1 = getRandomPlayer('team1');
            const player2 = getRandomPlayer('team2');
            addCommentary(getRandomPhrase('tackle', { player1: player1.name, player2: player2.nickname, team1: team1.teamName }));
        } else {
            // General event
            addCommentary(getRandomPhrase('general', {}));
        }
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
});