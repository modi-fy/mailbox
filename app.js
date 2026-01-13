// Supabase 설정
const SUPABASE_URL = 'https://xrfespmblgohrqosjiyn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8z8Mgex0plRqWJQ9UROMDg_RAM8-mdy';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// 색종이 색상
const CONFETTI_COLORS = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#10ac84', '#ee5a24', '#c8d6e5', '#ffeaa7'
];

// 상태 관리
let currentUserId = localStorage.getItem('currentUserId') || null;
let selectedRecipientId = null;
let selectedSticker = 'star';
let selectedPaper = 'flower';
let selectedFont = 'default';

// DOM 요소
const mailboxGrid = document.getElementById('mailboxGrid');
const myMailboxBtn = document.getElementById('myMailboxBtn');
const myMessageCount = document.getElementById('myMessageCount');
const currentUserBtn = document.getElementById('currentUserBtn');
const currentUserAvatar = document.getElementById('currentUserAvatar');
const currentUserName = document.getElementById('currentUserName');
const welcomeModal = document.getElementById('welcomeModal');
const welcomeGrid = document.getElementById('welcomeGrid');

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
const messageDetailCard = document.getElementById('messageDetailCard');
const saveImageBtn = document.getElementById('saveImageBtn');

const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');

const flyingLettersContent = document.getElementById('flyingLettersContent');
const toast = document.getElementById('toast');

// ============================================
// 색종이 효과 (Confetti)
// ============================================

class Confetti {
    constructor() {
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
    }

    resize() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }

    createParticle(x, y) {
        return {
            x: x || Math.random() * confettiCanvas.width,
            y: y || -20,
            size: Math.random() * 10 + 5,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            speedX: (Math.random() - 0.5) * 8,
            speedY: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
            opacity: 1
        };
    }

    burst(count = 100) {
        this.resize();
        this.isRunning = true;

        const centerX = confettiCanvas.width / 2;
        const centerY = confettiCanvas.height / 3;

        for (let i = 0; i < count; i++) {
            const particle = this.createParticle(centerX, centerY);
            particle.speedX = (Math.random() - 0.5) * 15;
            particle.speedY = Math.random() * -10 - 5;
            this.particles.push(particle);
        }

        setTimeout(() => {
            for (let i = 0; i < count / 2; i++) {
                this.particles.push(this.createParticle());
            }
        }, 300);

        this.animate();
    }

    animate() {
        if (!this.isRunning) return;

        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        this.particles.forEach((p, index) => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.speedY += 0.15;
            p.speedX *= 0.99;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.005;

            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);
            confettiCtx.globalAlpha = Math.max(0, p.opacity);
            confettiCtx.fillStyle = p.color;

            if (p.shape === 'rect') {
                confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                confettiCtx.beginPath();
                confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                confettiCtx.fill();
            }

            confettiCtx.restore();

            if (p.y > confettiCanvas.height + 50 || p.opacity <= 0) {
                this.particles.splice(index, 1);
            }
        });

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.stop();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        this.particles = [];
    }
}

const confetti = new Confetti();
window.addEventListener('resize', () => confetti.resize());

// ============================================
// 날아다니는 편지 (Flying Letters)
// ============================================

async function renderFlyingLetters() {
    const messages = await getMessages();
    flyingLettersContent.innerHTML = '';

    if (messages.length === 0) {
        flyingLettersContent.innerHTML = `
            <div class="flying-letters-empty">
                <div class="empty-envelope">💌</div>
                <p>아직 편지가 없어요<br>첫 번째 칭찬을 보내보세요!</p>
            </div>
        `;
        return;
    }

    // 최대 8개의 편지만 표시 (성능을 위해)
    const shuffled = [...messages].sort(() => Math.random() - 0.5);
    const displayMessages = shuffled.slice(0, Math.min(8, messages.length));

    const animationPaths = ['animate-path-1', 'animate-path-2', 'animate-path-3', 'animate-path-4', 'animate-path-5'];

    displayMessages.forEach((msg, index) => {
        const recipient = MEMBERS.find(m => m.id === msg.recipientId);
        const recipientName = recipient ? recipient.name : '익명';
        const preview = msg.content.length > 25 ? msg.content.slice(0, 25) + '...' : msg.content;
        const sticker = STICKERS[msg.sticker] || '⭐';

        // 랜덤 애니메이션 경로 선택
        const animClass = animationPaths[index % animationPaths.length];
        // 랜덤 딜레이 추가
        const delay = (index * 1.5) + Math.random() * 2;
        // z-index 설정 (각 편지가 고유한 층위를 가짐 - 나중 편지가 위로)
        const zIndex = 10 + index;

        const letter = document.createElement('div');
        letter.className = `flying-letter ${animClass}`;
        letter.style.animationDelay = `${delay}s`;
        letter.style.zIndex = zIndex;

        letter.innerHTML = `
            <div class="flying-letter-sticker">${sticker}</div>
            <div class="flying-letter-to">To. ${recipientName}</div>
            <div class="flying-letter-preview">${preview}</div>
        `;

        flyingLettersContent.appendChild(letter);
    });
}

// ============================================
// 이미지 저장 기능
// ============================================

async function saveAsImage() {
    const btn = saveImageBtn;
    btn.classList.add('saving');
    btn.innerHTML = '<span class="save-icon">⏳</span> 저장 중...';

    try {
        const canvas = await html2canvas(messageDetailCard, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            logging: false
        });

        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `칭찬편지_${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        showToast('이미지가 저장되었어요! 📸');
    } catch (error) {
        console.error('이미지 저장 실패:', error);
        showToast('이미지 저장에 실패했어요 😢');
    } finally {
        btn.classList.remove('saving');
        btn.innerHTML = '<span class="save-icon">📥</span> 이미지로 저장하기';
    }
}

// ============================================
// 메시지 저장/불러오기 (Supabase)
// ============================================

async function getMessages() {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('메시지 조회 실패:', error);
        return [];
    }

    // DB 컬럼명을 기존 코드와 호환되도록 변환
    return data.map(msg => ({
        id: msg.id,
        recipientId: msg.recipient_id,
        content: msg.content,
        sticker: msg.sticker,
        paper: msg.paper,
        font: msg.font,
        createdAt: msg.created_at
    }));
}

async function saveMessage(message) {
    const { error } = await supabase
        .from('messages')
        .insert({
            recipient_id: message.recipientId,
            content: message.content,
            sticker: message.sticker,
            paper: message.paper,
            font: message.font
        });

    if (error) {
        console.error('메시지 저장 실패:', error);
        return false;
    }
    return true;
}

async function getMessagesForUser(userId) {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('메시지 조회 실패:', error);
        return [];
    }

    return data.map(msg => ({
        id: msg.id,
        recipientId: msg.recipient_id,
        content: msg.content,
        sticker: msg.sticker,
        paper: msg.paper,
        font: msg.font,
        createdAt: msg.created_at
    }));
}

async function getMessageCountForUser(userId) {
    const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId);

    if (error) {
        console.error('메시지 카운트 실패:', error);
        return 0;
    }
    return count || 0;
}

// ============================================
// UI 렌더링
// ============================================

async function renderMailboxGrid() {
    mailboxGrid.innerHTML = '';

    for (const member of MEMBERS) {
        if (member.id === currentUserId) continue;

        const messageCount = await getMessageCountForUser(member.id);

        const card = document.createElement('div');
        card.className = 'mailbox-card';
        card.innerHTML = `
            <div class="mailbox-avatar">${member.avatar}</div>
            <div class="mailbox-name">${member.name}</div>
            <div class="mailbox-count">${messageCount}통의 편지</div>
        `;
        card.addEventListener('click', () => openWriteModal(member));
        mailboxGrid.appendChild(card);
    }
}

function renderWelcomeGrid() {
    welcomeGrid.innerHTML = '';

    MEMBERS.forEach(member => {
        const card = document.createElement('div');
        card.className = 'welcome-member';
        card.innerHTML = `
            <span class="welcome-member-avatar">${member.avatar}</span>
            <span class="welcome-member-name">${member.name}</span>
        `;
        card.addEventListener('click', () => selectCurrentUser(member.id));
        welcomeGrid.appendChild(card);
    });
}

async function selectCurrentUser(userId) {
    currentUserId = userId;
    localStorage.setItem('currentUserId', userId);
    welcomeModal.classList.remove('active');
    updateCurrentUserDisplay();
    await renderMailboxGrid();
    await updateMyMessageCount();
    showToast('환영합니다! 이제 동기들에게 메시지를 보내보세요 💌');
}

function updateCurrentUserDisplay() {
    const member = MEMBERS.find(m => m.id === currentUserId);
    if (member) {
        currentUserAvatar.textContent = member.avatar;
        currentUserName.textContent = member.name;
    }
}

function showWelcomeModal() {
    renderWelcomeGrid();
    welcomeModal.classList.add('active');
}

async function updateMyMessageCount() {
    if (!currentUserId) {
        myMessageCount.textContent = '0';
        return;
    }
    const count = await getMessageCountForUser(currentUserId);
    myMessageCount.textContent = count;
}

function updatePaperPreview() {
    Object.values(PAPERS).forEach(cls => paperPreview.classList.remove(cls));
    paperPreview.classList.add(PAPERS[selectedPaper]);
}

function updateFontPreview() {
    Object.values(FONTS).forEach(cls => messageContent.classList.remove(cls));
    messageContent.classList.add(FONTS[selectedFont]);
}

async function renderInbox() {
    const messages = await getMessagesForUser(currentUserId);

    if (messages.length === 0) {
        inboxGrid.style.display = 'none';
        emptyInbox.style.display = 'block';
        inboxSubtitle.textContent = '';
    } else {
        inboxGrid.style.display = 'grid';
        emptyInbox.style.display = 'none';
        inboxSubtitle.textContent = `${messages.length}통의 편지가 도착했어요!`;

        inboxGrid.innerHTML = '';

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

// ============================================
// 모달 관련
// ============================================

function openWriteModal(recipient) {
    selectedRecipientId = recipient.id;
    recipientNameEl.textContent = `${recipient.avatar} ${recipient.name}`;
    messageContent.value = '';
    charCount.textContent = '0';

    selectedSticker = 'star';
    selectedPaper = 'flower';
    selectedFont = 'default';

    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.sticker === 'star');
    });

    document.querySelectorAll('.paper-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.paper === 'flower');
    });

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

async function openInboxModal() {
    if (!currentUserId) {
        showToast('먼저 본인을 선택해주세요! 👆');
        showWelcomeModal();
        return;
    }
    await renderInbox();
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

    // 색종이 효과 실행!
    setTimeout(() => confetti.burst(80), 200);
}

function closeDetailModalFn() {
    messageDetailModal.classList.remove('active');
    confetti.stop();
}

// ============================================
// 토스트 메시지
// ============================================

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ============================================
// 메시지 전송
// ============================================

async function sendMessage() {
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
        recipientId: selectedRecipientId,
        content: content,
        sticker: selectedSticker,
        paper: selectedPaper,
        font: selectedFont
    };

    const success = await saveMessage(newMessage);

    if (!success) {
        showToast('메시지 전송에 실패했어요 😢');
        return;
    }

    closeWriteModalFn();
    await renderMailboxGrid();
    await updateMyMessageCount();

    // 날아다니는 편지 업데이트
    await renderFlyingLetters();

    showToast('익명 메시지가 전송되었어요! 💌');
}

// ============================================
// 이벤트 리스너
// ============================================

currentUserBtn.addEventListener('click', showWelcomeModal);
myMailboxBtn.addEventListener('click', openInboxModal);
closeWriteModal.addEventListener('click', closeWriteModalFn);
closeInboxModal.addEventListener('click', closeInboxModalFn);
closeDetailModal.addEventListener('click', closeDetailModalFn);
saveImageBtn.addEventListener('click', saveAsImage);

writeModal.addEventListener('click', (e) => {
    if (e.target === writeModal) closeWriteModalFn();
});

inboxModal.addEventListener('click', (e) => {
    if (e.target === inboxModal) closeInboxModalFn();
});

messageDetailModal.addEventListener('click', (e) => {
    if (e.target === messageDetailModal) closeDetailModalFn();
});

messageContent.addEventListener('input', (e) => {
    charCount.textContent = e.target.value.length;
});

templateOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.template-btn');
    if (!btn) return;

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

paperOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.paper-btn');
    if (!btn) return;

    document.querySelectorAll('.paper-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedPaper = btn.dataset.paper;
    updatePaperPreview();
});

fontOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.font-btn');
    if (!btn) return;

    document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedFont = btn.dataset.font;
    updateFontPreview();
});

stickerOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.sticker-btn');
    if (!btn) return;

    document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSticker = btn.dataset.sticker;
});

sendMessageBtn.addEventListener('click', sendMessage);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeWriteModalFn();
        closeInboxModalFn();
        closeDetailModalFn();
        // 환영 모달은 사용자 선택 전에는 Escape로 닫지 않음
        if (currentUserId) {
            welcomeModal.classList.remove('active');
        }
    }
});

// ============================================
// 초기화
// ============================================

async function init() {
    confetti.resize();

    // 저장된 사용자가 없으면 환영 모달 표시
    if (!currentUserId || !MEMBERS.find(m => m.id === currentUserId)) {
        currentUserId = null;
        showWelcomeModal();
    } else {
        updateCurrentUserDisplay();
    }

    await renderMailboxGrid();
    await updateMyMessageCount();
    updatePaperPreview();
    updateFontPreview();
    await renderFlyingLetters();
}

init();
