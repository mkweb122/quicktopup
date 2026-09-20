// ============================================================
// QUICKTOPUP BACKEND
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();


// ============================================================
// CONFIGURATION
// ============================================================

const PORT = Number(process.env.PORT) || 10000;

const PAYSTACK_SECRET_KEY =
    process.env.PAYSTACK_SECRET_KEY;

const VTUGATE_API_KEY =
    process.env.VTUGATE_API_KEY;

const VTUGATE_BASE_URL =
    "https://api.vtugate.com";

const DB_FILE =
    path.join(__dirname, "wallets.json");


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    cors()
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.static(__dirname)
);


// ============================================================
// DATABASE HELPERS
// ============================================================

function createEmptyDatabase() {

    return {

        wallets: {},

        payments: {},

        dataPurchases: {},

        airtimePurchases: {}

    };

}


function ensureDatabase() {

    if (!fs.existsSync(DB_FILE)) {

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(
                createEmptyDatabase(),
                null,
                2
            )
        );

    }

}


function readDatabase() {

    ensureDatabase();

    try {

        const raw =
            fs.readFileSync(
                DB_FILE,
                "utf8"
            );

        const db =
            JSON.parse(raw);


        if (!db.wallets) {
            db.wallets = {};
        }

        if (!db.payments) {
            db.payments = {};
        }

        if (!db.dataPurchases) {
            db.dataPurchases = {};
        }

        if (!db.airtimePurchases) {
            db.airtimePurchases = {};
        }


        return db;

    } catch (error) {

        console.error(
            "Database read error:",
            error
        );

        return createEmptyDatabase();

    }

}


function writeDatabase(db) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(
            db,
            null,
            2
        )
    );

}


// ============================================================
// GENERAL HELPERS
// ============================================================

function normalizePhone(phone) {

    let value =
        String(
            phone || ""
        )
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, "");


    // Convert +234xxxxxxxxxx to 0xxxxxxxxxx
    if (
        value.startsWith("+234")
    ) {

        value =
            "0" +
            value.slice(4);

    }


    // Convert 234xxxxxxxxxx to 0xxxxxxxxxx
    if (
        value.startsWith("234") &&
        value.length === 13
    ) {

        value =
            "0" +
            value.slice(3);

    }


    return value;

}


function isValidNigerianPhone(phone) {

    return /^0\d{10}$/.test(
        phone
    );

}


function normalizeNetwork(network) {

    const value =
        String(
            network || ""
        )
        .trim()
        .toUpperCase();


    const allowed = {

        MTN: "MTN",

        AIRTEL: "AIRTEL",

        GLO: "GLO",

        "9MOBILE": "9MOBILE",

        ETISALAT: "9MOBILE"

    };


    return allowed[value] || null;

}


function generateReference(prefix = "QT") {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.floor(
            Math.random() * 10000
        )
            .toString()
            .padStart(4, "0")
    );

}


// ============================================================
// CHECK ENVIRONMENT
// ============================================================

console.log(
    "QuickTopUp backend starting..."
);

console.log(
    "Paystack secret key loaded:",
    PAYSTACK_SECRET_KEY
        ? "YES"
        : "NO"
);

console.log(
    "VTUGATE API key loaded:",
    VTUGATE_API_KEY
        ? "YES"
        : "NO"
);


// ============================================================
// HOME ROUTE
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            message:
                "QuickTopUp backend is running!"

        });

    }
);


// ============================================================
// WALLET BALANCE
// ============================================================

app.get(
    "/api/wallet/:userId",
    (req, res) => {

        const userId =
            String(
                req.params.userId
            );


        const db =
            readDatabase();


        if (
            !db.wallets[userId]
        ) {

            db.wallets[userId] = {

                balance: 0

            };

            writeDatabase(db);

        }


        res.json({

            success: true,

            userId: userId,

            balance:
                Number(
                    db.wallets[userId].balance || 0
                )

        });

    }
);


// ============================================================
// CREATE WALLET IF NEEDED
// ============================================================

app.post(
    "/api/wallet/create",
    (req, res) => {

        const userId =
            String(
                req.body.userId || ""
            );


        if (!userId) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "userId is required."

                });

        }


        const db =
            readDatabase();


        if (
            !db.wallets[userId]
        ) {

            db.wallets[userId] = {

                balance: 0

            };

            writeDatabase(db);

        }


        return res.json({

            success: true,

            balance:
                Number(
                    db.wallets[userId].balance || 0
                )

        });

    }
);


// ============================================================
// PAYSTACK VERIFY
// ============================================================

app.post(
    "/api/paystack/verify",
    async (req, res) => {

        try {

            const reference =
                String(
                    req.body.reference || ""
                ).trim();


            if (!reference) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Payment reference is required."

                    });

            }


            if (!PAYSTACK_SECRET_KEY) {

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Paystack secret key is not configured."

                    });

            }


            const verifyResponse =
                await fetch(
                    `https://api.paystack.co/transaction/verify/${encodeURIComponent(
                        reference
                    )}`,
                    {

                        method: "GET",

                        headers: {

                            Authorization:
                                `Bearer ${PAYSTACK_SECRET_KEY}`,

                            "Content-Type":
                                "application/json"

                        }

                    }
                );


            const verifyResult =
                await verifyResponse.json();


            console.log(
                "Paystack verification:",
                verifyResult
            );


            if (
                !verifyResponse.ok ||
                !verifyResult.status
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            verifyResult.message ||
                            "Paystack verification failed.",

                        paystack:
                            verifyResult

                    });

            }


            const payment =
                verifyResult.data;


            if (
                payment.status !== "success"
            ) {

                return res.json({

                    success: true,

                    message:
                        "Payment has not completed.",

                    payment: {

                        reference:
                            payment.reference,

                        status:
                            payment.status,

                        amount:
                            payment.amount,

                        currency:
                            payment.currency

                    }

                });

            }


            if (
                payment.currency !== "NGN"
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Payment currency must be NGN."

                    });

            }


            const amount =
                Number(
                    payment.amount
                ) / 100;


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Invalid payment amount."

                    });

            }


            const metadata =
                payment.metadata || {};


            const userId =
                String(
                    metadata.user_id ||
                    metadata.userId ||
                    ""
                );


            if (!userId) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Payment is missing the user ID."

                    });

            }


            const db =
                readDatabase();


            // Prevent duplicate credit
            if (
                db.payments[reference]
            ) {

                return res.json({

                    success: true,

                    message:
                        "Payment was already verified.",

                    payment:
                        db.payments[reference]

                });

            }


            if (
                !db.wallets[userId]
            ) {

                db.wallets[userId] = {

                    balance: 0

                };

            }


            const currentBalance =
                Number(
                    db.wallets[userId].balance || 0
                );


            const newBalance =
                currentBalance +
                amount;


            db.wallets[userId].balance =
                newBalance;


            db.payments[reference] = {

                reference:
                    reference,

                userId:
                    userId,

                amount:
                    amount,

                currency:
                    "NGN",

                status:
                    "success",

                email:
                    payment.customer?.email ||
                    "",

                creditedAt:
                    new Date().toISOString()

            };


            writeDatabase(db);


            return res.json({

                success: true,

                message:
                    "Payment verified and wallet credited successfully.",

                payment:
                    db.payments[reference],

                balance:
                    newBalance

            });

        } catch (error) {

            console.error(
                "Paystack verification error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Server error while verifying payment."

                });

        }

    }
);


// ============================================================
// VTUGATE HELPER
// ============================================================

async function callVTUGATE(
    endpoint,
    fields
) {

    if (!VTUGATE_API_KEY) {

        throw new Error(
            "VTUGATE API key is not configured."
        );

    }


    const form =
        new URLSearchParams();


    Object.entries(fields)
        .forEach(
            ([key, value]) => {

                if (
                    value !== undefined &&
                    value !== null
                ) {

                    form.append(
                        key,
                        String(value)
                    );

                }

            }
        );


    console.log(
        "VTUGATE request:",
        endpoint,
        Object.fromEntries(form.entries())
    );


    const response =
        await fetch(
            `${VTUGATE_BASE_URL}${endpoint}`,
            {

                method: "POST",

                headers: {

                    Authorization:
                        `Bearer ${VTUGATE_API_KEY}`,

                    "Content-Type":
                        "application/x-www-form-urlencoded",

                    Accept:
                        "application/json"

                },

                body:
                    form.toString()

            }
        );


    const text =
        await response.text();


    let result;

    try {

        result =
            JSON.parse(text);

    } catch {

        result = {

            status: false,

            message:
                text || "Invalid response from VTUGATE."

        };

    }


    console.log(
        "VTUGATE response status:",
        response.status
    );


    console.log(
        "VTUGATE response:",
        result
    );


    return {

        httpStatus:
            response.status,

        result:
            result

    };

}


// ============================================================
// FETCH DATA PLANS
// ============================================================

app.get(
    "/api/vtugate/plans/:serviceId",
    async (req, res) => {

        try {

            const serviceId =
                String(
                    req.params.serviceId || ""
                ).trim();


            if (!serviceId) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Service ID is required."

                    });

            }


            const vtugate =
                await callVTUGATE(
                    "/api/v1/fetchdataplans",
                    {

                        service_id:
                            serviceId

                    }
                );


            if (
                !vtugate.result ||
                !vtugate.result.status
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            vtugate.result?.message ||
                            "Could not fetch data plans.",

                        vtugate:
                            vtugate.result

                    });

            }


            return res.json({

                success: true,

                data:
                    vtugate.result.data

            });

        } catch (error) {

            console.error(
                "Data plans error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Could not fetch data plans."

                });

        }

    }
);


// ============================================================
// BUY DATA
// ============================================================

app.post(
    "/api/buy-data",
    async (req, res) => {

        try {

            const userId =
                String(
                    req.body.userId || ""
                ).trim();


            const serviceId =
                String(
                    req.body.serviceId ||
                    req.body.service_id ||
                    ""
                ).trim();


            const planCode =
                String(
                    req.body.planCode ||
                    req.body.plan_code ||
                    ""
                ).trim();


            const phone =
                normalizePhone(
                    req.body.phone ||
                    req.body.phone_number
                );


            const amount =
                Number(
                    req.body.amount
                );


            if (!userId) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "User ID is required."

                    });

            }


            if (!serviceId) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Service ID is required."

                    });

            }


            if (!planCode) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Plan code is required."

                    });

            }


            if (
                !isValidNigerianPhone(phone)
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Please enter a valid Nigerian phone number."

                    });

            }


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Invalid data purchase amount."

                    });

            }


            const db =
                readDatabase();


            if (
                !db.wallets[userId]
            ) {

                db.wallets[userId] = {

                    balance: 0

                };

            }


            const balance =
                Number(
                    db.wallets[userId].balance || 0
                );


            if (
                balance < amount
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            `Insufficient wallet balance. Your balance is ₦${balance.toLocaleString("en-NG")}.`

                    });

            }


            const vtugate =
                await callVTUGATE(
                    "/api/v1/buydata",
                    {

                        service_id:
                            serviceId,

                        plan_code:
                            planCode,

                        phone_number:
                            phone,

                        amount:
                            amount

                    }
                );


            const result =
                vtugate.result;


            if (
                !result ||
                !result.status
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            result?.message ||
                            "Data purchase was rejected by VTUGATE.",

                        vtugate:
                            result

                    });

            }


            const providerData =
                result.data || {};


            const providerStatus =
                providerData.provider_status;


            let purchaseStatus =
                "pending";


            if (
                providerStatus === true
            ) {

                purchaseStatus =
                    "success";

            } else if (
                providerStatus === false
            ) {

                purchaseStatus =
                    "failed";

            }


            const transactionId =
                String(
                    providerData.transaction_id ||
                    generateReference("DATA")
                );


            // Only deduct after confirmed success
            if (
                purchaseStatus === "success"
            ) {

                db.wallets[userId].balance =
                    balance - amount;

            }


            db.dataPurchases[
                transactionId
            ] = {

                transactionId:
                    transactionId,

                userId:
                    userId,

                phone:
                    phone,

                serviceId:
                    serviceId,

                planCode:
                    planCode,

                amount:
                    amount,

                status:
                    purchaseStatus,

                providerResponse:
                    result,

                createdAt:
                    new Date().toISOString()

            };


            writeDatabase(db);


            return res.json({

                success:
                    purchaseStatus !== "failed",

                message:
                    result.message ||
                    (
                        purchaseStatus === "success"
                            ? "Data purchase successful."
                            : "Data purchase is pending."
                    ),

                transactionId:
                    transactionId,

                status:
                    purchaseStatus,

                balance:
                    Number(
                        db.wallets[userId].balance || balance
                    ),

                providerResponse:
                    result

            });

        } catch (error) {

            console.error(
                "Data purchase error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Server error during data purchase."

                });

        }

    }
);


// ============================================================
// DATA TRANSACTION STATUS
// ============================================================

app.get(
    "/api/data-status/:transactionId",
    async (req, res) => {

        try {

            const transactionId =
                String(
                    req.params.transactionId || ""
                ).trim();


            if (!transactionId) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Transaction ID is required."

                    });

            }


            const db =
                readDatabase();


            const localTransaction =
                db.dataPurchases[
                    transactionId
                ];


            if (!localTransaction) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Data transaction was not found."

                    });

            }


            const vtugate =
                await callVTUGATE(
                    "/api/v1/transactionstatus",
                    {

                        transaction_id:
                            transactionId

                    }
                );


            const result =
                vtugate.result;


            if (
                result &&
                result.status
            ) {

                const providerData =
                    result.data || {};


                if (
                    providerData.provider_status === true
                ) {

                    localTransaction.status =
                        "success";

                    writeDatabase(db);

                }


                if (
                    providerData.provider_status === false
                ) {

                    localTransaction.status =
                        "failed";

                    writeDatabase(db);

                }

            }


            return res.json({

                success: true,

                transaction:
                    localTransaction,

                vtugate:
                    result

            });

        } catch (error) {

            console.error(
                "Data status error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Could not check data transaction."

                });

        }

    }
);


// ============================================================
// BUY AIRTIME
// ============================================================

app.post(
    "/api/buy-airtime",
    async (req, res) => {

        try {

            console.log(
                "\n=============================="
            );

            console.log(
                "AIRTIME PURCHASE REQUEST"
            );

            console.log(
                req.body
            );


            const userId =
                String(
                    req.body.userId || ""
                ).trim();


            const network =
                normalizeNetwork(
                    req.body.network
                );


            const phone =
                normalizePhone(
                    req.body.phone ||
                    req.body.phone_number
                );


            const amount =
                Number(
                    req.body.amount
                );


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!userId) {

                console.log(
                    "AIRTIME ERROR: Missing userId"
                );

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "User ID is required."

                    });

            }


            if (!network) {

                console.log(
                    "AIRTIME ERROR: Invalid network"
                );

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Please select a valid network: MTN, Airtel, Glo, or 9mobile."

                    });

            }


            if (
                !isValidNigerianPhone(phone)
            ) {

                console.log(
                    "AIRTIME ERROR: Invalid phone:",
                    phone
                );

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Please enter a valid Nigerian phone number."

                    });

            }


            if (
                !Number.isFinite(amount) ||
                amount < 50
            ) {

                console.log(
                    "AIRTIME ERROR: Invalid amount:",
                    amount
                );

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Minimum airtime amount is ₦50."

                    });

            }


            // ------------------------------------------------
            // GET WALLET
            // ------------------------------------------------

            const db =
                readDatabase();


            if (
                !db.wallets[userId]
            ) {

                db.wallets[userId] = {

                    balance: 0

                };

            }


            const walletBalance =
                Number(
                    db.wallets[userId].balance || 0
                );


            console.log(
                "Server wallet balance:",
                walletBalance
            );


            if (
                walletBalance < amount
            ) {

                console.log(
                    "AIRTIME ERROR: Insufficient balance"
                );

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            `Insufficient wallet balance. Your balance is ₦${walletBalance.toLocaleString("en-NG")}.`,

                        balance:
                            walletBalance

                    });

            }


            // ------------------------------------------------
            // CALL VTUGATE
            // ------------------------------------------------

            const vtugate =
                await callVTUGATE(
                    "/api/v1/buyairtime",
                    {

                        network:
                            network,

                        phone:
                            phone,

                        amount:
                            amount

                    }
                );


            const result =
                vtugate.result;


            // ------------------------------------------------
            // VTUGATE REQUEST REJECTED
            // ------------------------------------------------

            if (
                !result ||
                !result.status
            ) {

                const upstreamMessage =
                    result?.message ||
                    "VTUGATE rejected the airtime request.";


                console.log(
                    "AIRTIME ERROR FROM VTUGATE:",
                    upstreamMessage
                );


                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            upstreamMessage,

                        httpStatus:
                            vtugate.httpStatus,

                        vtugate:
                            result

                    });

            }


            // ------------------------------------------------
            // DETERMINE PROVIDER STATUS
            // ------------------------------------------------

            const providerData =
                result.data || {};


            const providerStatus =
                providerData.provider_status;


            let transactionStatus =
                "pending";


            if (
                providerStatus === true
            ) {

                transactionStatus =
                    "success";

            } else if (
                providerStatus === false
            ) {

                transactionStatus =
                    "failed";

            }


            const transactionId =
                String(
                    providerData.transaction_id ||
                    result.transaction_id ||
                    generateReference("AIR")
                );


            // ------------------------------------------------
            // FAILED
            // ------------------------------------------------

            if (
                transactionStatus === "failed"
            ) {

                db.airtimePurchases[
                    transactionId
                ] = {

                    transactionId:
                        transactionId,

                    userId:
                        userId,

                    network:
                        network,

                    phone:
                        phone,

                    amount:
                        amount,

                    status:
                        "failed",

                    providerResponse:
                        result,

                    createdAt:
                        new Date().toISOString()

                };


                writeDatabase(db);


                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            result.message ||
                            "Airtime purchase failed.",

                        transactionId:
                            transactionId,

                        status:
                            "failed",

                        balance:
                            walletBalance,

                        providerResponse:
                            result

                    });

            }


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            if (
                transactionStatus === "success"
            ) {

                db.wallets[userId].balance =
                    walletBalance - amount;

            }


            // ------------------------------------------------
            // SAVE TRANSACTION
            // ------------------------------------------------

            db.airtimePurchases[
                transactionId
            ] = {

                transactionId:
                    transactionId,

                userId:
                    userId,

                network:
                    network,

                phone:
                    phone,

                amount:
                    amount,

                status:
                    transactionStatus,

                providerResponse:
                    result,

                createdAt:
                    new Date().toISOString()

            };


            writeDatabase(db);


            console.log(
                "AIRTIME RESULT:",
                transactionStatus
            );


            console.log(
                "New wallet balance:",
                db.wallets[userId].balance
            );


            // ------------------------------------------------
            // SUCCESS RESPONSE
            // ------------------------------------------------

            return res.json({

                success:
                    true,

                message:
                    result.message ||
                    (
                        transactionStatus === "success"
                            ? "Airtime purchased successfully."
                            : "Airtime purchase is pending."
                    ),

                transactionId:
                    transactionId,

                status:
                    transactionStatus,

                balance:
                    Number(
                        db.wallets[userId].balance
                    ),

                network:
                    network,

                phone:
                    phone,

                amount:
                    amount,

                providerResponse:
                    result

            });

        } catch (error) {

            console.error(
                "AIRTIME SERVER ERROR:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Server error during airtime purchase."

                });

        }

    }
);


// ============================================================
// AIRTIME TRANSACTION STATUS
// ============================================================

app.get(
    "/api/airtime-status/:transactionId",
    async (req, res) => {

        try {

            const transactionId =
                String(
                    req.params.transactionId || ""
                ).trim();


            if (!transactionId) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Transaction ID is required."

                    });

            }


            const db =
                readDatabase();


            const transaction =
                db.airtimePurchases[
                    transactionId
                ];


            if (!transaction) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Airtime transaction was not found."

                    });

            }


            const vtugate =
                await callVTUGATE(
                    "/api/v1/transactionstatus",
                    {

                        transaction_id:
                            transactionId

                    }
                );


            const result =
                vtugate.result;


            if (
                result &&
                result.status
            ) {

                const providerData =
                    result.data || {};


                if (
                    providerData.provider_status === true
                ) {

                    transaction.status =
                        "success";

                    writeDatabase(db);

                }


                if (
                    providerData.provider_status === false
                ) {

                    transaction.status =
                        "failed";

                    writeDatabase(db);

                }

            }


            return res.json({

                success: true,

                transaction:
                    transaction,

                vtugate:
                    result

            });

        } catch (error) {

            console.error(
                "Airtime status error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Could not check airtime transaction."

                });

        }

    }
);


// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Unhandled server error:",
            err
        );


        res
            .status(500)
            .json({

                success: false,

                message:
                    "An unexpected server error occurred."

            });

    }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            ""
        );

        console.log(
            `QuickTopUp backend running on port ${PORT}`
        );

        console.log(
            "Paystack secret key loaded:",
            PAYSTACK_SECRET_KEY
                ? "YES"
                : "NO"
        );

        console.log(
            "VTUGATE API key loaded:",
            VTUGATE_API_KEY
                ? "YES"
                : "NO"
        );

        console.log(
            ""
        );

    }
);