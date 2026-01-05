// Telegram WebApp初期化
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// 選択された情報を保存
let selectedCarType = null;
let selectedCarPrice = 0;
let selectedService = null;
let selectedServicePrice = 0;
let selectedTime = null;
let finalPrice = 0;

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

// 車種選択時の処理
function selectCarType(carType, price) {
    selectedCarType = carType;
    selectedCarPrice = price;
    
    // 車種選択画面を非表示
    document.getElementById('carTypeSelection').style.display = 'none';
    
    // サービス選択画面を表示
    document.getElementById('serviceSelection').style.display = 'block';
    
    // 価格を更新
    document.getElementById('priceStandard').textContent = '$' + price + '.00';
    document.getElementById('priceCoating').textContent = '$' + (price + 5) + '.00';
}

// 車種選択に戻る
function backToCarType() {
    document.getElementById('serviceSelection').style.display = 'none';
    document.getElementById('carTypeSelection').style.display = 'block';
    
    // 選択をリセット
    selectedService = null;
    selectedServicePrice = 0;
    
    // 全カードの選択状態をリセット
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// サービス選択時の処理
function selectService(service, additionalPrice) {
    selectedService = service;
    selectedServicePrice = additionalPrice;
    finalPrice = selectedCarPrice + additionalPrice;
    
    // 全カードの選択状態をリセット
    document.querySelectorAll('#serviceSelection .service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // クリックされたカードを選択状態に
    event.currentTarget.classList.add('selected');
    
    // サービス選択画面を非表示
    document.getElementById('serviceSelection').style.display = 'none';
    
    // 予約時間選択画面を表示
    document.getElementById('timeSelection').style.display = 'block';
    
    // 選択内容を表示
    const serviceName = service === 'standard' ? 'スタンダード' : '窓コーティング + タイヤ込み';
    const carTypeName = selectedCarType === 'sedan' ? 'セダン' : 
                        selectedCarType === 'suv' ? 'SUV' : '1BOX';
    document.getElementById('selectedServiceName').textContent = carTypeName + ' - ' + serviceName;
    document.getElementById('selectedPriceDisplay').textContent = finalPrice + '.00';
}

// サービス選択に戻る
function backToService() {
    document.getElementById('timeSelection').style.display = 'none';
    document.getElementById('serviceSelection').style.display = 'block';
    
    // 選択をリセット
    selectedTime = null;
    tg.MainButton.hide();
    
    // 全カードの選択状態をリセット
    document.querySelectorAll('#timeSelection .service-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// 予約時間選択時の処理
function selectTime(timeSlot) {
    selectedTime = timeSlot;
    
    // 全カードの選択状態をリセット
    document.querySelectorAll('#timeSelection .service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // クリックされたカードを選択状態に
    event.currentTarget.classList.add('selected');
    
    // Main Buttonを表示
    tg.MainButton.setText(`予約する - $${finalPrice}`);
    tg.MainButton.color = '#667eea';
    tg.MainButton.show();
    
    // Main Buttonクリック時の処理
    tg.MainButton.onClick(proceedToBooking);
}

// 予約処理
function proceedToBooking() {
    tg.MainButton.showProgress();
    
    const carTypeName = selectedCarType === 'sedan' ? 'セダン' : 
                        selectedCarType === 'suv' ? 'SUV' : '1BOX';
    const serviceName = selectedService === 'standard' ? 'スタンダード' : '窓コーティング + タイヤ込み';
    
    // ここでバックエンドAPIを呼び出す
    // 今はデモなので、アラート表示のみ
    setTimeout(() => {
        tg.showAlert(
            `予約が完了しました！\n\n` +
            `車種: ${carTypeName}\n` +
            `サービス: ${serviceName}\n` +
            `予約時間: ${selectedTime}\n` +
            `金額: $${finalPrice}\n\n` +
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
