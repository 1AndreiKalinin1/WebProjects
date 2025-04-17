import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, onValue, push, set, get, child } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyDUYlP6T_gK9X0_hjb0hrPbbYBwoK39gC8",
    authDomain: "chatapi-d8f77.firebaseapp.com",
    databaseURL: "https://chatapi-d8f77-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "chatapi-d8f77",
    storageBucket: "chatapi-d8f77.firebasestorage.app",
    messagingSenderId: "365523003225",
    appId: "1:365523003225:web:f5834821cbefaf66ff4e48"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Constants
const OWNER_NAME = "Иван Иванов";

// DOM elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const clientName = document.querySelector('.client-name');

// Initialize chat
function initializeChat() {
    console.log('Initializing chat...');
    
    // Load all messages from the chat
    const messagesRef = ref(database, 'messages');
    onValue(messagesRef, (snapshot) => {
        console.log('Received messages:', snapshot.val());
        messagesContainer.innerHTML = '';
        const messages = snapshot.val() || {};
        
        // Convert messages object to array and sort by timestamp
        const messagesArray = Object.entries(messages)
            .map(([id, message]) => ({ id, ...message }))
            .sort((a, b) => a.timestamp - b.timestamp);
        
        messagesArray.forEach(message => {
            const messageElement = createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    // Set up message sending
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Test message to verify chat is working
    console.log('Chat initialized successfully');
}

// Create message element
function createMessageElement(message) {
    console.log('Creating message element:', message);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.user === OWNER_NAME ? 'owner' : 'client'}`;
    
    const senderName = document.createElement('div');
    senderName.className = 'sender-name';
    senderName.textContent = message.user;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = message.message;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date(message.timestamp).toLocaleTimeString();
    
    messageDiv.appendChild(senderName);
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    return messageDiv;
}

// Send message
function sendMessage() {
    if (!messageInput.value.trim()) return;

    const message = {
        user: OWNER_NAME,
        message: messageInput.value.trim(),
        timestamp: Date.now()
    };

    console.log('Sending message:', message);

    const messagesRef = ref(database, 'messages');
    const newMessageRef = push(messagesRef);
    set(newMessageRef, message)
        .then(() => {
            console.log('Message sent successfully');
            messageInput.value = '';
        })
        .catch((error) => {
            console.error('Error sending message:', error);
        });
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeChat); 