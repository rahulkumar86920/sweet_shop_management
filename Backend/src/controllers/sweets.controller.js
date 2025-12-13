import Sweet from '../models/Sweet.js';

export const createSweet = async (req, res) => {
  try {
    const { name, description, price, quantity, category, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: 'Name, description, price, and category are required' });
    }

    const sweet = new Sweet({
      name,
      description,
      price,
      quantity: quantity || 0,
      category,
      imageUrl: imageUrl || ''
    });

    await sweet.save();
    res.status(201).json(sweet);
  } catch (error) {
    console.error('Create sweet error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getAllSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(sweets);
  } catch (error) {
    console.error('Get sweets error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const searchSweets = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const sweets = await Sweet.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    });

    res.json(sweets);
  } catch (error) {
    console.error('Search sweets error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove immutable fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.soldCount;

    const sweet = await Sweet.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json(sweet);
  } catch (error) {
    console.error('Update sweet error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    const sweet = await Sweet.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet || !sweet.isActive) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }

    sweet.quantity -= quantity;
    sweet.soldCount += quantity;
    await sweet.save();

    res.json(sweet);
  } catch (error) {
    console.error('Purchase sweet error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet || !sweet.isActive) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    sweet.quantity += quantity;
    await sweet.save();

    res.json(sweet);
  } catch (error) {
    console.error('Restock sweet error:', error);
    res.status(400).json({ error: error.message });
  }
};