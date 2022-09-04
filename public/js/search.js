function createResultListItem(value) {
    let item = document.createElement('li');

    item.innerHTML = value;
    item.addEventListener('click', (e) => {
        // Fill the selected value in the search bar
        document.getElementById('countrySearch').value = value;
        // Focus on input element
        document.getElementById('countrySearch').focus();
        // Hide the suggestions from display
        document.getElementById('searchResults').classList.remove('show');
    });

    return item;
}

function renderResults(results) {
    let searchResults = document.getElementById('searchResults');
    if (results.length > 0) {
        searchResults.innerHTML = '<ul></ul>';
        let resultList = document.querySelector('#searchResults ul');
        results.forEach((country) => {
            resultList.appendChild(createResultListItem(country));
        });
        searchResults.classList.add('show');
    } else {
        searchResults.classList.remove('show');
    }
}

function configureSearchBar() {
    let timeout = null;

    let searchBar = document.getElementById('countrySearch');

    /* Event Listeners */

    // Find suggestions as user enters text and waits in between
    searchBar.addEventListener('keyup', function (e) {
        if (timeout) {
            clearTimeout(timeout);
        }

        let searchPattern = this.value;

        const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${searchPattern}&sort=-population&types=CITY`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'b5cad883efmsh93047b9ac425c49p1dfb7djsne72b1eacfd2d',
                'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
            }
        };

        if (searchPattern.length) {
            timeout = setTimeout(async ()=> {
                /* Search for the entered string */
                let response = await fetch(url, options);
                let results = await response.json();
                
                results = results.data.map((obj) => { // Transform the array of city objects to array of city names
                    return obj.name;
                });

                results = [...new Set(results)]; // Give only unique cities

                /* Render the retrieved results as suggestions */
                renderResults(results);

            }, 1000*0.250);
        }
    });

    // Hide the suggestions when user clicks out of the search bar
    searchBar.addEventListener('focusout', (e) => {
        setTimeout(() => {
            document.getElementById('searchResults').classList.remove('show');
        }, 1000*0.1); 
        // Hack: Do not hide the suggestions immediately as the browser needs some time process if one of the suggestions is chosen
    });
}

/* Run the configuration code */
window.onload = () => {
    configureSearchBar();
}
