// Telegram WebApp初期化
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// 選択された情報を保存
let selectedService = null;
let selectedPrice = 0;

// ユーザー情報を表示
window.addEventListener('DOMContentLoaded', function() {
    const user = tg.initDataUnsafe.user;
    if (user) {
        document.getElementById('userName').textContent = 
            user.first_name + ' ' + (user.last_name || '');
        document.getElementById('userId').textContent = user.id;
        document.getElementById('userInfo').style.display = 'block';
    }
});

// サービス選択時の処理
function selectService(service, price) {
    selectedService = service;
    selectedPrice = price;
    
    // 全カードの選択状態をリセット
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // クリックされたカードを選択状態に
    event.currentTarget.classList.add('selected');
    
    // Main Buttonを表示
    tg.MainButton.setText(`予約する - $${price}`);
    tg.MainButton.color = '#667eea';
    tg.MainButton.show();
    
    // Main Buttonクリック時の処理
    tg.MainButton.onClick(proceedToBooking);
}

// 予約処理
function proceedToBooking() {
    tg.MainButton.showProgress();
    
    // ここでバックエンドAPIを呼び出す
    // 今はデモなので、アラート表示のみ
    setTimeout(() => {
        tg.showAlert(
            `予約が完了しました！\n` +
            `サービス: ${selectedService}\n` +
            `金額: $${selectedPrice}\n\n` +
            `※これはデモ版です。実際の決済は統合後に機能します。`
        );
        tg.MainButton.hideProgress();
        tg.close();
    }, 1000);
}

// Back Buttonの設定
tg.BackButton.show();
tg.BackButton.onClick(() => {
    tg.close();
});
