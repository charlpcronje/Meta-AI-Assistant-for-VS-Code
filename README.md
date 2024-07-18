# META AI Assistant for VS Code

META AI Assistant is a powerful VS Code extension that integrates META AI capabilities directly into your development workflow. This extension allows you to leverage the power of META AI for code suggestions, refactoring, and more, all without leaving your favorite IDE.

## Features

- **Start Chat with META AI**: Easily initiate a conversation with META AI about your code.
- **Add to Existing Chat**: Continue your conversation by adding more code or context to an existing chat.
- **Token Count Estimation**: Get real-time estimates of token count for selected text.
- **In-place Code Editing**: Review and apply code changes suggested by META AI directly in your editor.
- **Chat History**: Access your previous conversations with META AI from the sidebar.
- **File Explorer Integration**: Start chats or add to existing chats directly from the file explorer.

## Installation

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "META AI Assistant"
4. Click Install
5. Reload VS Code when prompted

## Configuration

Before using the extension, you need to set up your META AI API key:

1. Open VS Code settings (File > Preferences > Settings)
2. Search for "META AI Assistant"
3. Enter your API key in the "Api Key" field

You can also configure the maximum number of tokens per chunk in the settings.

## Usage

### Starting a New Chat

1. Select the code you want to discuss
2. Right-click and choose "Start Chat with META AI" from the context menu
3. A new chat will open in the editor with your selected code

### Adding to an Existing Chat

1. Select additional code
2. Right-click and choose "Add to Existing META AI Chat"
3. The selected code will be added to your current chat

### Applying Code Changes

1. After receiving suggestions from META AI, click the "Apply META AI Changes" button in the editor title bar
2. Review the changes in the diff view
3. Choose to apply or discard the changes

### Viewing Chat History

1. Click on the META AI Assistant icon in the activity bar
2. Your chat history will be displayed in the sidebar
3. Click on a chat to reopen it

## Roadmap

Here are some features we're considering for future releases:

1. **Automatic code documentation**: Generate code comments and documentation using META AI.
2. **Code optimization suggestions**: Get AI-powered suggestions for optimizing your code.
3. **Language-specific prompts**: Tailored prompts and suggestions based on the programming language you're using.
4. **Integration with version control**: Automatically create commits or branches for META AI suggestions.
5. **Collaborative coding**: Share META AI conversations with team members and collaborate on code improvements.

## Contributing

We welcome contributions to the META AI Assistant for VS Code! If you'd like to contribute, please follow these steps:

1. Fork the repository: https://github.com/charlpcronje/Meta-AI-Assistant-for-VS-Code.git
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with a clear commit message
4. Push your changes to your fork
5. Create a pull request to the main repository

Please ensure that your code follows the existing style and includes appropriate tests and documentation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions about the META AI Assistant for VS Code, please open an issue on our [GitHub repository](https://github.com/charlpcronje/Meta-AI-Assistant-for-VS-Code/issues).

## Acknowledgements

This extension is powered by META AI. Special thanks to the META AI team for providing the API that makes this extension possible.