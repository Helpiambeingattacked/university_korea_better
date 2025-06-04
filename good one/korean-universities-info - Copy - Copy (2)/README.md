# Korean Universities Information Website

## Project Overview
This project is a fully static, responsive, and interactive front-end website that provides structured information about universities in South Korea. The website categorizes universities by region, type (national/private), and specialty, allowing users to explore top institutions across the country.

## Technology Stack
- **HTML5**: Structure of the website
- **CSS3**: Styling using Flexbox and Grid
- **JavaScript (ES6+)**: Interactivity and dynamic content rendering
- **Google Fonts**: Typography
- **Font Awesome**: Icons
- **Static Data**: Managed using a JavaScript array or JSON

## Features
- **Dynamic Content Rendering**: University cards are generated dynamically from a static JSON file.
- **Interactive Filtering**: Users can filter universities by region and type.
- **Search Functionality**: A search bar allows filtering by university name or location.
- **Modal View**: Detailed information about a university is displayed in a modal when a card is clicked.
- **Responsive Design**: The layout adapts to different screen sizes, ensuring a good user experience on mobile and desktop devices.

## File Structure
```
korean-universities-info
├── src
│   ├── assets
│   │   ├── fonts
│   │   ├── icons
│   │   └── images
│   ├── css
│   │   └── styles.css
│   ├── data
│   │   └── universities.json
│   ├── js
│   │   ├── app.js
│   │   ├── filters.js
│   │   ├── modal.js
│   │   └── utils.js
│   └── index.html
├── .gitignore
└── README.md
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the `index.html` file in your web browser to view the website.
3. Ensure you have an internet connection to load Google Fonts and Font Awesome icons.

## Enhancements
Future enhancements may include:
- Google Maps integration for campus locations.
- Language toggle feature for English and Korean.
- A contact form with validation.
- A campus video/photo gallery in a lightbox style.
- Deployment on platforms like GitHub Pages or Netlify.

## Contribution
Contributions to improve the project are welcome. Please fork the repository and submit a pull request with your changes.

## License
This project is open-source and available under the MIT License.