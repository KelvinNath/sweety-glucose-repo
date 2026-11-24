const {
  getDailyReport,
  getMtdReport,
  getMonthlyReport,
} = require("../services/report.service");

async function getDaily(req, res, next) {
  try {
    const report = await getDailyReport({
      userId: req.user.userId,
      date: req.query.date,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

async function getMtd(req, res, next) {
  try {
    const report = await getMtdReport({
      userId: req.user.userId,
      date: req.query.date,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

async function getMonthly(req, res, next) {
  try {
    const report = await getMonthlyReport({
      userId: req.user.userId,
      date: req.query.date,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDaily,
  getMtd,
  getMonthly,
};