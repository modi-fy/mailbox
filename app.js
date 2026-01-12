// 가상의 멤버 데이터 (10명)
const MEMBERS = [
    { id: 'member_1', name: '김민수', avatar: '🐻' },
    { id: 'member_2', name: '이지영', avatar: '🐰' },
    { id: 'member_3', name: '박준호', avatar: '🦊' },
    { id: 'member_4', name: '최수진', avatar: '🐱' },
    { id: 'member_5', name: '정현우', avatar: '🐶' },
    { id: 'member_6', name: '강예린', avatar: '🐼' },
    { id: 'member_7', name: '윤서준', avatar: '🦁' },
    { id: 'member_8', name: '임하늘', avatar: '🐨' },
    { id: 'member_9', name: '한소희', avatar: '🦄' },
    { id: 'member_10', name: '오태민', avatar: '🐯' }
];

// 스티커 매핑
const STICKERS = {
    star: '⭐',
    heart: '💖',
    sparkle: '✨',
    clap: '👏',
    flower: '🌸',
    rainbow: '🌈',
    fire: '🔥',
    rocket: '🚀'
};

// 상태 관리
let currentUserId = MEMBERS[0].id;
let selectedRecipientId = null;
let selectedSticker = 'star';
let selectedColor = '#FFF9C4';

// DOM 요소
const mailboxGrid = document.getElementById('mailboxGrid');
const currentUserSelect = document.getElementById('currentUser');
const myMailboxBtn = document.getElementById('myMailboxBtn');
const myMessageCount = document.getElementById('myMessageCount');

const writeModal = document.getElementById('writeModal');
const closeWriteModal = document.getElementById('closeWriteModal');
const recipientNameEl = document.getElementById('recipientName');
const messageContent = document.getElementById('messageContent');
const charCount = document.getElementById('charCount');
const stickerOptions = document.getElementById('stickerOptions');
const colorOptions = document.getElementById('colorOptions');
const sendMessageBtn = document.getElementById('sendMessageBtn');

const inboxModal = document.getElementById('inboxModal');
const closeInboxModal = document.getElementById('closeInboxModal');
const inboxSubtitle = document.getElementById('inboxSubtitle');
const inboxGrid = document.getElementById('inboxGrid');
const emptyInbox = document.getElementById('emptyInbox');

const messageDetailModal = document.getElementById('messageDetailModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const messageDetail = document.getElementById('messageDetail');

const toast = document.getElementById('toast');

// LocalStorage 키
const STORAGE_KEY = 'anonymous_mailbox_messages';

// 메시지 저장/불러오기
function getMessages() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function getMessagesForUser(userId) {
    return getMessages().filter(msg => msg.recipientId === userId);
}

function getMessageCountForUser(userId) {
    return getMessagesForUser(userId).length;
}

// UI 렌더링
function renderMailboxGrid() {
    mailboxGrid.innerHTML = '';

    MEMBERS.forEach(member => {
        // 자기 자신은 제외
        if (member.id === currentUserId) return;

        const messageCount = getMessageCountForUser(member.id);

        const card = document.createElement('div');
        card.className = 'mailbox-card';
        card.innerHTML = `
            <div class="mailbox-avatar">${member.avatar}</div>
            <div class="mailbox-name">${member.name}</div>
            <div class="mailbox-count">${messageCount}통의 편지</div>
        `;
        card.addEventListener('click', () => openWriteModal(member));
        mailboxGrid.appendChild(card);
    });
}

function renderUserSelect() {
    currentUserSelect.innerHTML = '';

    MEMBERS.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.avatar} ${member.name} (나)`;
        currentUserSelect.appendChild(option);
    });

    currentUserSelect.value = currentUserId;
}

function updateMyMessageCount() {
    const count = getMessageCountForUser(currentUserId);
    myMessageCount.textContent = count;
}

function renderInbox() {
    const messages = getMessagesForUser(currentUserId);

    if (messages.length === 0) {
        inboxGrid.style.display = 'none';
        emptyInbox.style.display = 'block';
        inboxSubtitle.textContent = '';
    } else {
        inboxGrid.style.display = 'grid';
        emptyInbox.style.display = 'none';
        inboxSubtitle.textContent = `${messages.length}통의 편지가 도착했어요!`;

        inboxGrid.innerHTML = '';

        // 최신 순으로 정렬
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        messages.forEach(msg => {
            const card = document.createElement('div');
            card.className = 'inbox-card';
            card.style.backgroundColor = msg.backgroundColor;
            card.innerHTML = `
                <div class="inbox-sticker">${STICKERS[msg.sticker]}</div>
                <div class="inbox-preview">${msg.content}</div>
            `;
            card.addEventListener('click', () => openMessageDetail(msg));
            inboxGrid.appendChild(card);
        });
    }
}

// 모달 관련
function openWriteModal(recipient) {
    selectedRecipientId = recipient.id;
    recipientNameEl.textContent = `${recipient.avatar} ${recipient.name}`;
    messageContent.value = '';
    charCount.textContent = '0';

    // 스티커/색상 초기화
    selectedSticker = 'star';
    selectedColor = '#FFF9C4';

    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.sticker === 'star');
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.color === '#FFF9C4');
    });

    writeModal.classList.add('active');
}

function closeWriteModalFn() {
    writeModal.classList.remove('active');
    selectedRecipientId = null;
}

function openInboxModal() {
    renderInbox();
    inboxModal.classList.add('active');
}

function closeInboxModalFn() {
    inboxModal.classList.remove('active');
}

function openMessageDetail(msg) {
    const date = new Date(msg.createdAt);
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

    messageDetail.style.backgroundColor = msg.backgroundColor;
    messageDetail.innerHTML = `
        <div class="detail-sticker">${STICKERS[msg.sticker]}</div>
        <div class="detail-content">${msg.content}</div>
        <div class="detail-date">${dateStr}</div>
    `;

    messageDetailModal.classList.add('active');
}

function closeDetailModalFn() {
    messageDetailModal.classList.remove('active');
}

// 토스트 메시지
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// 메시지 전송
function sendMessage() {
    const content = messageContent.value.trim();

    if (!content) {
        showToast('메시지를 입력해주세요!');
        return;
    }

    if (!selectedRecipientId) {
        showToast('수신자를 선택해주세요!');
        return;
    }

    const newMessage = {
        id: `msg_${Date.now()}`,
        recipientId: selectedRecipientId,
        content: content,
        sticker: selectedSticker,
        backgroundColor: selectedColor,
        createdAt: new Date().toISOString()
    };

    const messages = getMessages();
    messages.push(newMessage);
    saveMessages(messages);

    closeWriteModalFn();
    renderMailboxGrid();
    updateMyMessageCount();

    showToast('익명 메시지가 전송되었어요!');
}

// 이벤트 리스너
currentUserSelect.addEventListener('change', (e) => {
    currentUserId = e.target.value;
    renderMailboxGrid();
    updateMyMessageCount();
});

myMailboxBtn.addEventListener('click', openInboxModal);
closeWriteModal.addEventListener('click', closeWriteModalFn);
closeInboxModal.addEventListener('click', closeInboxModalFn);
closeDetailModal.addEventListener('click', closeDetailModalFn);

// 모달 바깥 클릭 시 닫기
writeModal.addEventListener('click', (e) => {
    if (e.target === writeModal) closeWriteModalFn();
});

inboxModal.addEventListener('click', (e) => {
    if (e.target === inboxModal) closeInboxModalFn();
});

messageDetailModal.addEventListener('click', (e) => {
    if (e.target === messageDetailModal) closeDetailModalFn();
});

// 글자수 카운트
messageContent.addEventListener('input', (e) => {
    charCount.textContent = e.target.value.length;
});

// 스티커 선택
stickerOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.sticker-btn');
    if (!btn) return;

    document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSticker = btn.dataset.sticker;
});

// 색상 선택
colorOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.color-btn');
    if (!btn) return;

    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedColor = btn.dataset.color;
});

// 메시지 전송
sendMessageBtn.addEventListener('click', sendMessage);

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeWriteModalFn();
        closeInboxModalFn();
        closeDetailModalFn();
    }
});

// 초기화
function init() {
    renderUserSelect();
    renderMailboxGrid();
    updateMyMessageCount();
}

init();
