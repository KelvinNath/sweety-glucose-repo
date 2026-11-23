const {
  createReading,
  getReadings,
  updateReading,
  deleteReading,
} = require("../services/reading.service");

async function create(req, res, next) {
  try {
    const { date, slot, value } = req.body;

    const reading = await createReading({
      userId: req.user.userId,
      date,
      slot,
      value,
    });

    res.status(201).json({
      success: true,
      message: "Reading created successfully",
      data: {
        reading,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const readings = await getReadings({
      userId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      data: {
        readings,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { date, slot, value } = req.body;

    const reading = await updateReading({
      readingId: req.params.id,
      userId: req.user.userId,
      date,
      slot,
      value,
    });

    res.status(200).json({
      success: true,
      message: "Reading updated successfully",
      data: {
        reading,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const reading = await deleteReading({
      readingId: req.params.id,
      userId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: "Reading deleted successfully",
      data: {
        reading,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  getAll,
  update,
  remove,
};