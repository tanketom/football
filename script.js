// script.js

document.addEventListener('DOMContentLoaded', () => {
    const field = document.getElementById('field');
    const ball = document.createElement('div');
    ball.id = 'ball';
    field.appendChild(ball);

    // Function to fetch team data from JSON files
    async function fetchTeamData(teamFile) {
        const response = await fetch(`JSON/${teamFile}`);
        const teamData = await response.json();
        return teamData;
    }

    // Function to place players on the field
    function placePlayers(team) {
        team.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player';
            playerDiv.style.backgroundColor = team.primaryColor;
            playerDiv.style.left = `${Math.random() * 580}px`;
            playerDiv.style.top = `${Math.random() * 380}px`;
            playerDiv.dataset.velocityX = (Math.random() - 0.5) * 2; // Random velocity
            playerDiv.dataset.velocityY = (Math.random() - 0.5) * 2; // Random velocity
            playerDiv.title = `${player.name} (${player.position})`;
            field.appendChild(playerDiv);
        });
    }

    // Function to move the ball to a random position
    function moveBall() {
        ball.style.left = `${Math.random() * 585}px`;
        ball.style.top = `${Math.random() * 385}px`;
    }

    // Function to update player positions
    function updatePlayerPositions() {
        const players = document.querySelectorAll('.player');
        players.forEach(player => {
            let x = parseFloat(player.style.left);
            let y = parseFloat(player.style.top);
            let velocityX = parseFloat(player.dataset.velocityX);
            let velocityY = parseFloat(player.dataset.velocityY);

            x += velocityX;
            y += velocityY;

            // Bounce off the walls
            if (x < 0 || x > 580) velocityX *= -1;
            if (y < 0 || y > 380) velocityY *= -1;

            player.style.left = `${x}px`;
            player.style.top = `${y}px`;
            player.dataset.velocityX = velocityX;
            player.dataset.velocityY = velocityY;
        });

        requestAnimationFrame(updatePlayerPositions);
    }

    // Load and place players for both teams
    async function loadTeams() {
        const team1 = await fetchTeamData('brackenford_united.json');
        const team2 = await fetchTeamData('elderglen_fc.json');
        placePlayers(team1);
        placePlayers(team2);
    }

    // Start the ball movement and player updates
    setInterval(moveBall, 1000);
    requestAnimationFrame(updatePlayerPositions);

    // Load the teams
    loadTeams();
});