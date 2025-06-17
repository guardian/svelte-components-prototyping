# Cursor Snippets Collection

A collection of useful code snippets for the Cursor IDE. These snippets are designed to improve productivity and maintain consistency across projects.

## Installation

1. Clone this repository:
```bash
git clone [your-repo-url] ~/cursor-snippets
```

2. Copy the snippets to your Cursor snippets directory:
```bash
# For macOS
cp ~/cursor-snippets/*.json ~/Library/Application\ Support/Cursor/User/snippets/

# For Windows
# Copy the .json files to: %APPDATA%\Cursor\User\snippets\

# For Linux
# Copy the .json files to: ~/.config/Cursor/User/snippets/
```

## Available Snippets

### JavaScript (`javascript.json`)
- `contains` - Check if a value exists in an array or string
- `sum` - Sum values in an array of objects
- `shuffle` - Shuffle an array in place
- `resizer` - Iframe resizing utility
- `getJson` - Fetch and parse JSON data
- `mergeObjects` - Deep merge objects
- `mustache` - Mustache template renderer
- `mustache-example` - Example usage of mustache templates
- `mq` - Media query mixins

### React (`react.json`)
- `rfc` - Create a React functional component with TypeScript

### Svelte (`svelte.json`)
- [Add your Svelte snippets description here]

### Toolbelt (`toolbelt.json`)
- `toolbelt` - Collection of utility functions including:
  - `getJson` - Fetch and parse JSON data
  - `merge` - Deep merge objects
  - `contains` - Check if a value exists in an array
  - `sort` - Sort arrays with optional ranking
  - `sum` - Sum values in an array
  - `commas` - Format numbers with commas
  - `timeAgo` - Convert timestamps to human-readable time
  - `isoToUnix` - Convert ISO dates to Unix timestamps
  - `autocomplete` - Implement autocomplete functionality
  - `tallyFrequency` - Count frequency of values
  - `tallyFrequencyReversed` - Reversed frequency counting

## Usage

1. Open any file in Cursor
2. Type the snippet prefix (e.g., `toolbelt`, `rfc`, `mustache`)
3. Press Tab or Enter to insert the snippet

## Testing

The repository includes a test file for the mustache template functionality:
```bash
cd ~/cursor-snippets
node test-mustache.js
```

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Add your snippets
4. Update the README.md
5. Submit a pull request

## License

[Add your chosen license here]

## Author

[Your name/team] 