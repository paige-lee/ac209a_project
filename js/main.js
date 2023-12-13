function fetchData() {
    d3.csv('2018_2020_food_insecurity.csv')
        .then(data => processData(data))
        .catch(error => console.error('Error fetching the CSV file:', error));
}

function processData(csvData) {
    // Create a Leaflet map centered around an initial location
    const map = L.map('map').setView([0, 0], 2);

    // Add a tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize the selected column
    let selectedColumn = 'avg_diet_energy_pct';

    // Helper function to create a rectangle and remove it after a delay
    const addTempRectangle = () => {
        const rectangle = L.rectangle(map.getBounds(), { color: 'DarkMagenta', opacity: 1 }).addTo(map);
        setTimeout(() => map.removeLayer(rectangle), 500); // Adjust the delay (in milliseconds) as needed
    };

    // Parse the CSV data
    csvData.forEach(d => {
        // Extract latitude and longitude using regex
        const coords = d.capital_coordinates.match(/\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)/);

        // Check if coordinates are matched and extract latitude and longitude
        if (coords && coords.length >= 5) {
            const latitude = parseFloat(coords[1]);
            const longitude = parseFloat(coords[3]);

            // Plot the coordinates on the map as a blue circle marker
            const marker = L.circleMarker([latitude, longitude], { color: 'Coral', radius: 5 }).addTo(map);

            // Handle mouseover and mouseout events to show/hide the tooltip
            marker.on('mouseover', function () {
                // Check if the selected column value is available
                const columnValue = d[selectedColumn] || 'NA';

                // Set the tooltip content with line breaks
                this.bindTooltip(`${d.area} <br> ${columnValue}`).openTooltip();
            });

            marker.on('mouseout', function () {
                this.closeTooltip();
            });
        }
    });

    // Add an event listener to update the selected column when the dropdown changes
    document.getElementById('columnSelector').addEventListener('change', function () {
        selectedColumn = this.value;
        addTempRectangle();
        // Update tooltip content based on the selected column
        map.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                const countryData = csvData.find(d => d.capital_coordinates === `(${layer._latlng.lat},${layer._latlng.lng})`);
                if (countryData) {
                    // Check if the selected column value is available
                    const columnValue = countryData[selectedColumn] || 'NA';
                    layer.setTooltipContent(`${countryData.area} <br> ${columnValue}`).openTooltip();



                }
            }
        });
    });
}

// Call the fetchData function when the script is loaded
fetchData();
