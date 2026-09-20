// ============================================================
// QUICKTOPUP - COMPLETE FRONTEND SCRIPT
// ============================================================

const PAYSTACK_PUBLIC_KEY =
    "pk_test_8fa4a0e3a20c4479ca01dcb87f1f22fd286728c1";

const BACKEND_URL = window.location.origin;


// ============================================================
// STORAGE
// ============================================================

function getUsers() {
    try {
        return JSON.parse(
            localStorage.getItem("quickTopUpUsers") || "[]"
        );
    } catch (error) {
        console.error("Could not read users:", error);
        return [];
    }
}


function saveUsers(users) {
    localStorage.setItem(
        "quickTopUpUsers",
        JSON.stringify(users)
    );
}


function getCurrentUser() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "quickTopUpCurrentUser"
            ) || "null"
        );
    } catch (error) {
        console.error(
            "Could not read current user:",
            error
        );

        return null;
    }
}


function saveCurrentUser(user) {
    localStorage.setItem(
        "quickTopUpCurrentUser",
        JSON.stringify(user)
    );
}


function clearCurrentUser() {
    localStorage.removeItem(
        "quickTopUpCurrentUser"
    );
}


// ============================================================
// BALANCE
// ============================================================

function getLocalBalance(user) {
    return Number(
        user?.balance || 0
    );
}


function updateLocalUserBalance(
    newBalance
) {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {
        return;
    }

    currentUser.balance =
        Number(newBalance) || 0;

    saveCurrentUser(
        currentUser
    );

    const users =
        getUsers();

    const index =
        users.findIndex(
            user =>
                String(user.id) ===
                String(currentUser.id)
        );

    if (index !== -1) {

        users[index].balance =
            Number(newBalance) || 0;

        saveUsers(users);
    }
}


function formatCurrency(amount) {

    return (
        "₦" +
        Number(amount || 0).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );
}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "QuickTopUp script loaded."
        );

        initializeRegistration();
        initializeLogin();
        initializeDashboard();
        initializeFundWallet();
        initializePaymentPage();
        initializeBuyData();
        initializeBuyAirtime();
        initializeLogout();
        protectPages();
    }
);


// ============================================================
// REGISTER
// ============================================================

function initializeRegistration() {

    const form =
        document.getElementById(
            "registerForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const fullName =
                (
                    document.getElementById(
                        "fullName"
                    )?.value || ""
                ).trim();

            const email =
                (
                    document.getElementById(
                        "email"
                    )?.value || ""
                ).trim().toLowerCase();

            const phone =
                (
                    document.getElementById(
                        "phone"
                    )?.value || ""
                ).trim();

            const password =
                (
                    document.getElementById(
                        "password"
                    )?.value || ""
                ).trim();

            if (
                !fullName ||
                !email ||
                !phone ||
                !password
            ) {

                alert(
                    "Please fill in all fields."
                );

                return;
            }

            if (
                !/^\S+@\S+\.\S+$/.test(
                    email
                )
            ) {

                alert(
                    "Please enter a valid email address."
                );

                return;
            }

            if (
                !/^0\d{10}$/.test(
                    phone
                )
            ) {

                alert(
                    "Please enter a valid Nigerian phone number."
                );

                return;
            }

            if (
                password.length < 6
            ) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;
            }

            const users =
                getUsers();

            if (
                users.some(
                    user =>
                        user.email ===
                        email
                )
            ) {

                alert(
                    "An account with this email already exists."
                );

                return;
            }

            const newUser = {

                id:
                    Date.now().toString(),

                fullName:
                    fullName,

                email:
                    email,

                phone:
                    phone,

                password:
                    password,

                balance:
                    0,

                transactions:
                    []
            };

            users.push(
                newUser
            );

            saveUsers(
                users
            );

            saveCurrentUser(
                newUser
            );

            alert(
                "Account created successfully!"
            );

            window.location.href =
                "dashboard.html";
        }
    );
}


// ============================================================
// LOGIN
// ============================================================

function initializeLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const email =
                (
                    document.getElementById(
                        "loginEmail"
                    )?.value || ""
                ).trim().toLowerCase();

            const password =
                (
                    document.getElementById(
                        "loginPassword"
                    )?.value || ""
                ).trim();

            if (
                !email ||
                !password
            ) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }

            const users =
                getUsers();

            const user =
                users.find(
                    item =>
                        item.email ===
                            email &&
                        item.password ===
                            password
                );

            if (!user) {

                alert(
                    "Incorrect email or password."
                );

                return;
            }

            saveCurrentUser(
                user
            );

            window.location.href =
                "dashboard.html";
        }
    );
}


// ============================================================
// DASHBOARD
// ============================================================

function initializeDashboard() {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {
        return;
    }

    const dashboardName =
        document.getElementById(
            "dashboard-user-name"
        );

    const welcomeName =
        document.getElementById(
            "welcome-user-name"
        );

    const walletBalance =
        document.getElementById(
            "wallet-balance"
        );

    const accountFullName =
        document.getElementById(
            "accountFullName"
        );

    const accountEmail =
        document.getElementById(
            "accountEmail"
        );

    const accountPhone =
        document.getElementById(
            "accountPhone"
        );

    if (dashboardName) {

        dashboardName.textContent =
            currentUser.fullName ||
            "User";
    }

    if (welcomeName) {

        welcomeName.textContent =
            currentUser.fullName ||
            "User";
    }

    if (accountFullName) {

        accountFullName.textContent =
            currentUser.fullName ||
            "Not available";
    }

    if (accountEmail) {

        accountEmail.textContent =
            currentUser.email ||
            "Not available";
    }

    if (accountPhone) {

        accountPhone.textContent =
            currentUser.phone ||
            "Not available";
    }

    if (walletBalance) {

        walletBalance.textContent =
            formatCurrency(
                getLocalBalance(
                    currentUser
                )
            );
    }

    loadServerWalletBalance();

    renderTransactions();

    checkPendingDataTransactions();
}


// ============================================================
// SERVER WALLET
// ============================================================

async function loadServerWalletBalance() {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {
        return;
    }

    try {

        const response =
            await fetch(
                `${BACKEND_URL}/api/wallet/${encodeURIComponent(currentUser.id)}`
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {

            console.log(
                "Could not load server wallet:",
                result
            );

            return;
        }

        const serverBalance =
            Number(
                result.balance || 0
            );

        updateLocalUserBalance(
            serverBalance
        );

        const walletBalance =
            document.getElementById(
                "wallet-balance"
            );

        if (walletBalance) {

            walletBalance.textContent =
                formatCurrency(
                    serverBalance
                );
        }

        renderTransactions();

        console.log(
            "Server wallet balance:",
            serverBalance
        );

    } catch (error) {

        console.error(
            "Server wallet error:",
            error
        );
    }
}


// ============================================================
// LOGOUT
// ============================================================

function initializeLogout() {

    const logoutButton =
        document.getElementById(
            "logout-button"
        );

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        () => {

            clearCurrentUser();

            window.location.href =
                "login.html";
        }
    );
}


// ============================================================
// FUND WALLET
// ============================================================

function initializeFundWallet() {

    const amountInput =
        document.getElementById(
            "amount"
        );

    const continueButton =
        document.getElementById(
            "continuePayment"
        );

    if (
        !amountInput ||
        !continueButton
    ) {
        return;
    }

    const quickButtons =
        document.querySelectorAll(
            "[data-amount]"
        );

    quickButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const amount =
                        Number(
                            button.dataset.amount
                        );

                    if (
                        Number.isFinite(
                            amount
                        ) &&
                        amount > 0
                    ) {

                        amountInput.value =
                            amount;

                        quickButtons.forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                        button.classList.add(
                            "active"
                        );
                    }
                }
            );
        }
    );

    continueButton.addEventListener(
        "click",
        () => {

            const amount =
                Number(
                    amountInput.value
                );

            if (
                !Number.isFinite(
                    amount
                ) ||
                amount <= 0
            ) {

                alert(
                    "Please enter a valid amount."
                );

                return;
            }

            if (
                amount < 100
            ) {

                alert(
                    "Minimum wallet funding amount is ₦100."
                );

                return;
            }

            sessionStorage.setItem(
                "quickTopUpPaymentAmount",
                String(amount)
            );

            window.location.href =
                "payment.html";
        }
    );
}


// ============================================================
// PAYMENT PAGE
// ============================================================

function initializePaymentPage() {

    const paymentAmountElement =
        document.getElementById(
            "paymentAmount"
        );

    const payButton =
        document.getElementById(
            "payButton"
        );

    if (
        !paymentAmountElement ||
        !payButton
    ) {
        return;
    }

    const storedAmount =
        Number(
            sessionStorage.getItem(
                "quickTopUpPaymentAmount"
            ) || 0
        );

    paymentAmountElement.textContent =
        formatCurrency(
            storedAmount
        );

    if (
        !storedAmount ||
        storedAmount <= 0
    ) {

        payButton.disabled =
            true;

        return;
    }

    payButton.addEventListener(
        "click",
        () => {

            startPaystackPayment(
                storedAmount
            );
        }
    );
}


// ============================================================
// PAYSTACK
// ============================================================

function startPaystackPayment(
    amount
) {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {

        alert(
            "Please log in before funding your wallet."
        );

        window.location.href =
            "login.html";

        return;
    }

    if (!window.PaystackPop) {

        alert(
            "Paystack could not be loaded. Please refresh the page."
        );

        return;
    }

    const reference =
        "QT_" +
        Date.now() +
        "_" +
        Math.floor(
            Math.random() * 100000
        );

    const popup =
        new PaystackPop();

    popup.newTransaction({

        key:
            PAYSTACK_PUBLIC_KEY,

        email:
            currentUser.email,

        amount:
            Number(amount) * 100,

        currency:
            "NGN",

        reference:
            reference,

        metadata: {

            user_id:
                String(
                    currentUser.id
                )
        },

        onSuccess:
            async transaction => {

                await verifyPaystackPayment(
                    transaction.reference,
                    amount,
                    currentUser
                );
            },

        onCancel:
            () => {

                alert(
                    "Payment cancelled."
                );
            }
    });
}


// ============================================================
// PAYSTACK VERIFY
// ============================================================

async function verifyPaystackPayment(
    reference,
    amount,
    currentUser
) {

    try {

        alert(
            "Payment completed. Verifying your payment..."
        );

        const response =
            await fetch(
                `${BACKEND_URL}/api/paystack/verify`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            reference:
                                reference,

                            userId:
                                String(
                                    currentUser.id
                                )
                        })
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Payment verification failed."
            );

            return;
        }

        const verifiedAmount =
            Number(
                result.amount || 0
            );

        if (
            verifiedAmount !==
            Number(amount)
        ) {

            alert(
                "The verified payment amount does not match the amount requested."
            );

            return;
        }

        updateLocalUserBalance(
            Number(
                result.balance || 0
            )
        );

        addTransaction({

            id:
                reference,

            type:
                "Wallet Funding",

            description:
                "Wallet funded via Paystack",

            amount:
                Number(amount),

            status:
                "Successful",

            reference:
                reference,

            createdAt:
                new Date().toISOString()
        });

        sessionStorage.removeItem(
            "quickTopUpPaymentAmount"
        );

        alert(
            "Payment verified successfully!"
        );

        window.location.href =
            "dashboard.html";

    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );

        alert(
            "Could not connect to the QuickTopUp server."
        );
    }
}


// ============================================================
// TRANSACTIONS
// ============================================================

function getTransactions() {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {
        return [];
    }

    return Array.isArray(
        currentUser.transactions
    )
        ? currentUser.transactions
        : [];
}


function saveTransactions(
    transactions
) {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {
        return;
    }

    currentUser.transactions =
        transactions;

    saveCurrentUser(
        currentUser
    );

    const users =
        getUsers();

    const index =
        users.findIndex(
            user =>
                String(user.id) ===
                String(currentUser.id)
        );

    if (index !== -1) {

        users[index].transactions =
            transactions;

        saveUsers(users);
    }
}


function addTransaction(
    transaction
) {

    const transactions =
        getTransactions();

    transactions.unshift(
        transaction
    );

    saveTransactions(
        transactions
    );

    renderTransactions();
}


function renderTransactions() {

    const transactionList =
        document.getElementById(
            "transactions-list"
        );

    if (!transactionList) {
        return;
    }

    const transactions =
        getTransactions();

    if (
        transactions.length === 0
    ) {

        transactionList.innerHTML = `
            <div class="empty-transactions">
                <p>No transactions yet.</p>
            </div>
        `;

        return;
    }

    transactionList.innerHTML =
        transactions
            .map(
                transaction => {

                    const date =
                        transaction.createdAt
                            ? new Date(
                                transaction.createdAt
                            ).toLocaleString(
                                "en-NG"
                            )
                            : "Recently";

                    return `
                        <div class="transaction-item">

                            <div>
                                <strong>
                                    ${escapeHTML(
                                        transaction.description ||
                                        transaction.type ||
                                        "Transaction"
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        date
                                    )}
                                </small>
                            </div>

                            <div>
                                <strong>
                                    ${formatCurrency(
                                        transaction.amount
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        transaction.status ||
                                        "Pending"
                                    )}
                                </small>
                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(
            value ?? ""
        );

    return div.innerHTML;
}


// ============================================================
// BUY DATA
// ============================================================

async function initializeBuyData() {

    const buyDataButton =
        document.getElementById(
            "buyDataButton"
        );

    const dataPlan =
        document.getElementById(
            "dataPlan"
        );

    const phoneInput =
        document.getElementById(
            "phone"
        );

    const planInfo =
        document.getElementById(
            "planInfo"
        );

    if (
        !buyDataButton ||
        !dataPlan
    ) {
        return;
    }


    const networkButtons =
        document.querySelectorAll(
            ".network-button[data-network]"
        );


    networkButtons.forEach(
        button => {

            if (
                button.disabled
            ) {
                return;
            }

            button.addEventListener(
                "click",
                async () => {

                    networkButtons.forEach(
                        item =>
                            item.classList.remove(
                                "selected"
                            )
                    );

                    button.classList.add(
                        "selected"
                    );

                    await loadVTUGatePlans(
                        button.dataset.serviceId
                    );
                }
            );
        }
    );


    const selectedNetwork =
        document.querySelector(
            ".network-button[data-network].selected"
        );


    if (
        selectedNetwork &&
        selectedNetwork.dataset.serviceId
    ) {

        await loadVTUGatePlans(
            selectedNetwork.dataset.serviceId
        );
    }


    dataPlan.addEventListener(
        "change",
        () => {

            const option =
                dataPlan.options[
                    dataPlan.selectedIndex
                ];

            if (
                !option ||
                !option.value
            ) {

                if (planInfo) {

                    planInfo.innerHTML =
                        "Select a plan to view its details.";
                }

                return;
            }

            const price =
                Number(
                    option.dataset.price
                );

            const serviceId =
                option.dataset.serviceId;

            const planCode =
                option.dataset.planCode;

            const planName =
                option.dataset.planName ||
                option.textContent.trim();

            if (planInfo) {

                planInfo.innerHTML =
                    `
                    <strong>Plan:</strong>
                    ${escapeHTML(planName)}
                    &nbsp; | &nbsp;

                    <strong>Price:</strong>
                    ${formatCurrency(price)}
                    &nbsp; | &nbsp;

                    <strong>Service ID:</strong>
                    ${escapeHTML(serviceId)}
                    &nbsp; | &nbsp;

                    <strong>Code:</strong>
                    ${escapeHTML(planCode)}
                    `;
            }
        }
    );


    buyDataButton.addEventListener(
        "click",
        async () => {

            const currentUser =
                getCurrentUser();

            if (!currentUser) {

                showDataMessage(
                    "Please log in before buying data.",
                    "error"
                );

                return;
            }


            const selectedNetwork =
                document.querySelector(
                    ".network-button[data-network].selected"
                );


            if (!selectedNetwork) {

                showDataMessage(
                    "Please select a network.",
                    "error"
                );

                return;
            }


            const phone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";


            if (
                !/^0\d{10}$/.test(
                    phone
                )
            ) {

                showDataMessage(
                    "Please enter a valid Nigerian phone number.",
                    "error"
                );

                return;
            }


            const selectedOption =
                dataPlan.options[
                    dataPlan.selectedIndex
                ];


            if (
                !selectedOption ||
                !selectedOption.value
            ) {

                showDataMessage(
                    "Please select a data plan.",
                    "error"
                );

                return;
            }


            const serviceId =
                Number(
                    selectedOption.dataset.serviceId
                );

            const planCode =
                selectedOption.dataset.planCode;

            const price =
                Number(
                    selectedOption.dataset.price
                );

            const planName =
                selectedOption.dataset.planName ||
                selectedOption.textContent.trim();


            if (
                !Number.isInteger(
                    serviceId
                ) ||
                !planCode ||
                !Number.isFinite(price)
            ) {

                showDataMessage(
                    "Invalid data plan.",
                    "error"
                );

                return;
            }


            let currentBalance;

            try {

                const walletResponse =
                    await fetch(
                        `${BACKEND_URL}/api/wallet/${encodeURIComponent(currentUser.id)}`
                    );

                const walletResult =
                    await walletResponse.json();

                if (
                    !walletResponse.ok ||
                    !walletResult.success
                ) {

                    showDataMessage(
                        "Could not check your wallet balance.",
                        "error"
                    );

                    return;
                }

                currentBalance =
                    Number(
                        walletResult.balance || 0
                    );

                updateLocalUserBalance(
                    currentBalance
                );

            } catch (error) {

                console.error(
                    "Wallet check error:",
                    error
                );

                showDataMessage(
                    "Could not connect to the wallet server.",
                    "error"
                );

                return;
            }


            if (
                currentBalance <
                price
            ) {

                showDataMessage(
                    `Insufficient wallet balance. You need ${formatCurrency(price)} but your balance is ${formatCurrency(currentBalance)}.`,
                    "error"
                );

                return;
            }


            const originalText =
                buyDataButton.textContent;

            buyDataButton.disabled =
                true;

            buyDataButton.textContent =
                "Processing...";


            showDataMessage(
                "Sending your data purchase...",
                "info"
            );


            try {

                const response =
                    await fetch(
                        `${BACKEND_URL}/api/buy-data`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        String(
                                            currentUser.id
                                        ),

                                    network:
                                        selectedNetwork.dataset.network,

                                    phone:
                                        phone,

                                    plan:
                                        planName,

                                    serviceId:
                                        serviceId,

                                    planCode:
                                        planCode
                                })
                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    showDataMessage(
                        result.message ||
                        "Data purchase failed.",
                        "error"
                    );

                    buyDataButton.disabled =
                        false;

                    buyDataButton.textContent =
                        originalText;

                    return;
                }


                const newBalance =
                    Number(
                        result.balance ??
                        currentBalance
                    );


                updateLocalUserBalance(
                    newBalance
                );


                addTransaction({

                    id:
                        result.transactionId,

                    type:
                        "Data Purchase",

                    description:
                        `${selectedNetwork.dataset.network} ${planName} to ${phone}`,

                    amount:
                        price,

                    status:
                        result.status ===
                            "success"
                            ? "Successful"
                            : "Pending",

                    reference:
                        result.transactionId,

                    createdAt:
                        new Date().toISOString()
                });


                showDataMessage(
                    result.status ===
                        "success"
                        ? "Data purchase successful!"
                        : "Data purchase is pending.",
                    result.status ===
                        "success"
                        ? "success"
                        : "info"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "dashboard.html";

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "Buy Data error:",
                    error
                );

                showDataMessage(
                    "Could not connect to the QuickTopUp server.",
                    "error"
                );

                buyDataButton.disabled =
                    false;

                buyDataButton.textContent =
                    originalText;
            }
        }
    );
}


// ============================================================
// LOAD VTUGATE PLANS
// ============================================================

async function loadVTUGatePlans(
    serviceId
) {

    const dataPlan =
        document.getElementById(
            "dataPlan"
        );

    const planInfo =
        document.getElementById(
            "planInfo"
        );

    if (
        !dataPlan ||
        !serviceId
    ) {
        return;
    }


    try {

        dataPlan.disabled =
            true;


        dataPlan.innerHTML = `
            <option value="">
                Loading MTN data plans...
            </option>
        `;


        const response =
            await fetch(
                `${BACKEND_URL}/api/vtugate/plans/${encodeURIComponent(serviceId)}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Could not load data plans."
            );
        }


        const plans =
            Array.isArray(
                result.plans
            )
                ? result.plans
                : [];


        dataPlan.innerHTML = `
            <option value="">
                Select a data plan
            </option>
        `;


        plans.forEach(
            plan => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(
                        plan.code
                    );

                option.dataset.planCode =
                    String(
                        plan.code
                    );

                option.dataset.serviceId =
                    String(
                        serviceId
                    );

                option.dataset.price =
                    String(
                        plan.price
                    );

                option.dataset.planName =
                    String(
                        plan.name
                    );

                option.textContent =
                    `${plan.name} - ${formatCurrency(plan.price)}`;


                dataPlan.appendChild(
                    option
                );
            }
        );


        dataPlan.disabled =
            false;


        if (planInfo) {

            planInfo.innerHTML =
                "Plans loaded from VTUGATE successfully.";
        }

    } catch (error) {

        console.error(
            "VTUGATE plans error:",
            error
        );

        dataPlan.innerHTML = `
            <option value="">
                Unable to load plans
            </option>
        `;

        if (planInfo) {

            planInfo.innerHTML =
                "Could not load VTUGATE plans.";
        }
    }
}


// ============================================================
// BUY AIRTIME
// ============================================================

function initializeBuyAirtime() {

    const buyAirtimeButton =
        document.getElementById(
            "buyAirtimeButton"
        );

    const phoneInput =
        document.getElementById(
            "airtimePhone"
        );

    const amountInput =
        document.getElementById(
            "airtimeAmount"
        );

    const message =
        document.getElementById(
            "airtimeMessage"
        );


    if (
        !buyAirtimeButton ||
        !phoneInput ||
        !amountInput
    ) {

        return;
    }


    // --------------------------------------------------------
    // NETWORK BUTTONS
    // --------------------------------------------------------

    const networkButtons =
        document.querySelectorAll(
            ".network-button[data-network]"
        );


    networkButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    networkButtons.forEach(
                        item =>
                            item.classList.remove(
                                "selected"
                            )
                    );

                    button.classList.add(
                        "selected"
                    );

                    console.log(
                        "Selected airtime network:",
                        button.dataset.network
                    );
                }
            );
        }
    );


    // --------------------------------------------------------
    // QUICK AMOUNT BUTTONS
    // --------------------------------------------------------

    const amountButtons =
        document.querySelectorAll(
            "[data-airtime-amount]"
        );


    amountButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const amount =
                        Number(
                            button.dataset.airtimeAmount
                        );

                    if (
                        Number.isFinite(
                            amount
                        ) &&
                        amount > 0
                    ) {

                        amountInput.value =
                            amount;


                        amountButtons.forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                        button.classList.add(
                            "active"
                        );
                    }
                }
            );
        }
    );


    // --------------------------------------------------------
    // BUY AIRTIME
    // --------------------------------------------------------

    buyAirtimeButton.addEventListener(
        "click",
        async () => {

            const currentUser =
                getCurrentUser();


            if (!currentUser) {

                showAirtimeMessage(
                    "Please log in before buying airtime.",
                    "error"
                );

                return;
            }


            const selectedNetwork =
                document.querySelector(
                    ".network-button[data-network].selected"
                );


            if (!selectedNetwork) {

                showAirtimeMessage(
                    "Please select a network.",
                    "error"
                );

                return;
            }


            const phone =
                phoneInput.value.trim();


            const amount =
                Number(
                    amountInput.value
                );


            if (
                !/^0\d{10}$/.test(
                    phone
                )
            ) {

                showAirtimeMessage(
                    "Please enter a valid Nigerian phone number.",
                    "error"
                );

                return;
            }


            if (
                !Number.isFinite(
                    amount
                ) ||
                amount < 50
            ) {

                showAirtimeMessage(
                    "Please enter an airtime amount of at least ₦50.",
                    "error"
                );

                return;
            }


            // ------------------------------------------------
            // CHECK SERVER WALLET
            // ------------------------------------------------

            let currentBalance;


            try {

                const walletResponse =
                    await fetch(
                        `${BACKEND_URL}/api/wallet/${encodeURIComponent(currentUser.id)}`
                    );


                const walletResult =
                    await walletResponse.json();


                if (
                    !walletResponse.ok ||
                    !walletResult.success
                ) {

                    showAirtimeMessage(
                        "Could not check your wallet balance.",
                        "error"
                    );

                    return;
                }


                currentBalance =
                    Number(
                        walletResult.balance || 0
                    );


                updateLocalUserBalance(
                    currentBalance
                );


            } catch (error) {

                console.error(
                    "Airtime wallet check error:",
                    error
                );


                showAirtimeMessage(
                    "Could not connect to the wallet server.",
                    "error"
                );


                return;
            }


            if (
                currentBalance <
                amount
            ) {

                showAirtimeMessage(
                    `Insufficient wallet balance. You need ${formatCurrency(amount)} but your balance is ${formatCurrency(currentBalance)}.`,
                    "error"
                );

                return;
            }


            // ------------------------------------------------
            // PROCESS
            // ------------------------------------------------

            const originalText =
                buyAirtimeButton.textContent;


            buyAirtimeButton.disabled =
                true;


            buyAirtimeButton.textContent =
                "Processing...";


            showAirtimeMessage(
                "Sending your airtime purchase...",
                "info"
            );


            try {

                const response =
                    await fetch(
                        `${BACKEND_URL}/api/buy-airtime`,
                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        String(
                                            currentUser.id
                                        ),

                                    network:
                                        selectedNetwork.dataset.network,

                                    phone:
                                        phone,

                                    amount:
                                        amount
                                })
                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Buy Airtime response:",
                    result
                );


                if (
                    !response.ok ||
                    !result.success
                ) {

                    showAirtimeMessage(
                        result.message ||
                        "Airtime purchase failed.",
                        "error"
                    );


                    buyAirtimeButton.disabled =
                        false;


                    buyAirtimeButton.textContent =
                        originalText;


                    return;
                }


                const newBalance =
                    Number(
                        result.balance ??
                        currentBalance
                    );


                updateLocalUserBalance(
                    newBalance
                );


                const status =
                    String(
                        result.status ||
                        "pending"
                    ).toLowerCase();


                addTransaction({

                    id:
                        result.transactionId ||
                        `AIRTIME_${Date.now()}`,

                    type:
                        "Airtime Purchase",

                    description:
                        `${selectedNetwork.dataset.network} airtime to ${phone}`,

                    amount:
                        amount,

                    status:
                        status ===
                            "success"
                            ? "Successful"
                            : "Pending",

                    reference:
                        result.transactionId ||
                        "",

                    createdAt:
                        new Date().toISOString()
                });


                if (
                    status ===
                    "success"
                ) {

                    showAirtimeMessage(
                        "Airtime purchase successful!",
                        "success"
                    );

                } else {

                    showAirtimeMessage(
                        "Airtime purchase is pending confirmation.",
                        "info"
                    );
                }


                setTimeout(
                    () => {

                        window.location.href =
                            "dashboard.html";

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "Buy Airtime error:",
                    error
                );


                showAirtimeMessage(
                    "Could not connect to the QuickTopUp server.",
                    "error"
                );


                buyAirtimeButton.disabled =
                    false;


                buyAirtimeButton.textContent =
                    originalText;
            }
        }
    );
}


// ============================================================
// AIRTIME MESSAGE
// ============================================================

function showAirtimeMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "airtimeMessage"
        );


    if (!element) {

        alert(message);

        return;
    }


    element.textContent =
        message;


    element.className =
        "message " +
        (type || "info");


    element.style.display =
        "block";
}


// ============================================================
// CHECK PENDING DATA TRANSACTIONS
// ============================================================

async function checkPendingDataTransactions() {

    const transactions =
        getTransactions();


    const pending =
        transactions.filter(
            transaction =>

                transaction.type ===
                    "Data Purchase" &&

                String(
                    transaction.status
                ).toLowerCase() ===
                    "pending" &&

                transaction.reference
        );


    for (
        const transaction
        of pending
    ) {

        await checkSingleDataTransaction(
            transaction.reference
        );
    }
}


// ============================================================
// CHECK ONE DATA TRANSACTION
// ============================================================

async function checkSingleDataTransaction(
    transactionId
) {

    try {

        const response =
            await fetch(
                `${BACKEND_URL}/api/data-status/${encodeURIComponent(transactionId)}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            return;
        }


        const transactions =
            getTransactions();


        const index =
            transactions.findIndex(
                item =>
                    String(
                        item.reference
                    ) ===
                    String(
                        transactionId
                    )
            );


        if (
            index === -1
        ) {

            return;
        }


        if (
            result.status ===
            "success"
        ) {

            transactions[index].status =
                "Successful";

        } else if (
            result.status ===
            "failed"
        ) {

            transactions[index].status =
                "Failed";

        } else {

            transactions[index].status =
                "Pending";
        }


        saveTransactions(
            transactions
        );


        if (
            typeof result.balance ===
            "number"
        ) {

            updateLocalUserBalance(
                result.balance
            );
        }


        renderTransactions();

    } catch (error) {

        console.error(
            "Data transaction check error:",
            error
        );
    }
}


// ============================================================
// PAGE PROTECTION
// ============================================================

function protectPages() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const protectedPages = [

        "dashboard.html",

        "fund-wallet.html",

        "payment.html",

        "buy-data.html",

        "buy-airtime.html"

    ];


    if (
        protectedPages.includes(
            currentPage
        )
    ) {

        const currentUser =
            getCurrentUser();


        if (!currentUser) {

            window.location.href =
                "login.html";
        }
    }
}


// ============================================================
// BUY AIRTIME
// ============================================================

const buyAirtimeButton =
    document.getElementById("buyAirtimeButton");

const airtimePhone =
    document.getElementById("airtimePhone");

const airtimeAmount =
    document.getElementById("airtimeAmount");

const airtimeMessage =
    document.getElementById("airtimeMessage");

const airtimeNetworkButtons =
    document.querySelectorAll(
        ".network-button[data-network]"
    );


// ------------------------------------------------------------
// SELECT NETWORK
// ------------------------------------------------------------

let selectedAirtimeNetwork = null;

airtimeNetworkButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            // Ignore disabled buttons
            if (button.disabled) {
                return;
            }

            airtimeNetworkButtons.forEach(
                item => {
                    item.classList.remove("active");
                }
            );

            button.classList.add("active");

            selectedAirtimeNetwork =
                button.dataset.network;

            if (airtimeMessage) {
                airtimeMessage.textContent = "";
            }

        }
    );

});


// ------------------------------------------------------------
// QUICK AMOUNT BUTTONS
// ------------------------------------------------------------

const quickAirtimeAmounts =
    document.querySelectorAll(
        "[data-airtime-amount]"
    );

quickAirtimeAmounts.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            const amount =
                Number(
                    button.dataset.airtimeAmount
                );

            if (airtimeAmount) {
                airtimeAmount.value = amount;
            }

            if (airtimeMessage) {
                airtimeMessage.textContent = "";
            }

        }
    );

});


// ------------------------------------------------------------
// BUY AIRTIME
// ------------------------------------------------------------

if (buyAirtimeButton) {

    buyAirtimeButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            console.log(
                "Buy Airtime button clicked"
            );


            // ----------------------------------------------
            // LOGIN CHECK
            // ----------------------------------------------

            const user =
                getCurrentUser();

            if (!user) {

                if (airtimeMessage) {

                    airtimeMessage.textContent =
                        "Please login before buying airtime.";

                }

                window.location.href =
                    "login.html";

                return;
            }


            // ----------------------------------------------
            // NETWORK CHECK
            // ----------------------------------------------

            if (!selectedAirtimeNetwork) {

                if (airtimeMessage) {

                    airtimeMessage.textContent =
                        "Please select a network.";

                }

                return;
            }


            // ----------------------------------------------
            // PHONE CHECK
            // ----------------------------------------------

            const phone =
                airtimePhone?.value.trim();

            if (!phone) {

                if (airtimeMessage) {

                    airtimeMessage.textContent =
                        "Please enter a phone number.";

                }

                return;
            }


            // ----------------------------------------------
            // NIGERIAN PHONE VALIDATION
            // ----------------------------------------------

            const normalizedPhone =
                phone.replace(/\s+/g, "");

            const validPhone =
                /^(?:0\d{10}|234\d{10})$/
                    .test(normalizedPhone);

            if (!validPhone) {

                if (airtimeMessage) {

                    airtimeMessage.textContent =
                        "Please enter a valid Nigerian phone number.";

                }

                return;
            }


            // ----------------------------------------------
            // AMOUNT CHECK
            // ----------------------------------------------

            const amount =
                Number(
                    airtimeAmount?.value
                );

            if (!amount || amount < 50) {

                if (airtimeMessage) {

                    airtimeMessage.textContent =
                        "Minimum airtime amount is ₦50.";

                }

                return;
            }


            // ----------------------------------------------
            // BUTTON LOADING
            // ----------------------------------------------

            buyAirtimeButton.disabled = true;

            const originalText =
                buyAirtimeButton.textContent;

            buyAirtimeButton.textContent =
                "Processing...";


            if (airtimeMessage) {

                airtimeMessage.textContent =
                    "Processing airtime purchase...";

            }


            try {

                // ------------------------------------------
                // GET LATEST SERVER WALLET BALANCE
                // ------------------------------------------

                const walletResponse =
                    await fetch(
                        `${BACKEND_URL}/api/wallet/${encodeURIComponent(
                            String(user.id)
                        )}`
                    );


                const walletResult =
                    await walletResponse.json();


                if (
                    !walletResponse.ok ||
                    !walletResult.success
                ) {

                    throw new Error(
                        walletResult.message ||
                        "Could not check wallet balance."
                    );

                }


                const serverBalance =
                    Number(
                        walletResult.balance || 0
                    );


                // ------------------------------------------
                // CHECK BALANCE
                // ------------------------------------------

                if (serverBalance < amount) {

                    if (airtimeMessage) {

                        airtimeMessage.textContent =
                            `Insufficient wallet balance. Your balance is ₦${serverBalance.toLocaleString("en-NG")}.`;

                    }

                    return;
                }


                // ------------------------------------------
                // SEND AIRTIME PURCHASE
                // ------------------------------------------

                const response =
                    await fetch(
                        `${BACKEND_URL}/api/buy-airtime`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        String(user.id),

                                    network:
                                        selectedAirtimeNetwork,

                                    phone:
                                        normalizedPhone,

                                    amount:
                                        amount

                                })
                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Buy Airtime response:",
                    result
                );


                // ------------------------------------------
                // PURCHASE FAILED
                // ------------------------------------------

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Airtime purchase failed."
                    );

                }


                // ------------------------------------------
                // UPDATE LOCAL USER BALANCE
                // ------------------------------------------

                const latestUser =
                    getCurrentUser();

                if (latestUser) {

                    latestUser.balance =
                        Number(
                            result.balance ??
                            (serverBalance - amount)
                        );

                    saveCurrentUser(
                        latestUser
                    );

                    updateUser(
                        latestUser
                    );

                }


                // ------------------------------------------
                // ADD TRANSACTION
                // ------------------------------------------

                addTransaction(
                    "Airtime",
                    -amount,
                    `${selectedAirtimeNetwork} airtime - ${normalizedPhone}`,
                    "Successful"
                );


                // ------------------------------------------
                // SUCCESS MESSAGE
                // ------------------------------------------

                if (airtimeMessage) {

                    airtimeMessage.textContent =
                        result.message ||
                        "Airtime purchased successfully!";

                }


                // Clear amount
                if (airtimeAmount) {
                    airtimeAmount.value = "";
                }


            } catch (error) {

                console.error(
                    "Airtime purchase error:",
                    error
                );


                if (airtimeMessage) {

                    airtimeMessage.textContent =
                        error.message ||
                        "Could not connect to the server.";

                }

            } finally {

                buyAirtimeButton.disabled =
                    false;

                buyAirtimeButton.textContent =
                    originalText;

            }

        }
    );

}