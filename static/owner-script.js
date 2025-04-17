// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем существование необходимых элементов
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesDiv = document.getElementById('messages');
    const chatList = document.getElementById('chatList');

    if (!messageInput || !sendButton || !messagesDiv || !chatList) {
        console.error('Не найдены необходимые элементы DOM');
        return;
    }

    // Инициализация Pusher
    const pusher = new Pusher('NZEdl04669f636mMy9XCkax3S_t20_0GToZQXd4Mj5Q', {
        cluster: 'eu',
        forceTLS: true
    });

    // Хранилище активных чатов
    const activeChats = new Map();
    let currentChatId = null;

    // Функция для создания элемента чата в списке
    function createChatListItem(chatId, username) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-list-item';
        chatItem.dataset.chatId = chatId;
        chatItem.innerHTML = `
            <span class="chat-username">${username}</span>
            <span class="chat-time">${new Date().toLocaleTimeString()}</span>
        `;
        
        chatItem.addEventListener('click', () => switchChat(chatId));
        return chatItem;
    }

    // Функция для переключения между чатами
    function switchChat(chatId) {
        currentChatId = chatId;
        // Обновляем активный элемент в списке
        document.querySelectorAll('.chat-list-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chatId === chatId);
        });
        
        // Очищаем и загружаем историю чата
        messagesDiv.innerHTML = '';
        const chatHistory = JSON.parse(localStorage.getItem(`chatHistory_${chatId}`) || '[]');
        chatHistory.forEach(message => displayMessage(message));
        
        // Обновляем заголовок чата
        document.querySelector('.chat-header h2').textContent = `Чат с ${activeChats.get(chatId).username}`;
    }

    // Функция для подписки на новый чат
    function subscribeToChat(chatId, username) {
        if (!activeChats.has(chatId)) {
            // Подписываемся на канал конкретного чата
            const chatChannel = pusher.subscribe(chatId);
            
            // Сохраняем информацию о чате
            activeChats.set(chatId, {
                username: username,
                channel: chatChannel
            });
            
            // Добавляем чат в список
            chatList.appendChild(createChatListItem(chatId, username));
            
            // Если это первый чат, автоматически переключаемся на него
            if (activeChats.size === 1) {
                switchChat(chatId);
            }
            
            // Подписываемся на сообщения в этом чате
            chatChannel.bind('client-message', function(data) {
                console.log('Получено сообщение:', data);
                if (currentChatId === chatId) {
                    displayMessage(data);
                }
                saveMessageToHistory(data);
            });

            // Подписываемся на события подключения клиентов
            chatChannel.bind('client-joined', function(data) {
                console.log('Клиент подключился:', data);
                if (!activeChats.has(chatId)) {
                    subscribeToChat(chatId, data.username);
                }
            });
        }
    }

    // Отправка сообщения
    sendButton.addEventListener('click', function() {
        if (!currentChatId) {
            alert('Выберите чат для отправки сообщения');
            return;
        }

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
                isOwner: true,
                chatId: currentChatId
            };
            
            // Отправляем сообщение в конкретный чат
            activeChats.get(currentChatId).channel.trigger('client-message', messageData);
            
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
        const chatHistory = JSON.parse(localStorage.getItem(`chatHistory_${message.chatId}`) || '[]');
        chatHistory.push(message);
        if (chatHistory.length > 100) {
            chatHistory.shift();
        }
        localStorage.setItem(`chatHistory_${message.chatId}`, JSON.stringify(chatHistory));
    }

    // Функция для отображения сообщений
    function displayMessage(data) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${data.isOwner ? 'owner-message' : 'customer-message'}`;
        messageElement.innerHTML = `
            <strong>${data.user}</strong> 
            <span class="message-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
            <div class="message-text">${data.message}</div>
        `;
        
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}); 