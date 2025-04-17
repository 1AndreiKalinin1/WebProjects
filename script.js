document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const messagesDiv = document.getElementById('messages');

    // Получение сообщений при загрузке страницы
    fetchMessages();

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value;

        // Отправка сообщения
        sendMessage(message);
        messageInput.value = '';
    });

    function sendMessage(message) {
        fetch('http://YOUR_SERVER_URL/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        })
        .then(response => response.json())
        .then(data => {
            displayMessage(data.message);
        })
        .catch((error) => {
            console.error('Ошибка:', error);
        });
    }

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Прокрутка вниз
    }

    function fetchMessages() {
        fetch('http://YOUR_SERVER_URL/api/messages')
            .then(response => response.json())
            .then(data => {
                data.forEach(displayMessage);
            })
            .catch((error) => {
                console.error('Ошибка:', error);
            });
    }
});