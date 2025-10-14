# Dice of Dionysus - Modern Edition

An elegant dice strategy game of pips, favour, and devotion - now with modern game development practices and optimizations.

## 🚀 What's New

This modernized version of Dice of Dionysus includes:

### 🏗️ **Modern Architecture**
- **ES6+ Modules**: Clean, modular code structure
- **Centralized State Management**: Redux-like state management with immutable updates
- **Event-Driven Architecture**: Decoupled systems with comprehensive event handling
- **Performance Optimizations**: Object pooling, lazy loading, and efficient rendering

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **CSS Grid & Flexbox**: Modern layout systems
- **CSS Custom Properties**: Consistent theming and easy customization
- **Smooth Animations**: Hardware-accelerated transitions and effects

### 🔧 **Developer Experience**
- **Modern Build System**: Vite for fast development and optimized builds
- **TypeScript Support**: Type safety and better IDE experience
- **Comprehensive Testing**: Unit tests and integration tests
- **ESLint Configuration**: Code quality and consistency

### ♿ **Accessibility**
- **Screen Reader Support**: Full ARIA labels and semantic HTML
- **Keyboard Navigation**: Complete keyboard-only gameplay
- **High Contrast Mode**: Better visibility for users with visual impairments
- **Reduced Motion**: Respects user preferences for motion sensitivity

### 📱 **Progressive Web App**
- **Offline Support**: Play without internet connection
- **App Installation**: Install as a native app on any device
- **Service Workers**: Background sync and caching
- **Push Notifications**: Stay engaged with game updates

### 📊 **Analytics & Telemetry**
- **Player Insights**: Understand how players interact with the game
- **Balance Analytics**: Data-driven game balancing
- **Performance Monitoring**: Track frame rates and memory usage
- **Error Tracking**: Comprehensive error reporting and debugging

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd dice-of-dionysus

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with UI
npm run test:ui
```

### Development Commands
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 🎮 Game Features

### Core Gameplay
- **Dice Rolling**: Roll up to 3 times per turn
- **Dice Holding**: Hold dice between rolls
- **Scoring Categories**: Upper and lower section scoring
- **Worship System**: Gain favor with Greek gods
- **Card System**: Boons, Worship cards, Libations, and Artifacts

### Modern Features
- **Responsive Design**: Play on any device
- **Offline Support**: Continue playing without internet
- **Save System**: Automatic and manual saves
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Optimized for smooth gameplay

## 🏗️ Architecture

### Core Systems
```
js/
├── core/                    # Core game systems
│   ├── GameState.js        # State management
│   ├── EventSystem.js      # Event handling
│   ├── PerformanceManager.js # Performance optimization
│   └── ModernGameEngine.js # Main game engine
├── classes/                # Game object classes
│   ├── Die.js             # Dice implementation
│   ├── Card.js            # Base card class
│   ├── Joker.js           # Boon cards
│   └── WorshipCard.js     # Worship cards
├── accessibility/         # Accessibility features
│   └── AccessibilityManager.js
├── analytics/             # Analytics and telemetry
│   └── AnalyticsManager.js
├── pwa/                   # Progressive Web App
│   ├── ServiceWorker.js   # Service worker
│   └── PWAManager.js      # PWA management
└── tests/                 # Test suite
    └── GameEngine.test.js # Game engine tests
```

### State Management
The game uses a centralized state management system with:
- **Immutable Updates**: State changes are always immutable
- **Event-Driven**: State changes trigger events
- **History Tracking**: Undo/redo functionality
- **Persistence**: Automatic save/load

### Event System
Comprehensive event system with:
- **Type Safety**: Strongly typed events
- **Priority System**: Event execution order
- **Async Support**: Asynchronous event handling
- **History Tracking**: Event audit trail

## 🎨 Styling

### CSS Architecture
- **CSS Custom Properties**: Consistent theming
- **CSS Grid**: Modern layout system
- **Flexbox**: Flexible component layouts
- **Responsive Design**: Mobile-first approach

### Themes
- **Default Theme**: Classic Greek mythology aesthetic
- **High Contrast**: Better visibility for accessibility
- **Color Blind Support**: Multiple color blind accommodations
- **Reduced Motion**: Respects user preferences

## ♿ Accessibility

### Features
- **Screen Reader Support**: Full ARIA labels and semantic HTML
- **Keyboard Navigation**: Complete keyboard-only gameplay
- **High Contrast Mode**: Better visibility
- **Reduced Motion**: Respects user preferences
- **Color Blind Support**: Multiple accommodations

### Keyboard Shortcuts
- `R` - Roll dice
- `1-5` - Hold/release dice
- `Esc` - Go back/close modal
- `C` - Open collection
- `S` - Save game
- `A` - Accessibility menu
- `H` - Show help

## 📱 Progressive Web App

### Features
- **Offline Support**: Play without internet
- **App Installation**: Install as native app
- **Background Sync**: Sync game data when online
- **Push Notifications**: Stay engaged

### Installation
1. Open the game in a modern browser
2. Look for the install button or browser prompt
3. Click "Install" to add to home screen
4. Launch like a native app

## 📊 Analytics

### Data Collected
- **Gameplay Metrics**: Scores, turns, categories used
- **Performance Data**: Frame rates, memory usage
- **User Behavior**: Clicks, navigation patterns
- **Error Tracking**: Crashes and exceptions

### Privacy
- **Opt-in Analytics**: Users can disable tracking
- **Local Storage**: Data stored locally by default
- **No Personal Data**: No personally identifiable information
- **Transparent**: Clear about what data is collected

## 🧪 Testing

### Test Suite
- **Unit Tests**: Individual component testing
- **Integration Tests**: System interaction testing
- **E2E Tests**: Full game flow testing
- **Performance Tests**: Load and stress testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test file
npm test GameEngine.test.js

# Run tests in watch mode
npm run test:watch
```

## 🚀 Performance

### Optimizations
- **Object Pooling**: Reuse objects to reduce garbage collection
- **Lazy Loading**: Load resources only when needed
- **Event Delegation**: Efficient event handling
- **Virtual Scrolling**: Handle large lists efficiently
- **Debouncing/Throttling**: Optimize frequent operations

### Monitoring
- **Frame Rate**: Real-time FPS monitoring
- **Memory Usage**: Track memory consumption
- **Render Time**: Measure rendering performance
- **Load Time**: Track initial load performance

## 🔧 Configuration

### Environment Variables
```bash
# Analytics endpoint
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com

# Debug mode
VITE_DEBUG=true

# API endpoint
VITE_API_ENDPOINT=https://api.example.com
```

### Build Configuration
The game uses Vite for building with:
- **ES6+ Support**: Modern JavaScript features
- **CSS Processing**: PostCSS with autoprefixer
- **Asset Optimization**: Image and font optimization
- **Code Splitting**: Automatic code splitting
- **Tree Shaking**: Remove unused code

## 📦 Deployment

### Static Hosting
```bash
# Build for production
npm run build

# Deploy to static hosting
# Files are in the 'dist' directory
```

### Docker
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CDN
- **Asset Optimization**: Compressed and optimized assets
- **Caching**: Proper cache headers
- **HTTPS**: Secure connections required for PWA

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

### Code Style
- **ESLint**: Follow the configured rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Use types where possible
- **Comments**: Document complex logic

## 📄 License

This project is licensed under the UNLICENSED license. See the LICENSE file for details.

## 🙏 Acknowledgments

- **Balatro**: Inspiration for card mechanics and timing
- **Hades**: Greek mythology and art direction
- **Modern Web Standards**: For accessibility and performance
- **Open Source Community**: For tools and libraries

## 📞 Support

For questions, issues, or contributions:
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: DiceofDionysus@gmail.com

---

**Dice of Dionysus** - Where strategy meets mythology in a modern, accessible gaming experience.

