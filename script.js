document.addEventListener('DOMContentLoaded', () => {
    const teamSelect1 = document.getElementById('team1');
    const teamSelect2 = document.getElementById('team2');
    const teams = [];

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
        fetch('teams/brackenford_united.json')
            .then(response => response.json())
            .then(data => {
                teams.push(data);
                populateTeamSelect(teamSelect1, data);
                populateTeamSelect(teamSelect2, data);
            });

        fetch('teams/elderglen_fc.json')
            .then(response => response.json())
            .then(data => {
                teams.push(data);
                populateTeamSelect(teamSelect1, data);
                populateTeamSelect(teamSelect2, data);
            });
    }

    // Populate team select dropdown
    function populateTeamSelect(selectElement, team) {
        const option = document.createElement('option');
        option.value = team.teamName;
        option.text = team.teamName;
        selectElement.add(option);
    }

    // Display team formation
    function displayTeamFormation(team, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const formation = formations[team.formation];
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
        const selectedTeam = teams.find(team => team.teamName === teamSelect1.value);
        displayTeamFormation(selectedTeam, 'field');
    });

    teamSelect2.addEventListener('change', () => {
        const selectedTeam = teams.find(team => team.teamName === teamSelect2.value);
        displayTeamFormation(selectedTeam, 'field');
    });

    // Load teams on page load
    loadTeams();
});
