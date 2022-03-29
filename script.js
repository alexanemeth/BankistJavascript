'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2021-09-25T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2021-09-26T23:36:17.929Z',
    '2021-09-28T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'de-DE', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
//==============================================================================================================================
const formatDate = function (date, local) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(local).format(date);
};
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
const displayBalance = function (accs) {
  accs.balance = accs.movements.reduce((a, b) => a + b, 0);
  const formattedMovement = formatCur(accs.balance, accs.locale, accs.currency);
  labelBalance.textContent = `${formattedMovement} EUR`;
};

const displayMovements = function (acc, sorted = false) {
  containerMovements.innerHTML = '';
  const movs = sorted
    ? acc.movements.map(mov => mov).sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i) {
    const movementDate = new Date(acc.movementsDates[i]);
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const formattedMovement = formatCur(mov, acc.locale, acc.currency);
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${formatDate(movementDate, acc.locale)}</div>
    <div class="movements__value">${formattedMovement}</div>
  </div>
`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displaySummary = function (accs) {
  const deposits = accs.movements
    .filter(acc => acc > 0)
    .reduce((a, b) => a + b);
  const withdrawals = accs.movements
    .filter(acc => acc < 0)
    .reduce((a, b) => a + b);
  const interest = accs.movements
    .filter(acc => acc > 0)
    .map(deposit => (deposit * accs.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((a, b) => a + b, 0);
  console.log(interest);
  labelSumOut.textContent = `${formatCur(
    Math.abs(withdrawals),
    accs.locale,
    accs.currency
  )}`;
  labelSumIn.textContent = `${formatCur(deposits, accs.locale, accs.currency)}`;
  labelSumInterest.textContent = `${formatCur(
    interest,
    accs.locale,
    accs.currency
  )}`;
};

const createUsername = function (accs) {
  accs.forEach(
    acc =>
      (acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(word => word[0])
        .join(''))
  );
};
createUsername(accounts);

const updateUI = function (account) {
  displayBalance(account);
  displayMovements(account);
  displaySummary(account);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(logOut);
      containerApp.style.opacity = '0';
      labelWelcome.textContent = `Your time is expired!`;
    }
    time -= 1;
  };

  let time = 10;
  tick();
  const logOut = setInterval(tick, 1000);
  return logOut;
};

let currentAccount, timer;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  const pin = Number(inputLoginPin.value);
  if (pin === currentAccount?.pin) {
    containerApp.style.opacity = '100';
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      //weekday: 'long', //short,narrow,2-digit
    };
    //const locale = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const minute = `${curDate.getMinutes()}`.padStart(2, 0);
    // const hour = curDate.getHours();
    // const day = curDate.getDate();
    // const month = `${curDate.getMonth() + 1}`.padStart(2, 0);
    // const year = curDate.getFullYear();
    //labelDate.textContent = `${day}/${month}/${year}`;
  }
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
  if (timer) {
    clearInterval(timer);
  }

  timer = startLogOutTimer();
  updateUI(currentAccount);
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  const amount = Number(inputTransferAmount.value);
  if (
    receiver != currentAccount.username &&
    amount < currentAccount.balance &&
    amount > 0
  ) {
    currentAccount.movements.push(-amount);
    receiver.movements.push(amount);
    currentAccount.movementsDates.push(new Date());
    receiver.movementsDates.push(new Date());
    inputTransferAmount.value = inputTransferTo.value = '';
    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov > amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date());
      inputLoanAmount.value = '';
      updateUI(currentAccount);
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const pin = Number(inputClosePin.value);
  if (
    inputCloseUsername.value === currentAccount.username &&
    pin === currentAccount.pin
  ) {
    inputClosePin.value = inputCloseUsername.value = '';
    containerApp.style.opacity = '0';
    labelWelcome.textContent = `Goodbye ${currentAccount.owner.split(' ')[0]}!`;
  }
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
