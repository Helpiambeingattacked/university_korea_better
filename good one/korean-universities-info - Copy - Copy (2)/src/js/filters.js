function filterByType(universities, type) {
    return universities.filter(university => university.type === type);
}

function filterByRegion(universities, region) {
    return universities.filter(university => university.region === region);
}

function filterBySearchTerm(universities, searchTerm) {
    return universities.filter(university => 
        university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

function applyFilters(universities, type, region, searchTerm) {
    let filteredUniversities = universities;

    if (type) {
        filteredUniversities = filterByType(filteredUniversities, type);
    }

    if (region) {
        filteredUniversities = filterByRegion(filteredUniversities, region);
    }

    if (searchTerm) {
        filteredUniversities = filterBySearchTerm(filteredUniversities, searchTerm);
    }

    return filteredUniversities;
}

export { filterByType, filterByRegion, filterBySearchTerm, applyFilters };