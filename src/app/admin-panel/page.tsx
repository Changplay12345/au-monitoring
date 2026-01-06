'use client'

import { useState, useEffect } from 'react'
import { GCPLayout } from '@/components/GCPLayout'
import { RoleGuard } from '@/components/RoleGuard'
import { getAllUsers, updateUserRole, deleteUser, updateUserInfo } from '@/lib/auth'
import { Users, Shield, Edit, Trash2, Save, X, User as UserIcon, Mail } from 'lucide-react'

interface UserData {
  id: string
  username: string
  email: string
  name: string | null
  role: 'admin' | 'user'
}

export default function AdminPanelPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserData>>({})

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const userData = await getAllUsers()
      setUsers(userData.map(user => ({
        id: String(user.id),
        username: String(user.username),
        email: String(user.email),
        name: user.name ? String(user.name) : null,
        role: (user.role as 'admin' | 'user') || 'user'
      })))
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const success = await updateUserRole(userId, newRole)
      if (success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ))
      }
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const success = await deleteUser(userId)
      if (success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleEditUser = (user: UserData) => {
    setEditingUser(user.id)
    setEditForm({ name: user.name, email: user.email })
  }

  const handleSaveUser = async (userId: string) => {
    try {
      const success = await updateUserInfo(userId, {
        name: editForm.name || undefined,
        email: editForm.email || undefined
      })
      if (success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, ...editForm } : u
        ))
        setEditingUser(null)
        setEditForm({})
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({})
  }

  return (
    <RoleGuard requiredRole="admin">
      <GCPLayout activeFeature="Admin Panel" projectName="Admin Panel">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              Admin Panel
            </h1>
            <p className="text-gray-600">Manage users, roles, and system settings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regular Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'user').length}
                  </p>
                </div>
                <UserIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                placeholder="Name"
                              />
                              <input
                                type="email"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                placeholder="Email"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <select
                              value={editForm.role || user.role}
                              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'user' })}
                              className="px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingUser === user.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveUser(user.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                                className="text-xs border border-gray-300 rounded px-1 py-1"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </GCPLayout>
    </RoleGuard>
  )
}
