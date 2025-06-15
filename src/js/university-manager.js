// University Data Management
export class UniversityManager {
    constructor() {
        this.universities = [];
        this.originalData = [];
    }

    setUniversities(data) {
        this.originalData = data;
        this.universities = this.processUniversityData(data);
    }

    getUniversities() {
        return this.universities;
    }

    getUniversityByName(name) {
        return this.universities.find(uni => uni.name === name);
    }

    processUniversityData(data) {
        return data.map(university => {
            // Ensure all universities have required fields
            return {
                name: university.name || 'Unknown University',
                type: university.type || 'Private',
                region: university.region || 'Seoul',
                description: this.processDescription(university.description),
                image: university.image || null,
                website: university.website || null,
                ...university // Spread any additional properties
            };
        });
    }

    processDescription(description) {
        if (!description) {
            return null;
        }

        // Check if description is a Google search link
        if (description.includes('google.com/search')) {
            return null; // Will use default description
        }

        return description;
    }

    getRegions() {
        const regions = [...new Set(this.universities.map(uni => uni.region))];
        return regions.sort();
    }

    getTypes() {
        const types = [...new Set(this.universities.map(uni => uni.type))];
        return types.sort();
    }

    getStatistics() {
        const stats = {
            total: this.universities.length,
            byRegion: {},
            byType: {},
            withWebsites: this.universities.filter(uni => uni.website).length,
            withLogos: this.universities.filter(uni => uni.image && !uni.image.includes('google.com')).length
        };

        // Group by region
        this.universities.forEach(uni => {
            stats.byRegion[uni.region] = (stats.byRegion[uni.region] || 0) + 1;
        });

        // Group by type
        this.universities.forEach(uni => {
            stats.byType[uni.type] = (stats.byType[uni.type] || 0) + 1;
        });

        return stats;
    }

    searchUniversities(query) {
        if (!query) return this.universities;

        const lowercaseQuery = query.toLowerCase();
        return this.universities.filter(university => {
            const searchableText = [
                university.name,
                university.region,
                university.type,
                university.description
            ].join(' ').toLowerCase();

            return searchableText.includes(lowercaseQuery);
        });
    }

    filterUniversities(filters) {
        return this.universities.filter(university => {
            const matchesRegion = !filters.region || 
                                 filters.region === 'all' || 
                                 university.region === filters.region;

            const matchesType = !filters.type || 
                               filters.type === 'all' || 
                               university.type === filters.type;

            return matchesRegion && matchesType;
        });
    }

    sortUniversities(universities, sortBy = 'name-asc') {
        return [...universities].sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'region-asc':
                    return a.region.localeCompare(b.region);
                case 'region-desc':
                    return b.region.localeCompare(a.region);
                case 'type-asc':
                    return a.type.localeCompare(b.type);
                case 'type-desc':
                    return b.type.localeCompare(a.type);
                default:
                    return 0;
            }
        });
    }

    addUniversity(university) {
        const processedUniversity = this.processUniversityData([university])[0];
        this.universities.push(processedUniversity);
        this.originalData.push(university);
        return processedUniversity;
    }

    updateUniversity(name, updates) {
        const index = this.universities.findIndex(uni => uni.name === name);
        if (index !== -1) {
            this.universities[index] = { ...this.universities[index], ...updates };
            
            // Update original data as well
            const originalIndex = this.originalData.findIndex(uni => uni.name === name);
            if (originalIndex !== -1) {
                this.originalData[originalIndex] = { ...this.originalData[originalIndex], ...updates };
            }
            
            return this.universities[index];
        }
        return null;
    }

    removeUniversity(name) {
        const index = this.universities.findIndex(uni => uni.name === name);
        if (index !== -1) {
            const removed = this.universities.splice(index, 1)[0];
            
            // Remove from original data as well
            const originalIndex = this.originalData.findIndex(uni => uni.name === name);
            if (originalIndex !== -1) {
                this.originalData.splice(originalIndex, 1);
            }
            
            return removed;
        }
        return null;
    }

    exportData() {
        return {
            universities: this.originalData,
            exportDate: new Date().toISOString(),
            totalCount: this.universities.length
        };
    }

    importData(data) {
        if (data.universities && Array.isArray(data.universities)) {
            this.setUniversities(data.universities);
            return true;
        }
        return false;
    }

    validateUniversity(university) {
        const errors = [];

        if (!university.name || university.name.trim() === '') {
            errors.push('University name is required');
        }

        if (!university.region || university.region.trim() === '') {
            errors.push('Region is required');
        }

        if (!university.type || university.type.trim() === '') {
            errors.push('Type is required');
        }

        if (university.website && !this.isValidUrl(university.website)) {
            errors.push('Website must be a valid URL');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    getRecommendations(universityName, limit = 3) {
        const university = this.getUniversityByName(universityName);
        if (!university) return [];

        // Find similar universities based on region and type
        const recommendations = this.universities
            .filter(uni => 
                uni.name !== universityName && 
                (uni.region === university.region || uni.type === university.type)
            )
            .slice(0, limit);

        return recommendations;
    }

    getDuplicates() {
        const seen = new Set();
        const duplicates = [];

        this.universities.forEach(university => {
            const key = university.name.toLowerCase().trim();
            if (seen.has(key)) {
                duplicates.push(university);
            } else {
                seen.add(key);
            }
        });

        return duplicates;
    }

    cleanData() {
        // Remove duplicates
        const uniqueUniversities = [];
        const seen = new Set();

        this.universities.forEach(university => {
            const key = university.name.toLowerCase().trim();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueUniversities.push(university);
            }
        });

        this.universities = uniqueUniversities;

        // Update original data
        this.originalData = this.universities.map(uni => ({ ...uni }));

        return {
            cleaned: true,
            originalCount: this.universities.length + (this.universities.length - uniqueUniversities.length),
            newCount: uniqueUniversities.length,
            duplicatesRemoved: this.universities.length - uniqueUniversities.length
        };
    }
}