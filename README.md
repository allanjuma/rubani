# Rubani Game

A 3D web-based game where players collect $RUBS tokens and win NFT prizes. Built with Three.js, Angular, and blockchain integration.

## Overview

Rubani is an interactive 3D game that combines gaming mechanics with cryptocurrency features. Players can:
- Collect $RUBS tokens
- Win NFT prizes by collecting 100 $RUBS
- Interact with various 3D vehicles (drones, airplanes, cars)
- Connect their cryptocurrency wallets
- Earn and spend $RUBS while playing

## Technologies Used

- Three.js (3D graphics)
- Angular (Frontend framework)
- GSAP (Animations)
- Blockchain Integration (TON and HBAR)
- Bitsoko Services

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A modern web browser
- A cryptocurrency wallet (for blockchain features)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/games/rubani.git
cd rubani
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
BITSOKO_API_KEY=your_api_key
```

## Running the Game

1. Start the development server:
```bash
npm start
# or
yarn start
```

2. Open your browser and navigate to:
```
http://localhost:4200
```

## Development

- The game's main components are in the `src` directory
- 3D models and assets are loaded from external sources
- Blockchain integration is handled through Bitsoko's services

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

- **Allan** - Initial work

## Acknowledgments

- Sound effects from [zapsplat.com](https://www.zapsplat.com) and [freesound.org](https://freesound.org)
- Three.js community for 3D graphics support
- Bitsoko for blockchain integration services
