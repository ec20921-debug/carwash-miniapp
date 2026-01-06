// Telegram WebApp初期化
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// 選択された情報を保存
let selectedCarType = null;
let selectedCarPrice = 0;
let selectedService = null;
let selectedServicePrice = 0;
let selectedDate = null;
let selectedTime = null;
let finalPrice = 0;
let bookingId = null;

// ユーザー情報を表示
window.addEventListener('DOMContentLoaded', function() {
    const user = tg.initDataUnsafe.user;
    if (user) {
        document.getElementById('userName').textContent = 
            user.first_name + ' ' + (user.last_name || '');
        document.getElementById('userId').textContent = user.id;
        document.getElementById('userInfo').style.display = 'block';
    }
    
    // 今日の日付を最小値として設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
});

// 車種選択時の処理
function selectCarType(carType, price) {
    selectedCarType = carType;
    selectedCarPrice = price;
    
    // 選択状態をクリア
    document.querySelectorAll('#carTypeSelection .service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // クリックされたカードを選択状態に
    event.currentTarget.classList.add('selected');
    
    // 価格を更新
    document.getElementById('priceStandard').textContent = '$' + price + '.00';
    document.getElementById('priceCoating').textContent = '$' + (price + 5) + '.00';
    
    // 1秒後にサービス選択画面に遷移
    setTimeout(() => {
        showScreen('serviceSelection');
    }, 500);
}

// サービス選択時の処理
function selectService(service, additionalPrice) {
    selectedService = service;
    selectedServicePrice = additionalPrice;
    finalPrice = selectedCarPrice + additionalPrice;
    
    // 選択状態をクリア
    document.querySelectorAll('#serviceSelection .service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // クリックされたカードを選択状態に
    event.currentTarget.classList.add('selected');
    
    // 1秒後に日付選択画面に遷移
    setTimeout(() => {
        showScreen('dateSelection');
    }, 500);
}

// 日付選択時の処理
function selectDate() {
    const dateInput = document.getElementById('bookingDate');
    selectedDate = dateInput.value;
    
    if (selectedDate) {
        // 選択内容を表示用に更新
        updateSelectedInfo();
        
        // 1秒後に時間選択画面に遷移
        setTimeout(() => {
            showScreen('timeSelection');
        }, 500);
    }
}

// 時間選択時の処理
function selectTime(timeSlot) {
    selectedTime = timeSlot;
    
    // 選択状態をクリア
    document.querySelectorAll('#timeSelection .service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // クリックされたカードを選択状態に
    event.currentTarget.classList.add('selected');
    
    // 確認画面の内容を更新
    updateConfirmationScreen();
    
    // 1秒後に確認画面に遷移
    setTimeout(() => {
        showScreen('confirmationScreen');
    }, 500);
}

// 決済へ進む
function proceedToPayment() {
    updatePaymentScreen();
    showScreen('paymentScreen');
}

// 決済シミュレーション
async function simulatePayment() {
    // ローディング画面を表示
    showScreen('loadingScreen');
    
    try {
        // 予約IDを生成
        const timestamp = Date.now();
        const userId = tg.initDataUnsafe.user?.id || '0000';
        bookingId = `BK${timestamp}${userId.toString().slice(-3)}`;
        
        // Cloudflare Workerに予約データを送信
        // ★重要: ステップ5で作成するWorker URLに書き換えてください
        const response = await fetch('https://your-worker.your-subdomain.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                booking_id: bookingId,
                user_id: tg.initDataUnsafe.user?.id || 0,
                user_name: tg.initDataUnsafe.user?.first_name || 'ゲスト',
                car_type: selectedCarType,
                service_type: selectedService,
                booking_date: selectedDate,
                booking_time: selectedTime,
                price: finalPrice,
                payment_status: 'completed', // 試作版では完了扱い
                transaction_id: `TXN${timestamp}`,
                status: 'pending'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('予約データ保存成功:', result);
            
            // 成功画面を表示
            updateSuccessScreen();
            showScreen('successScreen');
            
            // Telegramに通知（オプション）
            tg.showAlert(`予約が完了しました！\n予約ID: ${bookingId}`);
            
        } else {
            throw new Error('サーバーエラーが発生しました');
        }
        
    } catch (error) {
        console.error('予約エラー:', error);
        
        // エラーの場合もローカルで成功画面を表示（試作版のため）
        updateSuccessScreen();
        showScreen('successScreen');
        
        tg.showAlert(`予約が完了しました（ローカル保存）\n予約ID: ${bookingId}\n\n※サーバー連携は実装後に有効になります`);
    }
}

// 画面切り替え関数
function showScreen(screenId) {
    // すべての画面を非表示
    const screens = [
        'carTypeSelection', 'serviceSelection', 'dateSelection', 
        'timeSelection', 'confirmationScreen', 'paymentScreen', 
        'loadingScreen', 'successScreen'
    ];
    
    screens.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    
    // 指定された画面を表示
    document.getElementById(screenId).classList.remove('hidden');
}

// 戻るボタンの処理
function backToCarType() {
    selectedService = null;
    selectedServicePrice = 0;
    clearSelections('#serviceSelection');
    showScreen('carTypeSelection');
}

function backToService() {
    selectedDate = null;
    document.getElementById('bookingDate').value = '';
    showScreen('serviceSelection');
}

function backToDate() {
    selectedTime = null;
    clearSelections('#timeSelection');
    showScreen('dateSelection');
}

function backToTime() {
    clearSelections('#confirmationScreen');
    showScreen('timeSelection');
}

function backToConfirmation() {
    showScreen('confirmationScreen');
}

// 選択状態をクリア
function clearSelections(selector) {
    document.querySelectorAll(`${selector} .service-card`).forEach(card => {
        card.classList.remove('selected');
    });
}

// 選択内容の表示を更新
function updateSelectedInfo() {
    const carTypeNames = {
        'sedan': 'セダン',
        'suv': 'SUV',
        'onebox': '1BOX'
    };
    
    const serviceNames = {
        'standard': 'スタンダード',
        'coating': '窓コーティング'
    };
    
    const selectedInfo = `${carTypeNames[selectedCarType]} - ${serviceNames[selectedService]}`;
    document.getElementById('selectedInfo').textContent = selectedInfo;
    
    // 日付を読みやすい形式に変換
    if (selectedDate) {
        const date = new Date(selectedDate + 'T00:00:00');
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'short'
        };
        const formattedDate = date.toLocaleDateString('ja-JP', options);
        document.getElementById('selectedDateDisplay').textContent = formattedDate;
    }
    
    document.getElementById('selectedPriceDisplay').textContent = finalPrice + '.00';
}

// 確認画面の内容を更新
function updateConfirmationScreen() {
    const carTypeNames = {
        'sedan': 'セダン',
        'suv': 'SUV',
        'onebox': '1BOX'
    };
    
    const serviceNames = {
        'standard': 'スタンダード',
        'coating': '窓コーティング'
    };
    
    document.getElementById('confirmCarType').textContent = carTypeNames[selectedCarType];
    document.getElementById('confirmService').textContent = serviceNames[selectedService];
    
    // 日付を読みやすい形式に変換
    const date = new Date(selectedDate + 'T00:00:00');
    const formattedDate = date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
    });
    document.getElementById('confirmDate').textContent = formattedDate;
    document.getElementById('confirmTime').textContent = selectedTime;
    document.getElementById('confirmPrice').textContent = '$' + finalPrice + '.00';
    document.getElementById('finalPriceButton').textContent = finalPrice + '.00';
}

// 決済画面の内容を更新
function updatePaymentScreen() {
    document.getElementById('paymentAmount').textContent = finalPrice + '.00';
}

// 成功画面の内容を更新
function updateSuccessScreen() {
    const carTypeNames = {
        'sedan': 'セダン',
        'suv': 'SUV',
        'onebox': '1BOX'
    };
    
    const serviceNames = {
        'standard': 'スタンダード',
        'coating': '窓コーティング'
    };
    
    document.getElementById('bookingIdDisplay').textContent = bookingId;
    document.getElementById('successCarType').textContent = carTypeNames[selectedCarType];
    document.getElementById('successService').textContent = serviceNames[selectedService];
    
    // 日付を読みやすい形式に変換
    const date = new Date(selectedDate + 'T00:00:00');
    const formattedDate = date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
    });
    document.getElementById('successDate').textContent = formattedDate;
    document.getElementById('successTime').textContent = selectedTime;
    document.getElementById('successPrice').textContent = '$' + finalPrice + '.00';
}

// Back Buttonの設定
tg.BackButton.show();
tg.BackButton.onClick(() => {
    tg.close();
});
