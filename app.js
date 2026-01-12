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
    rainbow: '🌈'
};

// 편지지 스타일 매핑
const PAPERS = {
    flower: 'paper-flower',
    star: 'paper-star',
    cloud: 'paper-cloud',
    heart: 'paper-heart',
    retro: 'paper-retro',
    simple: 'paper-simple'
};

// 폰트 스타일 매핑
const FONTS = {
    default: 'font-default',
    cute: 'font-cute',
    elegant: 'font-elegant'
};

// 기본 칭찬 메시지 (Live Board용)
const DEFAULT_PRAISES = [
    '첫 번째 칭찬을 보내보세요!',
    '따뜻한 한마디가 누군가에게 힘이 됩니다',
    '오늘도 서로에게 응원을 보내볼까요?'
];

// 상태 관리
let currentUserId = MEMBERS[0].id;
let selectedRecipientId = null;
let selectedSticker = 'star';
let selectedPaper = 'flower';
let selectedFont = 'default';
let praiseRotationInterval = null;
let currentPraiseIndex = 0;

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
const templateOptions = document.getElementById('templateOptions');
const paperOptions = document.getElementById('paperOptions');
const paperPreview = document.getElementById('paperPreview');
const fontOptions = document.getElementById('fontOptions');
const stickerOptions = document.getElementById('stickerOptions');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const customTemplateBtn = document.getElementById('customTemplateBtn');

const inboxModal = document.getElementById('inboxModal');
const closeInboxModal = document.getElementById('closeInboxModal');
const inboxSubtitle = document.getElementById('inboxSubtitle');
const inboxGrid = document.getElementById('inboxGrid');
const emptyInbox = document.getElementById('emptyInbox');

const messageDetailModal = document.getElementById('messageDetailModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const messageDetail = document.getElementById('messageDetail');

const praiseText = document.getElementById('praiseText');
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

// Live Praise Board
function getRandomPraises() {
    const messages = getMessages();
    if (messages.length === 0) {
        return DEFAULT_PRAISES.map(text => ({ text, isDefault: true }));
    }

    // 최근 메시지 중 랜덤하게 선택
    const shuffled = [...messages].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));

    return selected.map(msg => {
        const recipient = MEMBERS.find(m => m.id === msg.recipientId);
        const recipientName = recipient ? recipient.name : '익명';
        const preview = msg.content.length > 30 ? msg.content.slice(0, 30) + '...' : msg.content;
        return {
            text: `To. ${recipientName} - "${preview}"`,
            isDefault: false
        };
    });
}

function updatePraiseBoard() {
    const praises = getRandomPraises();
    if (praises.length === 0) return;

    currentPraiseIndex = (currentPraiseIndex + 1) % praises.length;
    const praise = praises[currentPraiseIndex];

    // 페이드 아웃
    praiseText.style.opacity = '0';
    praiseText.style.transform = 'translateY(-10px)';

    setTimeout(() => {
        praiseText.textContent = praise.text;
        // 페이드 인
        praiseText.style.opacity = '1';
        praiseText.style.transform = 'translateY(0)';
    }, 300);
}

function startPraiseRotation() {
    // 초기 표시
    const praises = getRandomPraises();
    if (praises.length > 0) {
        praiseText.textContent = praises[0].text;
    }

    // CSS 애니메이션 비활성화하고 JS로 제어
    praiseText.style.animation = 'none';
    praiseText.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    praiseText.style.opacity = '1';
    praiseText.style.transform = 'translateY(0)';

    // 5초마다 로테이션
    praiseRotationInterval = setInterval(updatePraiseBoard, 5000);
}

function stopPraiseRotation() {
    if (praiseRotationInterval) {
        clearInterval(praiseRotationInterval);
        praiseRotationInterval = null;
    }
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

function updatePaperPreview() {
    // 기존 paper 클래스 제거
    Object.values(PAPERS).forEach(cls => paperPreview.classList.remove(cls));
    // 새 paper 클래스 추가
    paperPreview.classList.add(PAPERS[selectedPaper]);
}

function updateFontPreview() {
    // 기존 font 클래스 제거
    Object.values(FONTS).forEach(cls => messageContent.classList.remove(cls));
    // 새 font 클래스 추가
    messageContent.classList.add(FONTS[selectedFont]);
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
            card.className = `inbox-card ${PAPERS[msg.paper] || 'paper-flower'}`;

            const fontClass = FONTS[msg.font] || 'font-default';

            card.innerHTML = `
                <div class="inbox-sticker">${STICKERS[msg.sticker] || '⭐'}</div>
                <div class="inbox-preview ${fontClass}">${msg.content}</div>
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

    // 초기화
    selectedSticker = 'star';
    selectedPaper = 'flower';
    selectedFont = 'default';

    // 템플릿 버튼 초기화
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // 스티커 버튼 초기화
    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.sticker === 'star');
    });

    // 편지지 버튼 초기화
    document.querySelectorAll('.paper-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.paper === 'flower');
    });

    // 폰트 버튼 초기화
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.font === 'default');
    });

    updatePaperPreview();
    updateFontPreview();

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

    const paperClass = PAPERS[msg.paper] || 'paper-flower';
    const fontClass = FONTS[msg.font] || 'font-default';

    messageDetail.className = `message-detail ${paperClass}`;
    messageDetail.innerHTML = `
        <div class="detail-sticker">${STICKERS[msg.sticker] || '⭐'}</div>
        <div class="detail-content ${fontClass}">${msg.content}</div>
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
        paper: selectedPaper,
        font: selectedFont,
        createdAt: new Date().toISOString()
    };

    const messages = getMessages();
    messages.push(newMessage);
    saveMessages(messages);

    closeWriteModalFn();
    renderMailboxGrid();
    updateMyMessageCount();

    // Live Praise Board 즉시 업데이트
    setTimeout(updatePraiseBoard, 500);

    showToast('익명 메시지가 전송되었어요! 💌');
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

// 템플릿 선택
templateOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.template-btn');
    if (!btn) return;

    // 직접 입력 버튼 클릭 시
    if (btn.id === 'customTemplateBtn') {
        document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        messageContent.value = '';
        messageContent.focus();
        charCount.textContent = '0';
        return;
    }

    const template = btn.dataset.template;
    if (template) {
        document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        messageContent.value = template;
        charCount.textContent = template.length;
    }
});

// 편지지 선택
paperOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.paper-btn');
    if (!btn) return;

    document.querySelectorAll('.paper-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedPaper = btn.dataset.paper;
    updatePaperPreview();
});

// 폰트 선택
fontOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.font-btn');
    if (!btn) return;

    document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedFont = btn.dataset.font;
    updateFontPreview();
});

// 스티커 선택
stickerOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.sticker-btn');
    if (!btn) return;

    document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSticker = btn.dataset.sticker;
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
    updatePaperPreview();
    updateFontPreview();
    startPraiseRotation();
}

init();
