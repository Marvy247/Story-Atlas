# Story Graph Studio

**Interactive IP Relationship & Lineage Visualizer for Story Protocol**

Story Graph Studio is an open-source developer tool that visualizes the relationships between IP assets on Story Protocol as an interactive, force-directed graph. Built for the Surreal World Assets Buildathon OSS/Dev Tooling track.

![Story Graph Studio](https://img.shields.io/badge/Story%20Protocol-IP%20Explorer-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

### Core Visualization
- **Interactive Force-Directed Graph**: D3-powered visualization showing IP assets and their derivative relationships
- **Real-time Data**: Fetches live data from Story Protocol mainnet
- **Node Details Panel**: Click any IP to see full metadata, licensing terms, revenue, and relationships
- **Smart Highlighting**: Hover to highlight connected nodes and trace derivative chains
- **Responsive Design**: Works on desktop and mobile devices

### Data Explorer
- **Search & Filter**: Find IPs by name, creator, or address
- **Advanced Filters**: Filter by license type, media type, date range, and revenue
- **Analytics Dashboard**: View ecosystem metrics and trending IPs
- **License Color Coding**: Visual distinction between different license types

### Developer Tools
- **Export Graph Data**: Download graph as JSON for analysis
- **GraphQL API Ready**: Extendable API structure
- **TypeScript Support**: Fully typed for better DX
- **SWR Data Fetching**: Optimized caching and revalidation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Story Protocol API key (optional, uses mock data by default)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/story-graph-studio.git
cd story-graph-studio

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the graph!

### Environment Variables

```bash
# Story Protocol Configuration
NEXT_PUBLIC_STORY_API_URL=https://api.story.foundation/api/v1
NEXT_PUBLIC_STORY_API_KEY=your_api_key_here
NEXT_PUBLIC_RPC_URL=https://odyssey.storyrpc.io

# Development Mode (uses mock data)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Wallet Connect
NEXT_PUBLIC_PROJECT_ID=your_project_id
```

## 📚 Project Structure

```
story-graph-studio/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── graph/       # Graph visualization components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/
│   │   ├── story-protocol/  # Story SDK integration
│   │   ├── graph/           # Graph building logic
│   │   └── hooks/           # Custom React hooks
│   └── stores/          # Zustand state management
├── config/              # Configuration files
└── public/              # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Visualization**: react-force-graph-2d + D3.js
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Web3**: Wagmi + Viem
- **Story SDK**: @story-protocol/core-sdk

## 🎨 Graph Visualization

### Node Colors (License Types)
- 🟢 **Green**: Commercial Remix (commercial use + derivatives allowed)
- 🔵 **Blue**: Commercial Only
- 🟠 **Orange**: Non-Commercial Remix
- 🟣 **Purple**: Attribution Only
- ⚪ **Gray**: No License Set

### Node Sizes
- Larger nodes = More derivatives created
- Calculated using `log(derivative_count + 1)`

### Edge Types
- **Arrows**: Show parent → child derivative relationships
- **Thickness**: Indicates royalty percentage share

## 📊 Analytics Features

- Total IP Assets count
- Total Derivatives created
- Most Remixed IPs (top 10)
- License Type Distribution
- Media Type Distribution
- Revenue Statistics
- Isolated Nodes Detection

## 🔧 Development

### Mock Data Mode
For development without Story Protocol API access:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true npm run dev
```

Generates 100 realistic IP assets with derivative relationships.

### Building for Production

```bash
npm run build
npm run start
```

### Linting & Type Checking

```bash
npm run lint
npx tsc --noEmit
```

## 🌟 Roadmap

- [ ] Time-travel feature (view graph evolution over time)
- [ ] 3D graph visualization mode
- [ ] Embed widget for external sites
- [ ] GraphQL API endpoint
- [ ] Webhook notifications for new derivatives
- [ ] Community clustering algorithm
- [ ] Predicted licensing opportunities
- [ ] SVG/PNG export with watermarks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Buildathon Submission

**Track**: OSS / Dev Tooling  
**Hackathon**: Surreal World Assets Buildathon  
**Team**: [Your Team Name]  
**Demo**: [Live Demo URL]  
**Video**: [Demo Video URL]

### Why Story Graph Studio Wins

1. **Fills Critical Gap**: No existing tool visualizes Story Protocol IP relationships
2. **Developer Focused**: Built by developers, for developers
3. **Open Source**: MIT licensed, community-driven
4. **Production Ready**: Fully functional with real Story Protocol integration
5. **Visually Stunning**: Beautiful, interactive UI that "wows" judges
6. **Technically Impressive**: Complex graph algorithms + real-time data
7. **Ecosystem Value**: Benefits entire Story Protocol community

## 📧 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)
- **Email**: your.email@example.com

## 🙏 Acknowledgments

- Story Protocol team for the amazing IP infrastructure
- Surreal World Assets Buildathon organizers
- shadcn for the beautiful UI components
- D3.js and react-force-graph communities

---

**Built with ❤️ for the Story Protocol ecosystem**
