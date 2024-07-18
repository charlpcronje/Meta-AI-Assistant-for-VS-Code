// media/main.js
// This file contains the client-side JavaScript for the chat history webview

(function() {
    const vscode = acquireVsCodeApi();

    function updateChatList(chats) {
        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = '';

        chats.forEach(chat => {
            const chatElement = document.createElement('div');
            chatElement.className = 'chat-item';
            chatElement.innerHTML = `
                <span class="chat-title">${chat.title}</span>
                <span class="chat-timestamp">${new Date(chat.timestamp).toLocaleString()}</span>
                <button class="open-chat" data-chat-id="${chat.id}">Open</button>
                <button class="delete-chat" data-chat-id="${chat.id}">Delete</button>
            `;
            chatList.appendChild(chatElement);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.open-chat').forEach(button => {
            button.addEventListener('click', (event) => {
                const chatId = event.target.getAttribute('data-chat-id');
                vscode.postMessage({ type: 'openChat', chatId: chatId });
            });
        });

        document.querySelectorAll('.delete-chat').forEach(button => {
            button.addEventListener('click', (event) => {
                const chatId = event.target.getAttribute('data-chat-id');
                vscode.postMessage({ type: 'deleteChat', chatId: chatId });
            });
        });
    }

    // Listen for messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'updateChatList':
                updateChatList(message.chats);
                break;
            case 'refreshChatList':
                vscode.postMessage({ type: 'getChatList' });
                break;
        }
    });

    // Initial request for chat list
    vscode.postMessage({ type: 'getChatList' });
})();