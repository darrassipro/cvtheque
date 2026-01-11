import { Response } from 'express';
import { Op } from 'sequelize';
import { User, UserRole, UserStatus } from '../models/index.js';
import { AuthenticatedRequest } from '../types/index.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../middleware/errorHandler.js';
import { canModifyUser } from '../middleware/authorize.js';
import { logAudit } from '../middleware/audit.js';
import { AuditAction } from '../models/AuditLog.js';

/**
 * List all users (with pagination and filtering)
 */
export async function listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { page = 1, limit = 20, role, status, search } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const offset = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where[Op.or] = [
      { email: { [Op.like]: `%${search}%` } },
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows: users, count: total } = await User.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: limitNum,
    offset,
    attributes: { exclude: ['password'] },
  });

  res.json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasMore: offset + users.length < total,
    },
  });
}

/**
 * Get a single user by ID
 */
export async function getUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    success: true,
    data: user,
  });
}

/**
 * Create a new user (admin only)
 */
export async function createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { email, password, firstName, lastName, role, status } = req.body;

  // Check if user exists
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ConflictError('A user with this email already exists');
  }

  // Check role permissions
  if (role && req.user) {
    const allowedRoles = getAllowedRolesToCreate(req.user.role);
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenError(`You cannot create users with role: ${role}`);
    }
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: role || UserRole.USER,
    status: status || UserStatus.ACTIVE,
  });

  await logAudit(req, AuditAction.CREATE, 'user', user.id);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user.toJSON(),
  });
}

/**
 * Update a user
 */
export async function updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { firstName, lastName, avatar, status } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Check permissions
  if (req.user && !canModifyUser(req.user.role, user.role, req.user.userId, id)) {
    throw new ForbiddenError('You cannot modify this user');
  }

  await user.update({
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(avatar !== undefined && { avatar }),
    ...(status && { status }),
  });

  await logAudit(req, AuditAction.UPDATE, 'user', user.id);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user.toJSON(),
  });
}

/**
 * Update user role (superadmin/admin only)
 */
export async function updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { role } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Cannot change own role
  if (req.user?.userId === id) {
    throw new ForbiddenError('You cannot change your own role');
  }

  // Check if can assign this role
  if (req.user) {
    const allowedRoles = getAllowedRolesToCreate(req.user.role);
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenError(`You cannot assign role: ${role}`);
    }
  }

  // Check if can modify this user
  if (req.user && !canModifyUser(req.user.role, user.role, req.user.userId, id)) {
    throw new ForbiddenError('You cannot modify this user');
  }

  await user.update({ role });

  await logAudit(req, AuditAction.UPDATE, 'user', user.id, { roleChanged: role });

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: user.toJSON(),
  });
}

/**
 * Delete a user
 */
export async function deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Cannot delete self
  if (req.user?.userId === id) {
    throw new ForbiddenError('You cannot delete your own account');
  }

  // Check permissions
  if (req.user && !canModifyUser(req.user.role, user.role, req.user.userId, id)) {
    throw new ForbiddenError('You cannot delete this user');
  }

  // Cannot delete superadmin
  if (user.role === UserRole.SUPERADMIN) {
    throw new ForbiddenError('Cannot delete superadmin account');
  }

  await logAudit(req, AuditAction.DELETE, 'user', user.id);

  await user.destroy();

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
}

/**
 * Activate a user
 */
export async function activateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User');
  }

  await user.update({ status: UserStatus.ACTIVE });

  await logAudit(req, AuditAction.UPDATE, 'user', user.id, { activated: true });

  res.json({
    success: true,
    message: 'User activated successfully',
    data: user.toJSON(),
  });
}

/**
 * Suspend a user
 */
export async function suspendUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Cannot suspend self
  if (req.user?.userId === id) {
    throw new ForbiddenError('You cannot suspend your own account');
  }

  // Cannot suspend superadmin
  if (user.role === UserRole.SUPERADMIN) {
    throw new ForbiddenError('Cannot suspend superadmin account');
  }

  // Check permissions
  if (req.user && !canModifyUser(req.user.role, user.role, req.user.userId, id)) {
    throw new ForbiddenError('You cannot suspend this user');
  }

  await user.update({ status: UserStatus.SUSPENDED });

  await logAudit(req, AuditAction.UPDATE, 'user', user.id, { suspended: true });

  res.json({
    success: true,
    message: 'User suspended successfully',
    data: user.toJSON(),
  });
}

/**
 * Get roles that a user can create/assign
 */
function getAllowedRolesToCreate(actorRole: UserRole): UserRole[] {
  switch (actorRole) {
    case UserRole.SUPERADMIN:
      return [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER];
    case UserRole.ADMIN:
      return [UserRole.MODERATOR, UserRole.USER];
    case UserRole.MODERATOR:
      return [UserRole.USER];
    default:
      return [];
  }
}