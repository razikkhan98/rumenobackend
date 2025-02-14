const asyncHandler = require("express-async-handler");
const transaction = require("../../model/user/transactionModel");

exports.getDashboardDetails = asyncHandler(async (req, res) => {
    try {
        const calculateTotalAmount = (transactions) =>
            transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);

        // Get total transactions for the last 7 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const totalTransactions = await transaction.find({
            createdAt: { $gte: startDate, $lte: endDate },
        });
        const totalPayment = calculateTotalAmount(totalTransactions);


        // Last 6 months transaction data
        const sixMonthTransactions = [];
        for (let i = 0; i < 6; i++) {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - i, 1);
            monthStart.setHours(0, 0, 0, 0);

            const monthEnd = new Date();
            monthEnd.setMonth(monthEnd.getMonth() - i + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);

            const monthlyTransactions = await transaction.find({
                createdAt: { $gte: monthStart, $lte: monthEnd },
            });

            sixMonthTransactions.push({
                date: new Intl.DateTimeFormat("en", { month: "short" }).format(monthStart),
                totalAmount: calculateTotalAmount(monthlyTransactions),
            });
        }

        // Get latest transaction
        const latestTransaction = await transaction
            .find()
            .sort({ _id: -1 })
            .limit(1);

        // Total sales: Sum of cart lengths from all transactions
        const allTransactions = await transaction.find({});
        const totalSales = allTransactions.reduce(
            (sum, txn) => sum + txn.cart.length,
            0
        );


        // Bar Graph Data: Count occurrences of product names
        const barGraphData = await transaction.aggregate([
            {
                $unwind: "$cart",
            },
            {
                $project: {
                    productName: {
                        $arrayElemAt: [{ $split: ["$cart.name", " "] }, 0],
                    },
                },
            },
            {
                $group: {
                    _id: "$productName",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    name: "$_id",
                    Products: "$count",
                    _id: 0,
                },
            },
        ]);
        console.log(barGraphData)


        // Pie Chart Data: Group total transaction amounts by 4-day periods over the last 24 days
        const pieChartData = [];
        for (let i = 0; i < 24; i += 4) {
            let totalAmount = 0;
            for (let j = 0; j < 4; j++) {
                const dayStart = new Date();
                dayStart.setDate(dayStart.getDate() - i - j);
                dayStart.setHours(0, 0, 0, 0);

                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                const dailyTransactions = await transaction.find({
                    createdAt: { $gte: dayStart, $lte: dayEnd },
                });

                totalAmount += calculateTotalAmount(dailyTransactions);
            }
            pieChartData.push({ value: totalAmount });
        }

        // Send the dashboard data
        res.send({
            sixMonth: sixMonthTransactions,
            lastTransaction: latestTransaction[0]?.amount,
            totalSales,
            totalPayment,
            barGraph: barGraphData,
            pieChart: pieChartData,
        });

    } catch (error) {
        res.status(400).json({ message: "Server Error", error: error.message });
    }
});