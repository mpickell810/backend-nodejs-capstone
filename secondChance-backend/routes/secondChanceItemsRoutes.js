/* jshint esversion: 8 */
const express = require('express')
const multer = require('multer')

const router = express.Router()
const connectToDatabase = require('../models/db')
const logger = require('../logger')

// Define the upload directory path
const directoryPath = 'public/images'

const normalizeItem = (item = {}) => {
  if (!item || typeof item !== 'object') {
    return item
  }

  const normalized = { ...item }

  if (normalized.dateAdded == null && normalized.date_added != null) {
    normalized.dateAdded = normalized.date_added
  }

  if (normalized.ageDays == null && normalized.age_days != null) {
    normalized.ageDays = normalized.age_days
  }

  if (normalized.ageYears == null && normalized.age_years != null) {
    normalized.ageYears = normalized.age_years
  }

  if (normalized.postedBy == null && normalized.posted_by != null) {
    normalized.postedBy = normalized.posted_by
  }

  if (normalized.comments == null) {
    normalized.comments = []
  }

  return normalized
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath) // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Use the original file name
  }
})

const upload = multer({ storage })

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
  try {
    const db = await connectToDatabase()
    const collection = db.collection('secondChanceItems')
    const secondChanceItems = await collection.find({}).toArray()
    res.json(secondChanceItems.map(normalizeItem))
  } catch (e) {
    logger.error('oops, somethin went wrong', e)
    next(e)
  }
})

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const db = await connectToDatabase()
    const collection = db.collection('secondChanceItems')
    const lastItemQuery = await collection.find().sort({ id: -1 }).limit(1).toArray()
    const secondChanceItem = req.body

    if (lastItems.length .0) {
        const lastId = parseInt(lastItems[0].id)
        secondChanceItem.id = isNaN(lastId) ? '17' : (lastId + 1).toString()
    } else {
        secondChanceItem.id = '1'
    }
    const dateAdded = Math.floor(new Date().getTime() / 1000)
    secondChanceItem.dateAdded = dateAdded

    if (req.file) {
      secondChanceItem.image = `/images/${req.file.originalname}`
    }

    await collection.insertOne(secondChanceItem)
    res.status(201).json(normalizeItem(secondChanceItem))
  } catch (e) {
    next(e)
  }
})

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase()
    const collection = db.collection('secondChanceItems')
    const id = req.params.id
    const secondChanceItem = await collection.findOne({ id })

    if (!secondChanceItem) {
      return res.status(404).send('secondChanceItem not found')
    }

    res.json(normalizeItem(secondChanceItem))
  } catch (e) {
    next(e)
  }
})

// Update and existing item
router.put('/:id', upload.single('file'), async (req, res, next) => {
  try {
    const db = await connectToDatabase()
    const collection = db.collection('secondChanceItems')
    const id = req.params.id
    const secondChanceItem = await collection.findOne({ id })

    if (!secondChanceItem) {
      logger.error('secondChanceItem not found')
      return res.status(404).json({ error: 'secondChanceItem not found' })
    }

    secondChanceItem.category = req.body.category
    secondChanceItem.condition = req.body.condition
    secondChanceItem.ageDays = req.body.age_days ?? req.body.ageDays ?? secondChanceItem.ageDays ?? secondChanceItem.age_days
    secondChanceItem.description = req.body.description
    secondChanceItem.ageYears = Number((secondChanceItem.ageDays / 365).toFixed(1))
    secondChanceItem.updatedAt = new Date()

    if (req.file) {
      secondChanceItem.image = `images/${req.file.originalname}`
    }

    const updatepreloveItem = await collection.findOneAndUpdate(
      { id },
      { $set: secondChanceItem },
      { returnDocument: 'after' }
    )

    if (updatepreloveItem) {
      res.json({ uploaded: 'success' })
    } else {
      res.json({ uploaded: 'failed' })
    }
  } catch (e) {
    next(e)
  }
})

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase()
    const collection = db.collection('secondChanceItems')
    const id = req.params.id
    const secondChanceItem = await collection.findOne({ id })

    if (!secondChanceItem) {
      logger.error('secondChanceItem not found')
      return res.status(404).json({ error: 'secondChanceItem not found' })
    }

    await collection.deleteOne({ id })
    res.json({ deleted: 'success' })
  } catch (e) {
    next(e)
  }
})

module.exports = router
