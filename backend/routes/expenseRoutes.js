const express = require("express");
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require("../controllers/expenseController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
const manageExpenses = authorize("FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST");

router.use(protect);
router.get("/summary", getExpenseSummary);
router.route("/").get(getExpenses).post(manageExpenses, createExpense);
router.route("/:id").get(getExpenseById).patch(manageExpenses, updateExpense).delete(manageExpenses, deleteExpense);

module.exports = router;
