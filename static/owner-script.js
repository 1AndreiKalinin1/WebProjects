// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем существование необходимых элементов
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesDiv = document.getElementById('messages');

    if (!messageInput || !sendButton || !messagesDiv) {
        console.error('Не найдены необходимые элементы DOM');
        return;
    }

    // Инициализация Pusher
    const pusher = new Pusher('NZEdl04669f636mMy9XCkax3S_t20_0GToZQXd4Mj5Q', {
        cluster: 'eu',
        forceTLS: true
    });

    // Загрузка истории чата
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    console.log('Загружена история чата:', chatHistory.length, 'сообщений');

    // Отображение истории чата при загрузке страницы
    chatHistory.forEach(message => {
        displayMessage(message);
    });

    // Подписка на общий канал чата
    const channel = pusher.subscribe('public-chat');
    console.log('Подписка на общий канал чата');

    // Проверяем состояние подключения
    pusher.connection.bind('connected', () => {
        console.log('Pusher подключен');
    });

    // Обработка ошибок подключения
    pusher.connection.bind('error', (err) => {
        console.error('Ошибка подключения Pusher:', err);
    });

    // Обработка входящих сообщений
    channel.bind('client-message', function(data) {
        console.log('Получено сообщение:', JSON.stringify(data, null, 2));
        displayMessage(data);
        saveMessageToHistory(data);
    });

    // Обработка подключения новых пользователей
    channel.bind('client-joined', function(data) {
        console.log('Новый пользователь подключился:', JSON.stringify(data, null, 2));
        const joinMessage = {
            user: 'Система',
            message: `${data.username} присоединился к чату`,
            timestamp: new Date().toISOString(),
            isSystem: true
        };
        displayMessage(joinMessage);
        saveMessageToHistory(joinMessage);
    });

    // Отправка сообщения
    sendButton.addEventListener('click', function() {
        const message = messageInput.value.trim();
        if (!message) {
            alert('Пожалуйста, введите сообщение');
            return;
        }

        try {
            const messageData = {
                user: 'Владелец',
                message: message,
                timestamp: new Date().toISOString(),
                isOwner: true
            };
            
            console.log('Отправка сообщения:', JSON.stringify(messageData, null, 2));
            channel.trigger('client-message', messageData);
            
            // Отображаем сообщение локально
            displayMessage(messageData);
            
            // Сохраняем в историю
            saveMessageToHistory(messageData);
            
            messageInput.value = '';
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Ошибка при отправке сообщения. Пожалуйста, попробуйте снова.');
        }
    });

    // Функция для сохранения сообщения в историю
    function saveMessageToHistory(message) {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        chatHistory.push(message);
        if (chatHistory.length > 100) {
            chatHistory.shift();
        }
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        console.log('Сообщение сохранено в историю. Всего сообщений:', chatHistory.length);
    }

    // Функция для отображения сообщений
    function displayMessage(data) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${data.isOwner ? 'owner-message' : data.isSystem ? 'system-message' : 'customer-message'}`;
        messageElement.innerHTML = `
            <strong>${data.user}</strong> 
            <span class="message-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
            <div class="message-text">${data.message}</div>
        `;
        
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        console.log('Сообщение отображено:', data.user, data.message);
    }
}); 