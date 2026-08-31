import * as userQueries from '../queries/user.queries.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userQueries.getAll();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userQueries.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existing = await userQueries.getByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    // TODO: Hash password before storing (use bcrypt)
    const user = await userQueries.create(name, email, password);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const existing = await userQueries.getById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = await userQueries.update(
      req.params.id,
      name || existing.name,
      email || existing.email
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deleted = await userQueries.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
