// script.js

document.addEventListener('DOMContentLoaded', () => {
    const field = document.getElementById('field');
    const ball = document.createElement('div');
    ball.id = 'ball';
    field.appendChild(ball);

    const scoreBoard = document.getElementById('scoreboard');
    let score = { team1: 0, team2: 0 };

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
            playerDiv.dataset.name = player.name;
            playerDiv.title = `${player.name} (${player.position})`;
            field.appendChild(playerDiv);

            // Add click event to shoot the ball
            playerDiv.addEventListener('click', () => shootBall(playerDiv));
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

    // Function to shoot the ball towards the goal
    function shootBall(playerDiv) {
        const ballX = parseFloat(ball.style.left);
        const ballY = parseFloat(ball.style.top);
        const playerX = parseFloat(playerDiv.style.left);
        const playerY = parseFloat(playerDiv.style.top);

        const deltaX = playerX - ballX;
        const deltaY = playerY - ballY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = 5; // Adjust speed as needed
        const steps = distance / speed;
        let step = 0;

        function move() {
            if (step < steps) {
                ball.style.left = `${ballX + (deltaX / steps) * step}px`;
                ball.style.top = `${ballY + (deltaY / steps) * step}px`;
                step++;
                requestAnimationFrame(move);
            } else {
                ball.style.left = `${playerX}px`;
                ball.style.top = `${playerY}px`;
                checkGoal(playerX, playerY);
            }
        }

        move();
    }

    // Function to check if a goal is scored
    function checkGoal(x, y) {
        const goalX = 580; // Example goal position
        const goalY = 200; // Example goal position
        const goalWidth = 20;
        const goalHeight = 100;

        if (x >= goalX && x <= goalX + goalWidth && y >= goalY && y <= goalY + goalHeight) {
            score.team1++; // Update score for team 1
            updateScoreboard();
        }
    }

    // Function to update the scoreboard
    function updateScoreboard() {
        scoreBoard.textContent = `Team 1: ${score.team1} - Team 2: ${score.team2}`;
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